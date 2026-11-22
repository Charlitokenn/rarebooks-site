import * as React from "react";
import { Button } from "@components/components/ui/button";
import { Input } from "@components/components/ui/input";
import { Label } from "@components/components/ui/label";
import { AppConfig } from "../../constants";

// The start form (spec 0014 AC-1 to AC-3): a subdomain with its live check, a company name, and Turnstile.
// The owner's email and name come from Clerk on the server, never from this form.

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

type Check =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "available" }
  | { state: "refused"; reason: string }
  | { state: "slow" }
  | { state: "error" };

const DEBOUNCE_MS = 400;

function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function StartForm({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [subdomain, setSubdomain] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [check, setCheck] = React.useState<Check>({ state: "idle" });
  const [token, setToken] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<{ message: string; field?: string } | null>(null);
  const widget = React.useRef<HTMLDivElement>(null);
  const widgetId = React.useRef<string | undefined>(undefined);

  // Turnstile renders once its script has loaded (it loads with `render=explicit`).
  React.useEffect(() => {
    let cancelled = false;
    const mount = () => {
      if (cancelled || !widget.current || widgetId.current !== undefined) {
        return;
      }
      if (!window.turnstile) {
        window.setTimeout(mount, 200);
        return;
      }
      widgetId.current = window.turnstile.render(widget.current, {
        sitekey: turnstileSiteKey,
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    mount();
    return () => {
      cancelled = true;
    };
  }, [turnstileSiteKey]);

  // The live check, debounced 400 ms (AC-2).
  React.useEffect(() => {
    const label = subdomain.trim().toLowerCase();
    if (!label) {
      setCheck({ state: "idle" });
      return;
    }
    setCheck({ state: "checking" });
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/onboarding/check-subdomain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subdomain: label }),
          signal: controller.signal,
        });
        if (response.status === 429) {
          setCheck({ state: "slow" });
          return;
        }
        const data = (await response.json()) as { available?: boolean; reason?: string };
        if (!response.ok) {
          setCheck({ state: "error" });
        } else if (data.available) {
          setCheck({ state: "available" });
        } else {
          setCheck({ state: "refused", reason: data.reason || "taken" });
        }
      } catch (caught) {
        if ((caught as Error).name !== "AbortError") {
          setCheck({ state: "error" });
        }
      }
    }, DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [subdomain]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: subdomain.trim().toLowerCase(),
          company_name: company.trim(),
          time_zone: browserZone(),
          turnstile_token: token,
        }),
      });
      if (response.ok) {
        window.location.assign("/dashboard");
        return;
      }
      const data = (await response.json().catch(() => ({}))) as { message?: string; field?: string };
      setError({ message: data.message || "Something went wrong. Try again.", field: data.field });
      window.turnstile?.reset(widgetId.current);
      setToken("");
    } catch {
      setError({ message: "We couldn't reach the server. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  const trimmedCompany = company.trim();
  const canSubmit =
    !submitting && Boolean(subdomain.trim()) && trimmedCompany.length > 0 && trimmedCompany.length <= 140 && Boolean(token);

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-lg space-y-6 rounded-xl border bg-card p-6" noValidate>
      <div>
        <h2 className="text-xl font-semibold">Create your RareBooks site</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick your address and company name. Your 30 day trial starts when your site is ready.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdomain">Your address</Label>
        <div className="flex items-center gap-2">
          <Input
            id="subdomain"
            name="subdomain"
            autoComplete="off"
            spellCheck={false}
            maxLength={40}
            value={subdomain}
            onChange={(event) => setSubdomain(event.target.value)}
            aria-invalid={check.state === "refused" || error?.field === "subdomain"}
            aria-describedby="subdomain-status"
            className="h-9 text-sm"
          />
          <span className="shrink-0 text-sm text-muted-foreground">.{AppConfig.onboarding.siteDomain}</span>
        </div>
        <p id="subdomain-status" className="min-h-5 text-sm" aria-live="polite">
          {check.state === "checking" && <span className="text-muted-foreground">Checking…</span>}
          {check.state === "available" && <span className="text-green-700 dark:text-green-400">Available</span>}
          {check.state === "refused" && <span className="text-destructive">{check.reason}</span>}
          {check.state === "slow" && <span className="text-muted-foreground">Slow down</span>}
          {check.state === "error" && (
            <span className="text-muted-foreground">We couldn't check that name just now.</span>
          )}
          {error?.field === "subdomain" && check.state !== "refused" && (
            <span className="text-destructive">{error.message}</span>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Company name</Label>
        <Input
          id="company_name"
          name="company_name"
          autoComplete="organization"
          maxLength={140}
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          aria-invalid={error?.field === "company_name"}
          className="h-9 text-sm"
        />
      </div>

      <div ref={widget} />

      {error && error.field !== "subdomain" && (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit} className="w-full h-9">
        {submitting ? "Creating your site…" : "Create my site"}
      </Button>
    </form>
  );
}
