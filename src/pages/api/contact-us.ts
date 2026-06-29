import type { APIRoute } from "astro";
import { Resend } from "resend";
import { render } from "@react-email/render";
import React from "react";
import { env } from "cloudflare:workers";

import { AppConfig } from "../../constants";
import TrialLicenseEmail from "../../components/templates/trial-license-sent";

import { isTanzania } from "../../constants/pricing";

export const prerender = false;

const countryCode = Astro.locals.countryCode || "US";
const isLocal = isTanzania(countryCode);

const resendKey = import.meta.env.RESEND_API_KEY;
// Note: We don't initialize Resend here globally because it might fail if the key is missing at load time.
// We'll initialize it inside the handler if needed, or use it carefully.

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const resend = new Resend(resendKey || env.RESEND_API_KEY);
    const contentType = request.headers.get("content-type") || "";
    let data: any;

    if (contentType.includes("application/json")) {
      data = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      // Fallback for cases where content-type might be missing or different
      // but the body is still JSON-like or form-data-like
      const text = await request.text();
      try {
        data = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        data = Object.fromEntries(params.entries());
      }
    }

    const { firstName, lastName, email, mobile, businessName, message } = data;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !businessName ||
      !message
    ) {
      console.warn("Missing required fields:", {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        mobile: !!mobile,
        businessName: !!businessName,
        message: !!message,
      });
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 },
      );
    }

    try {
      const emailResult = await resend.emails.send({
        //TODO: Change this email in production
        from: "Charles | RareBooks <onboarding@resend.dev>",
        to: AppConfig.supportEmail,
        subject: "New Enquiry Submission",
        html: `
            <h1>Hey,</h1>
            <p>Enquiry Details</p>
            <p>From: {firstName} {lastName}</p>
            <p>Business: {businessName}</p>
            <p>Email: {email}</p>
            <p>Mobile: {mobile}</p>
            <p>Message: {message}</p>
          `,
      });
    } catch (emailError) {
      console.error("Error sending email with Resend:", emailError);
      // We don't necessarily want to fail the whole request if the email fails,
      // but we should probably log it. The user already has the key in the response result.
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Error in license API route:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
