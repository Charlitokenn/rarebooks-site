import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { AppConfig } from "../../constants";
import {isTanzania} from "../../constants/pricing.ts";
import {Capitalize} from "@components/lib/utils.ts";
import {render} from "@react-email/render";
import React from "react";
import TrialLicenseEmail from "@components/templates/trial-license-sent.tsx";
import {Resend} from "resend";
import {createClerkClient} from "@clerk/backend";
import PortalAccessEmail from "@components/templates/portal-access-email.tsx";
import {tryStatement} from "@babel/types";

export const prerender = false;

const jsonHeaders = { "Content-Type": "application/json" };

function normalizeEmail(email: string): string {
  const [local, domain] = email.toLowerCase().trim().split("@");

  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Gmail: dots ignored, + aliases ignored
    return local.replace(/\./g, ".").split("+")[0] + "@gmail.com";
  }

  // All other providers: preserve dots and +, only normalize case
  return local + "@" + domain;
}

export const POST: APIRoute = async ({ request }) => {
  try {
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

    const firstName = trimString(Capitalize(data?.firstName));
    const lastName = trimString(Capitalize(data?.lastName));
    const rawEmail = trimString(data?.email);
    const mobile = trimString(data?.mobile) || undefined;
    const business = trimString(Capitalize(data?.businessName));
    const message = trimString(Capitalize(data?.message));

    if (
        !firstName ||
        !lastName ||
        !rawEmail ||
        !business ||
        !message ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
    ) {
      return new Response(
          JSON.stringify({
            message: "First name, last name, and a valid email are required",
          }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const normalizedEmail = normalizeEmail(rawEmail);

    const apiKey = env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
          JSON.stringify({ message: "Server configuration error" }),
          { status: 500, headers: jsonHeaders }
      );
    }

    try{
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: `Business Enquiry <${AppConfig.emails.nonReply}>`,
        to: AppConfig.emails.supportEmail,
        replyTo: normalizedEmail,
        subject: `New enquiry from ${firstName} ${lastName}`,
        html: `
          <p><strong>Business: </strong>${business}</p>
          <p><strong>Name: </strong>${firstName} ${lastName}</p>
          <p><strong>Email: </strong>${normalizedEmail}</p>
          <p><strong>Mobile: </strong>${mobile}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: jsonHeaders,
      });
    } catch(error){
      console.error("Failed to send enquiry email:", error);

      return new Response(JSON.stringify({
        success: false,
        message: "Failed to send enquiry email",
      }),{
        status: 500,
        headers: jsonHeaders,
      })
    }

  } catch (error: any) {
    console.error("FATAL error:", error);
    return new Response(
        JSON.stringify({ message: "Internal server error", detail: error.message }),
        { status: 500, headers: jsonHeaders }
    );
  }
};