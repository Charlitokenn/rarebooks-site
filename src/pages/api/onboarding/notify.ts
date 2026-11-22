// The control site's notice that a request is Ready or Failed (spec 0014 AC-6, AC-13). Accepted only when
// signed with the marketing secret and fresh; answered signed, echoing `issued_at`. A Resend failure answers a
// signed 503, so the control site sends it again. Each email is marked sent only after Resend took it: at
// least once, never zero times.

import { render } from "@react-email/render";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import * as React from "react";
import { Resend } from "resend";

import SiteFailedEmail from "../../../components/templates/site-failed-email.tsx";
import SiteReadyEmail from "../../../components/templates/site-ready-email.tsx";
import { AppConfig } from "../../../constants";
import {
  SIGNATURE_HEADER,
  isFresh,
  isValidSignature,
  sign,
} from "../../../lib/onboarding/signing.ts";
import {
  markEmailed,
  saveSignupFromNotice,
  signupByRequest,
} from "../../../lib/onboarding/signups.ts";

export const prerender = false;

async function signed(body: Record<string, unknown>, status: number): Promise<Response> {
  const data = JSON.stringify(body);
  const headers: Record<string, string> = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (env.CONTROL_SIGNING_SECRET) {
    headers[SIGNATURE_HEADER] = await sign(data, env.CONTROL_SIGNING_SECRET);
  }
  return new Response(data, { status, headers });
}

async function sendEmail(to: string, subject: string, element: React.ReactElement): Promise<boolean> {
  try {
    const { error } = await new Resend(env.RESEND_API_KEY).emails.send({
      from: `RareBooks <${AppConfig.emails.nonReply}>`,
      to,
      subject,
      html: await render(element),
    });
    return !error;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  const raw = new Uint8Array(await request.arrayBuffer());
  let body: Record<string, unknown> | null = null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(raw));
    body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    body = null;
  }
  const valid =
    body !== null &&
    (await isValidSignature(raw, request.headers.get(SIGNATURE_HEADER), env.CONTROL_SIGNING_SECRET)) &&
    isFresh(body.issued_at);
  if (!valid || !body) {
    return signed({}, 401);
  }
  const echo = { issued_at: body.issued_at };
  const { request_id: requestId, status, email, first_name: firstName } = body;
  if (
    typeof requestId !== "string" ||
    typeof email !== "string" ||
    (status !== "Ready" && status !== "Failed")
  ) {
    return signed({ ok: false, ...echo }, 400);
  }

  let row = await signupByRequest(requestId);
  if (!row) {
    await saveSignupFromNotice(requestId, email);
    row = await signupByRequest(requestId);
  }
  const column = status === "Ready" ? "ready_emailed_at" : "failed_emailed_at";
  if (row?.[column]) {
    return signed({ ok: true, ...echo }, 200);
  }

  const name = typeof firstName === "string" && firstName ? firstName : undefined;
  const sent =
    status === "Ready"
      ? await sendEmail(
          email,
          "Your RareBooks site is ready",
          React.createElement(SiteReadyEmail, {
            firstName: name,
            openUrl: `${env.PUBLIC_SITE_URL.replace(/\/+$/, "")}/dashboard/site/open`,
          }),
        )
      : await sendEmail(email, "We're on it: your RareBooks site", React.createElement(SiteFailedEmail, { firstName: name }));
  if (!sent) {
    console.error(`notify: Resend didn't take the ${status} email`);
    return signed({ ok: false, ...echo }, 503);
  }
  await markEmailed(requestId, column);
  return signed({ ok: true, ...echo }, 200);
};
