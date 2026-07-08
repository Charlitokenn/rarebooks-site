import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { defineMiddleware, sequence } from "astro:middleware";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Your existing Clerk auth middleware
const clerk = clerkMiddleware((auth, context) => {
  // Geo logic (always runs)
  const headers = context.request.headers;
  let countryCode =
      headers.get("cf-ipcountry") ||
      headers.get("x-vercel-ip-country") ||
      headers.get("x-country") ||
      headers.get("cloudfront-viewer-country") ||
      "US";

  context.locals.countryCode = countryCode;

  // Auth logic (only blocks protected routes)
  const { isAuthenticated, redirectToSignIn } = auth();

  if (!isAuthenticated && isProtectedRoute(context.request)) {
    return redirectToSignIn();
  }
});

// FIX: Prevent Cloudflare from modifying HTML (Rocket Loader, Auto Minify, etc.)
const noTransform = defineMiddleware(async (context, next) => {
  const response = await next();

  // Append no-transform to existing Cache-Control if present
  const existing = response.headers.get("Cache-Control") || "";
  if (!existing.includes("no-transform")) {
    response.headers.set(
        "Cache-Control",
        existing ? `${existing}, no-transform` : "no-transform"
    );
  }

  return response;
});

// Run Clerk first, then add headers
// If Clerk returns a redirect, sequence stops and skips noTransform
export const onRequest = sequence(clerk, noTransform);