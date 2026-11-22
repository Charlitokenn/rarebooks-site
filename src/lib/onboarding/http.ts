// JSON answers for the onboarding routes: `{ message }` on errors, like every API route here.

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers });
}

export function failure(message: string, status: number, extra: Record<string, unknown> = {}): Response {
  return json({ message, ...extra }, status);
}

/** The request's JSON object, or null when the body isn't one. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const data = JSON.parse(await request.text());
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}
