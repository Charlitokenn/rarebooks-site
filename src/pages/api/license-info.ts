import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { NormalizeEmail } from "../../components/lib/utils";

export const prerender = false;

const jsonHeaders = { "Content-Type": "application/json" };

export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get("email");
    if (!email) {
      return new Response(
          JSON.stringify({ message: "Email parameter is required" }),
          { status: 400, headers: jsonHeaders }
      );
    }

    const normalizedEmail = NormalizeEmail(email);
    const apiKey = env.KEYMINT_API_KEY;
    if (!apiKey) {
      return new Response(
          JSON.stringify({ message: "Server configuration error" }),
          { status: 500, headers: jsonHeaders }
      );
    }

    // Fetch customer licenses from KeyMint by email
    const kmResponse = await fetch(
        `https://api.keymint.dev/customer/license?email=${encodeURIComponent(normalizedEmail)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
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
              message: "No license found for this account",
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