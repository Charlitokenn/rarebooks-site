/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// Declares the shape of your Cloudflare Worker's environment bindings.
// This types the `env` object imported from "cloudflare:workers" across
// every API route in the project.
//
// Tip: run `wrangler types` to auto-generate this from your wrangler.toml
// bindings instead of maintaining it by hand.

declare namespace App {
  interface Locals {
    countryCode: string;
  }
}

interface CloudflareEnv {
  DB: import("@cloudflare/workers-types").D1Database;
  RESEND_API_KEY: string;
  CLERK_SECRET_KEY: string;
  TURNSTILE_KEY: string;
  STORE_URL: string;
  // Spec 0014 (self serve onboarding).
  ONBOARDING_KV: import("@cloudflare/workers-types").KVNamespace;
  CONTROL_SITE_URL: string;
  CONTROL_SIGNING_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  PUBLIC_TURNSTILE_SITE_KEY: string;
  PUBLIC_SITE_URL: string;
}

declare module "cloudflare:workers" {
  export const env: CloudflareEnv;
}