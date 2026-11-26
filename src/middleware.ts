import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

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
export const onRequest = defineMiddleware((context, next) => {
  if (context.url.pathname.startsWith("/ingest/")) return next();
  return site(context, next);
});