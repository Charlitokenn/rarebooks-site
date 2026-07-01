import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { AppConfig } from "../../constants";

export const prerender = false;

const jsonHeaders = { "Content-Type": "application/json" };

export const GET: APIRoute = async ({ locals }) => {
  try {
    const apiKey = env.KEYMINT_API_KEY;
    if (!apiKey) {
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

    const fetchUrl = `https://api.keymint.dev/key?productId=${encodeURIComponent(AppConfig.keymint.productId)}&licenseKey=${encodeURIComponent(kmLicence)}`

    // Fetch customer licenses from KeyMint by email
    const kmResponse = await fetch( fetchUrl,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
    );

    if (!kmResponse.ok) {
      const errorText = await kmResponse.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        /* ignore */
      }

      if (kmResponse.status === 404) {
        return new Response(
            JSON.stringify({
              message: "No license found",
              data: null,
              code: 1,
            }),
            { status: 200, headers: jsonHeaders }
        );
      }

      return new Response(
          JSON.stringify({
            message: errorData.message || "Failed to fetch license info",
            code: errorData.code || -1,
          }),
          { status: kmResponse.status, headers: jsonHeaders }
      );
    }

    const responseText = await kmResponse.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      return new Response(
          JSON.stringify({ message: "Invalid response from license server" }),
          { status: 502, headers: jsonHeaders }
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error: any) {
    console.error("FATAL error fetching license:", error);
    return new Response(
        JSON.stringify({ message: "Internal server error", detail: error.message }),
        { status: 500, headers: jsonHeaders }
    );
  }
};