import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.text();
  return new Response(JSON.stringify({ received: true, bodyLength: body.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};