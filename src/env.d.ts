declare namespace App {
    interface Locals {
        countryCode: string;
    }
}

interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
    KEYMINT_API_KEY: string;
    RESEND_API_KEY: string;
    TURNSTILE_KEY: string;
    STORE_URL: string;
}