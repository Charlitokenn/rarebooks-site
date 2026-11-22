import * as React from "react";
import { buttonVariants } from "@components/components/ui/button";
import { AppConfig } from "../../constants";
import { StartForm } from "./StartForm";

// Where the user's site is while it is prepared (spec 0014 AC-4). Polled every 5 seconds for the first 2
// minutes, then every 15 seconds, and only while it is Queued, Claiming or Preparing.

type Status = "Queued" | "Claiming" | "Preparing" | "Ready" | "Failed";

interface SiteState {
  status: Status;
  step: string | null;
  address: string | null;
}

const FAST_MS = 5_000;
const SLOW_MS = 15_000;
const FAST_FOR_MS = 2 * 60 * 1000;
const WAITING: Status[] = ["Queued", "Claiming", "Preparing"];

function label(status: Status): string {
  if (status === "Preparing") {
    return "Setting up your address";
  }
  return status === "Ready" ? "Ready" : "Getting your site";
}

export function SiteStatus({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [site, setSite] = React.useState<SiteState | null>(null);
  const [none, setNone] = React.useState(false);
  const [unreachable, setUnreachable] = React.useState(false);

  React.useEffect(() => {
    const started = Date.now();
    let timer: number | undefined;
    let stopped = false;

    async function poll() {
      try {
        const response = await fetch("/api/onboarding/status", { cache: "no-store" });
        if (response.status === 404) {
          setNone(true);
          return;
        }
        if (response.ok) {
          const data = (await response.json()) as SiteState;
          setSite(data);
          setUnreachable(false);
          if (!WAITING.includes(data.status)) {
            return;
          }
        } else {
          setUnreachable(true);
        }
      } catch {
        setUnreachable(true);
      }
      if (!stopped) {
        timer = window.setTimeout(poll, Date.now() - started < FAST_FOR_MS ? FAST_MS : SLOW_MS);
      }
    }

    poll();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (none) {
    return <StartForm turnstileSiteKey={turnstileSiteKey} />;
  }
  if (!site) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-xl border bg-card p-6 text-sm text-muted-foreground" aria-live="polite">
        {unreachable ? "We couldn't read your site's status just now. We'll keep trying." : "Loading your site…"}
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-lg space-y-4 rounded-xl border bg-card p-6" aria-live="polite">
      <div>
        <p className="text-sm text-muted-foreground">Your RareBooks site</p>
        <h2 className="text-xl font-semibold">{site.status === "Failed" ? "Something went wrong" : label(site.status)}</h2>
      </div>

      {WAITING.includes(site.status) && (
        <p className="text-sm text-muted-foreground">
          This usually takes a few minutes. You can close this page; we'll email you when your site is ready.
        </p>
      )}

      {site.status === "Ready" && site.address && (
        <>
          <p className="text-sm">
            Your site is at{" "}
            <span className="font-medium">{site.address.replace(/^https:\/\//, "")}</span>
          </p>
          <a href="/dashboard/site/open" className={buttonVariants({ className: "h-9" })}>
            Set your password
          </a>
        </>
      )}

      {site.status === "Failed" && (
        <p className="text-sm">
          We hit a problem setting up your site. We're on it and will email you. Questions? Write to{" "}
          <a className="underline" href={`mailto:${AppConfig.emails.supportEmail}`}>
            {AppConfig.emails.supportEmail}
          </a>
          .
        </p>
      )}
    </section>
  );
}
