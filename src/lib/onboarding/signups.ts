// The D1 `signups` table: one row per Clerk user, pointing at their Books Signup on the control site
// (spec 0014, data model). It holds no password link and no site address.

import { env } from "cloudflare:workers";

export interface SignupRow {
  clerk_user_id: string;
  email: string;
  request_id: string;
  created_at: string;
  ready_emailed_at: string | null;
  failed_emailed_at: string | null;
}

export async function signupByUser(clerkUserId: string): Promise<SignupRow | null> {
  return env.DB.prepare("SELECT * FROM signups WHERE clerk_user_id = ?")
    .bind(clerkUserId)
    .first<SignupRow>();
}

export async function signupByRequest(requestId: string): Promise<SignupRow | null> {
  return env.DB.prepare("SELECT * FROM signups WHERE request_id = ?").bind(requestId).first<SignupRow>();
}

/** Insert, or keep the row with the same `request_id` on a retry (AC-3). */
export async function saveSignup(clerkUserId: string, email: string, requestId: string): Promise<void> {
  // A notice may have written this request's row first, keyed by the request (`saveSignupFromNotice`); it
  // becomes this user's row, so its emailed marks are kept.
  await env.DB.prepare(
    "UPDATE signups SET clerk_user_id = ? WHERE request_id = ? AND clerk_user_id = ?",
  )
    .bind(clerkUserId, requestId, `request:${requestId}`)
    .run();
  await env.DB.prepare(
    `INSERT INTO signups (clerk_user_id, email, request_id, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(clerk_user_id) DO UPDATE SET request_id = excluded.request_id, email = excluded.email`,
  )
    .bind(clerkUserId, email, requestId, new Date().toISOString())
    .run();
}

/**
 * A notice for a request this Worker has no row for still writes one (AC-6). Its Clerk user isn't known here,
 * so the row is keyed by the request until the user's own status read writes theirs.
 */
export async function saveSignupFromNotice(requestId: string, email: string): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO signups (clerk_user_id, email, request_id, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(clerk_user_id) DO NOTHING`,
  )
    .bind(`request:${requestId}`, email, requestId, new Date().toISOString())
    .run();
}

export async function markEmailed(requestId: string, column: "ready_emailed_at" | "failed_emailed_at") {
  await env.DB.prepare(`UPDATE signups SET ${column} = ? WHERE request_id = ?`)
    .bind(new Date().toISOString(), requestId)
    .run();
}
