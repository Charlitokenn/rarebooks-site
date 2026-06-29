import type { APIRoute } from "astro";
import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";
import { DisposableEmailChecker } from "@usex/disposable-email-domains";

import { AppConfig } from "../../constants";
import TrialLicenseEmail from "../../components/templates/trial-license-sent";
import { isTanzania } from "../../constants/pricing";

export const prerender = false;

function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return local.replace(/\./g, "").split("+")[0] + "@gmail.com";
  }
  if (["outlook.com", "hotmail.com", "live.com"].includes(domain)) {
    return local.split("+")[0] + "@" + domain;
  }
  return local + "@" + domain;
}

const jsonHeaders = { "Content-Type": "application/json" };

export const GET: APIRoute = async ({ locals }) => {
  const runtime = (locals as any)?.runtime;
  const env = runtime?.env || {};
  return new Response(
      JSON.stringify({
        ok: true,
        envKeys: Object.keys(env),
        hasDb: !!env.DB,
        hasResend: !!env.RESEND_API_KEY,
        hasKeymint: !!env.KEYMINT_API_KEY,
      }),
      { status: 200, headers: jsonHeaders }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const runtime = (locals as any)?.runtime;
    const env = runtime?.env || {};

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

    const firstName = trimString(data?.firstName);
    const lastName = trimString(data?.lastName);
    const rawEmail = trimString(data?.email);
    const mobile = trimString(data?.mobile) || undefined;

    if (!firstName || !lastName || !rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return new Response(
          JSON.stringify({ message: "First name, last name, and a valid email are required" }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const normalizedEmail = normalizeEmail(rawEmail);

    // ✅ FIX: Instantiate checker INSIDE the handler, not at module level
    const checker = new DisposableEmailChecker({
      disposableDomainsUrl:
          "https://cdn.jsdelivr.net/gh/ali-master/disposable-email-domains@latest/domains.json",
      enableCaching: true,
      cacheSize: 1000,
      checkMxRecord: false,
    });

    const checkResult = await checker.checkEmail(normalizedEmail);
    if (checkResult.isDisposable) {
      return new Response(
          JSON.stringify({ message: "Disposable email addresses are not allowed" }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const apiKey = env.KEYMINT_API_KEY;
    if (!apiKey) {
      return new Response(
          JSON.stringify({ message: "Server configuration error" }),
          { status: 500, headers: jsonHeaders }
      );
    }

    const expiryDate = new Date();
    const daysToExpiry = isLocal
        ? +AppConfig.trial.localDuration
        : +AppConfig.trial.abroadDuration;
    expiryDate.setDate(expiryDate.getDate() + daysToExpiry);

    const keymintBody = {
      productId: AppConfig.keymint.productId,
      maxActivations: "2",
      newCustomer: {
        name: `${firstName} ${lastName}`,
        email: normalizedEmail,
      },
      metadata: { is_trial: true },
      amountKeys: "1",
      expiryDate: expiryDate.toISOString(),
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

    // ✅ FIX: Read body as text first, then safely parse
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
        userMessage = "A trial license has already been issued for this email.";
      } else if (kmResponse.status === 429) {
        userMessage = "Too many requests.";
      }

      return new Response(
          JSON.stringify({ message: userMessage, details: errorData.message || null, code: errorCode }),
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
      try {
        const html = await render(
            React.createElement(TrialLicenseEmail, {
              firstName,
              licenseKey,
              expiryDate: expiryDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
              storeUrl: AppConfig.storeUrl,
              isLocal,
            }),
        );

        const resend = new Resend(env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Charles | RareBooks <support@rarebooks.cc>",
          to: normalizedEmail,
          subject: "Your Trial License Key",
          html,
        });
      } catch (emailError) {
        console.error("Email send failed:", emailError);
      }

      try {
        const db = env.DB;
        if (db) {
          await db
              .prepare(
                  "INSERT INTO trials (first_name, last_name, email, mobile, expiry_date, license_key, subscription_amount) VALUES (?, ?, ?, ?, ?, ?, ?)"
              )
              .bind(firstName, lastName, normalizedEmail, mobile || null, expiryDate.toISOString(), licenseKey, 0)
              .run();
        }
      } catch (dbError: any) {
        console.error("D1 save failed:", dbError.message);
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