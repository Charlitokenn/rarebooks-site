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

export const prerender = false;

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    const mobile = trimString(data?.mobile) || undefined;

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

    //Validate if provided appsumo code is exists in D1
    try {
      const db = env.DB;
      if (db) {
        // Use .first() for SELECT queries — returns the row object or null
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

        // Mark as redeemed (increment redeem_freq)
        await db
            .prepare("UPDATE redemptionCodes SET redeem_freq = redeem_freq + 1, last_updated = datetime('now') WHERE code = ?")
            .bind(appsumoCode)
            .run();
      }
    } catch (dbError: any) {
      console.error("Appsumo code validation failed:", dbError.message);
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
      try {
        const clerk = createClerkClient({
          secretKey: (env as any).CLERK_SECRET_KEY,
        });

        await clerk.users.createUser({
          firstName,
          lastName,
          emailAddress: [normalizedEmail],
          password: password,
          privateMetadata: {
            license: licenseKey
          }
        });

      } catch (clerkError: any) {
        const code = clerkError?.errors?.[0]?.code;
        if (code === "form_identifier_exists") {
          // The user already has a Clerk account (re-submission or returning
          // trial requester). Not a problem — log and move on.
          console.warn(
              `[Clerk] Account already exists for ${normalizedEmail} — skipping creation.`
          );
        } else {
          console.error(
              "[Clerk] User provisioning failed:",
              clerkError?.errors ?? clerkError?.message
          );
        }
      }
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