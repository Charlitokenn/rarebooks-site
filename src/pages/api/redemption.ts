import type { APIRoute } from "astro";
import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";
import { env } from "cloudflare:workers";
import { createClerkClient } from "@clerk/backend";
import { AppConfig } from "../../constants";
import { isTanzania } from "../../constants/pricing";
import { Capitalize } from "../../components/lib/utils.ts"
import RedemptionEmail from "@components/templates/redemption-email.tsx";
import PortalAccessEmail from "@components/templates/portal-access-email.tsx";

export const prerender = false;

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");

  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Gmail: dots ignored, + aliases ignored
    return local.replace(/\./g, ".").split("+")[0] + "@gmail.com";
  }

  // All other providers: preserve dots and +, only normalize case
  return local + "@" + domain;
}

// Uses the Web Crypto API available globally in the Cloudflare Worker runtime.
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function generatePassword(length = 8): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
      .map((b) => CHARSET[b % CHARSET.length])
      .join("");
}

const jsonHeaders = { "Content-Type": "application/json" };

// ── Routes ────────────────────────────────────────────────────────────────────

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: jsonHeaders,
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const countryCode = (locals as any)?.countryCode || "US";
    const isLocal = isTanzania(countryCode);

    const contentType = request.headers.get("content-type") || "";
    let data: any = {};

    if (contentType.includes("application/json")) {
      const bodyText = await request.text();
      try {
        data = JSON.parse(bodyText);
      } catch {
        return new Response(
            JSON.stringify({ message: "Invalid JSON in request body" }),
            { status: 400, headers: jsonHeaders }
        );
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      const text = await request.text();
      try {
        data = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        data = Object.fromEntries(params.entries());
      }
    }

    const trimString = (value: unknown) =>
        typeof value === "string" ? value.trim() : "";

    const firstName = Capitalize(trimString(data?.firstName));
    const lastName = Capitalize(trimString(data?.lastName));
    const password = trimString(data?.password);
    const rawEmail = trimString(data?.email);
    const appsumoCode = trimString(data?.redeemCode);

    if (
        !firstName   ||
        !lastName    ||
        !rawEmail    ||
        !password    ||
        !appsumoCode ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
    ) {
      return new Response(
          JSON.stringify({
            message: "First name, last name, email, password, and appsumo code are required",
          }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const normalizedEmail = normalizeEmail(rawEmail);

    //Validate the appsumo code exists in D1 and hasn't been redeemed yet.
    //
    // This uses a single atomic UPDATE ... WHERE redeem_freq = 0 instead of
    // a SELECT followed by an UPDATE. That matters: with a separate SELECT
    // check first, two requests for the same code arriving at nearly the
    // same time could both pass the check before either UPDATE lands,
    // letting the code be redeemed twice. Binding the "already redeemed"
    // condition into the UPDATE's WHERE clause means only one request can
    // ever flip redeem_freq from 0 -> 1 for a given code.
    try {
      const db = env.DB;
      if (db) {
        const claim = await db
            .prepare(
                "UPDATE redemptionCodes SET redeem_freq = redeem_freq + 1, last_updated = datetime('now') WHERE code = ? AND redeem_freq = 0"
            )
            .bind(appsumoCode)
            .run();

        if (claim.meta.changes === 0) {
          // Either the code doesn't exist, or it's already been redeemed.
          // Look it up to tell the two cases apart for a clearer error.
          const codeRow = await db
              .prepare("SELECT code, redeem_freq FROM redemptionCodes WHERE code = ?")
              .bind(appsumoCode)
              .first<{ code: string; redeem_freq: number }>();

          if (!codeRow) {
            return new Response(
                JSON.stringify({ message: "Invalid redemption code" }),
                { status: 400, headers: jsonHeaders }
            );
          }

          return new Response(
              JSON.stringify({ message: "This redemption code has already been used" }),
              { status: 409, headers: jsonHeaders }
          );
        }
      }
    } catch (dbError: any) {
      console.error("Appsumo code validation failed:", dbError.message);
      // Unlike an invalid/reused code, a DB error here means we can't
      // verify the code at all — fail closed rather than letting an
      // unverifiable redemption through.
      return new Response(
          JSON.stringify({ message: "Unable to verify redemption code. Please try again." }),
          { status: 500, headers: jsonHeaders }
      );
    }


    const apiKey = env.KEYMINT_API_KEY;
    if (!apiKey) {
      return new Response(
          JSON.stringify({ message: "Server configuration error" }),
          { status: 500, headers: jsonHeaders }
      );
    }

    const keymintBody = {
      productId: AppConfig.keymint.productId,
      maxActivations: "3",
      newCustomer: {
        name: `${firstName} ${lastName}`,
        email: normalizedEmail,
      },
      metadata: { is_trial: false },
      amountKeys: "1",
      expiryDate: "",
      format: {
        sections: 4,
        sectionLength: 5,
        separator: "-",
        charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        prefix: "RARE-",
        suffix: "-BOOKS",
        case: "upper",
      },
    };

    const kmResponse = await fetch("https://api.keymint.dev/key", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keymintBody),
    });

    const responseText = await kmResponse.text();

    if (!kmResponse.ok) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch {
        /* ignore */
      }

      let userMessage = "Failed to generate license key";
      const errorCode = errorData.code;

      if (kmResponse.status === 400) {
        userMessage = "Invalid request parameters.";
      } else if (kmResponse.status === 401) {
        userMessage = "Server configuration error (Unauthorized).";
      } else if (kmResponse.status === 403) {
        if (errorCode === 2) userMessage = "License limit reached.";
        else if (errorCode === 3) userMessage = "Unauthorized device access.";
        else userMessage = "Access forbidden.";
      } else if (kmResponse.status === 404) {
        userMessage = "Product not found.";
      } else if (kmResponse.status === 409) {
        userMessage =
            "A trial license has already been issued for this email.";
      } else if (kmResponse.status === 429) {
        userMessage = "Too many requests.";
      }

      return new Response(
          JSON.stringify({
            message: userMessage,
            details: errorData.message || null,
            code: errorCode,
          }),
          { status: kmResponse.status, headers: jsonHeaders }
      );
    }

    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("Keymint returned non-JSON:", responseText);
      return new Response(
          JSON.stringify({ message: "Invalid response from license server" }),
          { status: 502, headers: jsonHeaders }
      );
    }

    const licenseKey = Array.isArray(result) ? result[0]?.key : result?.key;

    if (licenseKey) {
      // ── 1. Send lifetime license email via Resend ──────────────────────────────
      try {
        const html = await render(
            React.createElement(RedemptionEmail, {
              firstName,
              licenseKey,
            })
        );

        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: `Charles | RareBooks <${AppConfig.emails.supportEmail}>`,
          to: normalizedEmail,
          subject: "Your redeemed lifetime subscription!",
          html,
        });
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }

      // ── Add the sumolings to D1 database ──────────────────────────────────────
      try {
        const db = env.DB;
        if (db) {
          await db
              .prepare(
                  "INSERT INTO sumolings (first_name, last_name, email, license_key) VALUES (?, ?, ?, ?)"
              )
              .bind(
                  firstName,
                  lastName,
                  normalizedEmail,
                  licenseKey,
              )
              .run();
        }
      } catch (dbError: any) {
        console.error("D1 save failed:", dbError.message);
      }

      // ── 3. Provision a Clerk account for the trial user ─────────────────────
      // Best-effort: a failure here must not affect the license key response.
      //
      // Per Clerk docs, createUser() auto-verifies any email address and phone
      // number — no separate verification calls needed.
      // See: https://clerk.com/docs/reference/backend/user/create-user
      //
      // `env` is imported from "cloudflare:workers" (Astro 6 + @astrojs/cloudflare
      // pattern). No locals.runtime.env needed.
      let signInToken: string | null = null;
      let usedFallbackPassword = false;

      // Clerk error codes that mean "the password itself is the problem",
      // as opposed to a config/network/other issue we shouldn't paper over.
      const PASSWORD_REJECTION_CODES = new Set([
        "form_password_not_strong_enough",
        "form_password_pwned",
        "form_password_size_in_bytes_exceeded",
        "form_password_validation_failed",
      ]);

      try {
        const clerk = createClerkClient({
          secretKey: (env as any).CLERK_SECRET_KEY,
        });

        let clerkUserId: string | undefined;

        try {
          const newUser = await clerk.users.createUser({
            firstName,
            lastName,
            emailAddress: [normalizedEmail],
            password: password,
            privateMetadata: {
              license: licenseKey
            }
          });

          clerkUserId = newUser.id;
        } catch (clerkError: any) {
          const code = clerkError?.errors?.[0]?.code;

          if (code === "form_identifier_exists") {
            // The user already has a Clerk account (re-submission or returning
            // trial requester). Look them up so we can still hand them a
            // sign-in token below — not a problem, just log and continue.
            console.warn(
                `[Clerk] Account already exists for ${normalizedEmail} — reusing it.`
            );
            const existing = await clerk.users.getUserList({
              emailAddress: [normalizedEmail],
            });
            clerkUserId = existing.data[0]?.id;
          } else if (code && PASSWORD_REJECTION_CODES.has(code)) {
            // The password the user typed on the redemption form didn't pass
            // Clerk's strength check. Their license key has already been
            // generated and emailed by this point, so we don't want to fail
            // the whole request over this — fall back to a strong,
            // server-generated password (same approach the trial flow uses)
            // and email it to them so they still get a working account.
            console.warn(
                `[Clerk] Password rejected for ${normalizedEmail} (${code}) — retrying with a generated password.`
            );

            const fallbackPassword = generatePassword(12);

            try {
              const fallbackUser = await clerk.users.createUser({
                firstName,
                lastName,
                emailAddress: [normalizedEmail],
                password: fallbackPassword,
                privateMetadata: {
                  license: licenseKey
                }
              });

              clerkUserId = fallbackUser.id;
              usedFallbackPassword = true;

              const html = await render(
                  React.createElement(PortalAccessEmail, {
                    firstName,
                    email: normalizedEmail,
                    password: fallbackPassword,
                  })
              );

              const resend = new Resend(env.RESEND_API_KEY);
              await resend.emails.send({
                from: `Charles | RareBooks <${AppConfig.emails.supportEmail}>`,
                to: normalizedEmail,
                subject: `${firstName}, your client portal is ready!`,
                html
              });
            } catch (fallbackError: any) {
              console.error(
                  "[Clerk] Fallback account creation failed:",
                  fallbackError?.errors ?? fallbackError?.message
              );
            }
          } else {
            console.error(
                "[Clerk] User provisioning failed:",
                clerkError?.errors ?? clerkError?.message
            );
          }
        }

        // ── Mint a short-lived sign-in token so the client can log the user
        // in automatically right after redemption.
        // https://clerk.com/docs/guides/development/custom-flows/authentication/embedded-email-links
        if (clerkUserId) {
          const tokenResponse = await clerk.signInTokens.createSignInToken({
            userId: clerkUserId,
            expiresInSeconds: 60 * 5, // 5 minutes — it's consumed immediately
          });
          signInToken = tokenResponse.token;
        }
      } catch (signInTokenError: any) {
        // Best-effort — worst case the user lands on /auth/sign-in manually.
        console.error("[Clerk] Sign-in token creation failed:", signInTokenError);
      }

      try {
        const notification = await fetch('https://ntfy.sh/rarebooks-hFHzxdmSMa', {
          method: 'POST',
          headers: {
            'Title': 'New AppSumo Redemption',
            'Tags': 'tada, AppSumo_Client',
            'Click': 'https://app.keymint.dev/dashboard/org-calm-mountain-80007672/licenses',
            'Markdown': 'yes',
          },
          body: `
            ![ChaChing](https://t4.ftcdn.net/jpg/15/68/48/25/360_F_1568482583_TUDgw6WAo5f8nW8bbDfsdMSqwIhCDcdH.jpg)
            
            Client Name: ${firstName} ${lastName}
            Email Address: ${normalizedEmail}
          `,
        })

        return notification

      } catch (error) {
        console.error("Failed to send notification",error)
      }

      const responsePayload = Array.isArray(result)
          ? { keys: result, signInToken, usedFallbackPassword }
          : { ...result, signInToken, usedFallbackPassword };

      return new Response(JSON.stringify(responsePayload), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error: any) {
    console.error("FATAL error:", error);
    return new Response(
        JSON.stringify({ message: "Internal server error", detail: error.message }),
        { status: 500, headers: jsonHeaders }
    );
  }
};