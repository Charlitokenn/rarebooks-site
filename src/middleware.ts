import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";

import { LEGACY_REDIRECT_STATUS, WELCOME_ROUTE, legacyTarget } from "./lib/redirects.ts";

// Spec 0023 AC-1: /welcome and everything under it, never /welcomefoo.
const isProtectedRoute = createRouteMatcher([WELCOME_ROUTE]);

const clerk = clerkMiddleware((auth, context) => {
  const headers = context.request.headers;
  let countryCode =
      headers.get("cf-ipcountry") ||
      headers.get("x-vercel-ip-country") ||
      headers.get("x-country") ||
      headers.get("cloudfront-viewer-country") ||
      "US";
  context.locals.countryCode = countryCode;

  const { isAuthenticated, redirectToSignIn } = auth();
  if (!isAuthenticated && isProtectedRoute(context.request)) {
    return redirectToSignIn();
  }
});

const noTransform = defineMiddleware(async (context, next) => {
  const response = await next();
  const existing = response.headers.get("Cache-Control") || "";
  if (!existing.includes("no-transform")) {
    response.headers.set("Cache-Control", existing ? `${existing}, no-transform` : "no-transform");
  }
  return response;
});

const site = sequence(clerk, noTransform);

// Spec 0022 AC-8: the PostHog proxy (/ingest) skips Clerk and the cache header, so an analytics call never
// pays for a session check or gets a sign in redirect.
// Spec 0023 AC-9: old /dashboard links are sent to /welcome before Clerk runs, keeping the query string. Only
// GET and HEAD; any other method goes on to Clerk and the router, which have no /dashboard route (404).
export const onRequest = defineMiddleware((context, next) => {
  const { pathname, search } = context.url;
  if (pathname.startsWith("/ingest/")) return next();
  const legacy = legacyTarget(pathname);
  if (legacy && (context.request.method === "GET" || context.request.method === "HEAD")) {
    return new Response(null, {
      status: LEGACY_REDIRECT_STATUS,
      headers: { Location: `${legacy}${search}`, "Cache-Control": "no-store" },
    });
  }
  return site(context, next);
});