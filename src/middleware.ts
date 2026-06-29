import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

//TODO: Change back to dashboard
const isProtectedRoute = createRouteMatcher(['/redemption(.*)']);

export const onRequest = clerkMiddleware((auth, context) => {
    // Geo logic (always runs)
    const headers = context.request.headers;
    let countryCode = headers.get("cf-ipcountry") ||
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