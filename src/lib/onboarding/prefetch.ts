// A request a browser or a link scanner makes ahead of a real visit (spec 0023 AC-3, AC-4). It must never
// mint an owner link, so /welcome renders the Ready card for it and /welcome/open sends it back to /welcome.

export function isPrefetch(request: Request): boolean {
  if (request.method === "HEAD") {
    return true;
  }
  const purpose = `${request.headers.get("Sec-Purpose") ?? ""} ${request.headers.get("Purpose") ?? ""}`;
  return purpose.toLowerCase().includes("prefetch");
}
