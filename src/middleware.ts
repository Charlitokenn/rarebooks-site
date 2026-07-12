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

export const onRequest = sequence(clerk, noTransform);