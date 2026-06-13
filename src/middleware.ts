import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const headers = context.request.headers;

    // Try multiple geo headers for cross-platform compatibility
    let countryCode =
        headers.get("cf-ipcountry") ||           // Cloudflare
        headers.get("x-vercel-ip-country") ||    // Vercel
        headers.get("x-country") ||              // Netlify
        headers.get("cloudfront-viewer-country") || // AWS
        "US";                                      // Fallback

    console.log("Geo Debug:", {
        countryCode,
        cf: headers.get("cf-ipcountry"),
        vercel: headers.get("x-vercel-ip-country"),
        netlify: headers.get("x-country"),
        aws: headers.get("cloudfront-viewer-country"),
        userAgent: headers.get("user-agent")?.slice(0, 50),
    });

    context.locals.countryCode = countryCode;
    return next();
});