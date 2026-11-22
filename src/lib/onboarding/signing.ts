// The signed contract with the RareBooks control site (spec 0014 AC-6, AC-8).
//
// The same scheme hosted sites use (spec 0005, spec 0008 AC-5): `sha256=` plus the hex HMAC SHA256 of the exact
// body bytes under the shared secret, sent in `X-Books-Signature` both ways, with an `issued_at` inside 5
// minutes. `tests/onboarding/signing_vectors.json` must stay byte for byte identical to the copies in
// `rarebooks-web` and `rarebooks_control`.
//
// Pure Web Crypto, no imports, so it runs in the Worker and under `node --test`.

export const SIGNATURE_HEADER = "X-Books-Signature";
const SIGNATURE_PREFIX = "sha256=";
export const ISSUED_AT_WINDOW_MS = 5 * 60 * 1000;

const encoder = new TextEncoder();

function toBytes(value: string | Uint8Array): Uint8Array<ArrayBuffer> {
  if (typeof value === "string") {
    return encoder.encode(value);
  }
  // A copy on a plain ArrayBuffer, the form Web Crypto takes.
  const copy = new Uint8Array(value.byteLength);
  copy.set(value);
  return copy;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sign(body: string | Uint8Array, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, toBytes(body));
  return SIGNATURE_PREFIX + toHex(mac);
}

/** Constant time compare of the expected header with the one given. A missing secret or header never passes. */
export async function isValidSignature(
  body: string | Uint8Array,
  signature: string | null | undefined,
  secret: string | null | undefined,
): Promise<boolean> {
  if (!secret || typeof signature !== "string" || !signature) {
    return false;
  }
  const expected = encoder.encode(await sign(body, secret));
  const given = encoder.encode(signature);
  if (expected.length !== given.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < expected.length; index++) {
    difference |= expected[index] ^ given[index];
  }
  return difference === 0;
}

/** An ISO 8601 time with a zone, within 5 minutes of `now`. A naive or bad value is never fresh. */
export function isFresh(issuedAt: unknown, now: number = Date.now()): boolean {
  if (typeof issuedAt !== "string" || !/(Z|[+-]\d{2}:\d{2})$/.test(issuedAt)) {
    return false;
  }
  const time = Date.parse(issuedAt);
  return Number.isFinite(time) && Math.abs(now - time) <= ISSUED_AT_WINDOW_MS;
}

/** Now as UTC with `+00:00`, the form the control site writes. */
export function issuedNow(): string {
  return new Date().toISOString().replace("Z", "+00:00");
}
