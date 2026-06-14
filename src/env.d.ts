declare namespace App {
    interface Locals extends import("@astrojs/cloudflare").Runtime<Env> {
        countryCode: string;
    }
}

interface Env {
    DB: import("@cloudflare/workers-types").D1Database;
}