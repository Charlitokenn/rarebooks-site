import { defineMiddleware, sequence } from "astro:middleware";

const needsAuthPrefixes = ["/dashboard", "/auth", "/redemption"];

function needsClerk(pathname: string) {
  return needsAuthPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

const conditionalClerk = defineMiddleware(async (context, next) => {
  if (!needsClerk(context.url.pathname)) {
    return next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/astro/server");
  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

  const clerk = clerkMiddleware((auth, ctx) => {
    const headers = ctx.request.headers;
    const countryCode =
        headers.get("cf-ipcountry") ||
        headers.get("x-vercel-ip-country") ||
        headers.get("x-country") ||
        headers.get("cloudfront-viewer-country") ||
        "US";

    ctx.locals.countryCode = countryCode;

    const { isAuthenticated, redirectToSignIn } = auth();
    if (!isAuthenticated && isProtectedRoute(ctx.request)) {
      return redirectToSignIn();
    }
  });

  return clerk(context, next);
});

const noTransform = defineMiddleware(async (context, next) => {
  const response = await next();
  const existing = response.headers.get("Cache-Control") || "";
  if (!existing.includes("no-transform")) {
    response.headers.set("Cache-Control", existing ? `${existing}, no-transform` : "no-transform");
  }
  return response;
});

export const onRequest = sequence(conditionalClerk, noTransform);