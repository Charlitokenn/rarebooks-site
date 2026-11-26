// The PostHog proxy logic behind src/pages/ingest/[...path].ts (spec 0022 AC-8), kept here so tests can call
// it without the Astro runtime. The paths follow PostHog's Cloudflare proxy guide and what posthog-js 1.455
// requests: the library and its extensions under /static/, the remote config under /array/ (both from the
// assets host), everything else (events, /flags) from the API host.

const API_HOST = "https://eu.i.posthog.com";
const ASSETS_HOST = "https://eu-assets.i.posthog.com";
const ASSET_PREFIXES = ["/static/", "/array/"];
const FORWARDED_REQUEST_HEADERS = ["content-type", "content-encoding", "accept", "user-agent"];
const PASSED_RESPONSE_HEADERS = ["content-type", "cache-control"];

/** The PostHog URL for an /ingest request: the path after /ingest, with the query string kept. */
export function upstreamUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  const path = url.pathname.replace(/^\/ingest(?=\/|$)/, "") || "/";
  const host = ASSET_PREFIXES.some((prefix) => path.startsWith(prefix)) ? ASSETS_HOST : API_HOST;
  return `${host}${path}${url.search}`;
}

/** Only the four allowed request headers, plus X-Forwarded-For from cf-connecting-ip for geolocation. */
export function upstreamHeaders(incoming: Headers): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = incoming.get(name);
    if (value !== null) headers.set(name, value);
  }
  const ip = incoming.get("cf-connecting-ip");
  if (ip) headers.set("X-Forwarded-For", ip);
  return headers;
}

export async function forward(request: Request, fetcher: typeof fetch = fetch): Promise<Response> {
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  let upstream: Response;
  try {
    upstream = await fetcher(upstreamUrl(request.url), {
      method: request.method,
      headers: upstreamHeaders(request.headers),
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch {
    // PostHog unreachable: an empty 502, and the page carries on (AC-9).
    return new Response(null, { status: 502 });
  }
  const headers = new Headers();
  for (const name of PASSED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}
