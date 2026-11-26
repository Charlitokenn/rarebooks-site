// The first party PostHog proxy (spec 0022 AC-8). The PostHog snippet uses `api_host: "/ingest"`, so the
// library, its remote config and every event come through rarebooks.cc and ad blockers don't hide visitors.
// It forwards only to the two PostHog EU hosts, sends only four request headers (never the visitor's cookies,
// the Clerk session or any cf-* header) and skips clerkMiddleware (src/middleware.ts).
import type { APIRoute } from "astro";
import { forward } from "../../lib/marketing/ingest.ts";

export const prerender = false;

export const GET: APIRoute = ({ request }) => forward(request);
export const POST: APIRoute = ({ request }) => forward(request);
export const OPTIONS: APIRoute = ({ request }) => forward(request);
