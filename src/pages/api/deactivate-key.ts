import type { APIRoute } from "astro";
import {env} from "cloudflare:workers";
import {AppConfig} from "../../constants";

const jsonHeaders = { "Content-Type": "application/json" };

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const keymintApiKey = env.KEYMINT_CLIENT_API_KEY;
    if (!keymintApiKey) {
      return new Response(
          JSON.stringify({ message: "Server configuration error" }),
          { status: 500, headers: jsonHeaders }
      );
    }

    const { isAuthenticated } = locals.auth()
    if (!isAuthenticated) {
      return new Response("Unauthorized", { status: 401});
    }

    const user = await locals.currentUser();
    if(!user){
      return new Response("Unauthorized", { status: 401 });
    }

    const kmLicence = user.privateMetadata.license
    if(typeof kmLicence !== "string" || !kmLicence) {
      return new Response(JSON.stringify({ error: "No license on file"}), { status: 400 });
    }

    // ── 3. Parse & validate request body ──
    let body: { hostId?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(
          JSON.stringify({ error: "Invalid JSON body" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { hostId } = body;
    if (!hostId || typeof hostId !== "string") {
      return new Response(
          JSON.stringify({ error: "hostId is required and must be a string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── 4. Call KeyMint API ──
    const productId = AppConfig.keymint.productId;

    if (!productId || !keymintApiKey) {
      console.error("Missing KEYMINT_PRODUCT_ID or KEYMINT_API_KEY env vars");
      return new Response(
          JSON.stringify({ error: "Server configuration error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const keymintRes = await fetch("https://api.keymint.dev/key/deactivate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keymintApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        licenseKey: kmLicence,
        hostId,
      }),
    });

    const data = await keymintRes.json().catch(() => ({}));

    return new Response(JSON.stringify(data), {
      status: keymintRes.status,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Deactivate key error:", err);
    return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};