import * as React from "react";
import { buttonVariants } from "@components/components/ui/button";
import { AppConfig } from "../../constants";
import { welcomeDocs, welcomeOpenPath } from "../../constants/welcome.ts";
import { checklist, type StepState } from "../../lib/onboarding/checklist.ts";
import { StartForm } from "./StartForm";

// The /welcome cards (spec 0023 AC-3 to AC-7): waiting, failed, Ready and loading. The server renders the
// starting state as props, so a waiting card makes no first fetch and shows no loading flash (AC-5). While the
// sign up is Queued, Claiming or Preparing the card polls every 3 seconds for the first 5 minutes from page
// load, then every 15 seconds. A visitor who watches the site turn Ready is taken straight to it (AC-6); a
// Ready card rendered by the server never redirects by itself (AC-4).

type Status = "Queued" | "Claiming" | "Preparing" | "Ready" | "Failed";

export interface SiteState {
  status: Status;
  step: string | null;
  address: string | null;
}

interface Props {
  turnstileSiteKey: string;
  firstName: string;
  /** The server's read, or null when the control site couldn't be reached in time (the loading card). */
  initial: SiteState | null;
  /** `?open=retry` at Ready: the last open failed (AC-4). */
  retry?: boolean;
}

const FAST_MS = 3_000;
const SLOW_MS = 15_000;
const FAST_FOR_MS = 5 * 60 * 1000;
const WAITING: Status[] = ["Queued", "Claiming", "Preparing"];

const card = "mx-auto w-full max-w-lg space-y-5 rounded-xl border bg-card p-6";

function bareAddress(address: string): string {
  return address.replace(/^https:\/\//, "");
}

export function SiteStatus({ turnstileSiteKey, firstName, initial, retry = false }: Props) {
  const [site, setSite] = React.useState<SiteState | null>(initial);
  const [none, setNone] = React.useState(false);
  const [unreachable, setUnreachable] = React.useState(false);

  React.useEffect(() => {
    // Only a waiting or unknown state polls; Ready and Failed are final on this page.
    if (initial && !WAITING.includes(initial.status)) {
      return;
    }
    const started = Date.now();
    let timer: number | undefined;
    let stopped = false;
    // AC-6: a server rendered waiting card counts as watching, so even the first poll's Ready jumps.
    let sawWaiting = Boolean(initial);

    function next() {
      if (!stopped) {
        timer = window.setTimeout(poll, Date.now() - started < FAST_FOR_MS ? FAST_MS : SLOW_MS);
      }
    }

    async function poll() {
      try {
        const response = await fetch("/api/onboarding/status", { cache: "no-store" });
        if (response.status === 404) {
          setNone(true);
          return;
        }
        if (response.ok) {
          const data = (await response.json()) as SiteState;
          setUnreachable(false);
          if (WAITING.includes(data.status)) {
            sawWaiting = true;
            setSite(data);
          } else {
            if (sawWaiting && data.status === "Ready" && !stopped) {
              window.location.assign(welcomeOpenPath);
              return;
            }
            setSite(data);
            return;
          }
        } else {
          setUnreachable(true);
        }
      } catch {
        setUnreachable(true);
      }
      next();
    }

    if (initial) next();
    else poll();
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
      <div className={`${card} text-sm text-muted-foreground`} aria-live="polite">
        {unreachable ? "We couldn't read your site's status just now. We'll keep trying." : "Loading your site…"}
      </div>
    );
  }
  if (site.status === "Ready") {
    return <ReadyCard firstName={firstName} address={site.address} retry={retry} />;
  }
  if (site.status === "Failed") {
    return <FailedCard step={site.step} />;
  }
  return <WaitingCard firstName={firstName} site={site} unreachable={unreachable} />;
}

function Greeting({ firstName }: { firstName: string }) {
  return <h1 className="text-2xl font-semibold">{firstName ? `Welcome, ${firstName}` : "Welcome"}</h1>;
}

function WaitingCard({ firstName, site, unreachable }: { firstName: string; site: SiteState; unreachable: boolean }) {
  return (
    <section className={card}>
      <div className="space-y-1">
        <Greeting firstName={firstName} />
        {site.address && (
          <p className="text-sm text-muted-foreground">
            Your site will be at <span className="font-medium text-foreground">{bareAddress(site.address)}</span>
          </p>
        )}
      </div>

      <div aria-live="polite">
        <Checklist status={site.status} step={site.step} />
      </div>

      <p className="text-sm text-muted-foreground">
        This usually takes a few minutes. Keep this page open and we'll take you to your site as soon as it's
        ready, or close it and we'll email you.
      </p>
      {unreachable && (
        <p className="text-sm text-muted-foreground" role="status">
          We couldn't read your site's status just now. We'll keep trying.
        </p>
      )}

      <div className="space-y-2 border-t pt-4">
        <h2 className="text-sm font-medium">While you wait</h2>
        <ul className="space-y-1.5 text-sm">
          {welcomeDocs.map((doc) => (
            <li key={doc.href}>
              <a className="underline underline-offset-4 hover:text-primary" href={doc.href} target="_blank" rel="noopener">
                {doc.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FailedCard({ step }: { step: string | null }) {
  // AC-7: the step it stopped at, from the server's `step`. Never `failed_reason`, never the address.
  return (
    <section className={card}>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <Checklist status="Failed" step={step} />
      <p className="text-sm">
        We hit a problem setting up your site. We're on it and will email you. Questions? Write to{" "}
        <a className="underline" href={`mailto:${AppConfig.emails.supportEmail}`}>
          {AppConfig.emails.supportEmail}
        </a>
        .
      </p>
    </section>
  );
}

function ReadyCard({ firstName, address, retry }: { firstName: string; address: string | null; retry: boolean }) {
  return (
    <section className={card}>
      <div className="space-y-1">
        <Greeting firstName={firstName} />
        {address && (
          <p className="text-sm">
            Your site is ready at <span className="font-medium">{bareAddress(address)}</span>
          </p>
        )}
      </div>
      {retry && (
        <p className="text-sm text-destructive" role="alert">
          We couldn't open your site just now. Try again in a moment.
        </p>
      )}
      <a href={welcomeOpenPath} className={buttonVariants({ className: "h-9 w-full px-4 text-sm" })}>
        Open your site
      </a>
    </section>
  );
}

const dotClass: Record<StepState, string> = {
  Done: "bg-green-600 dark:bg-green-500",
  "In progress": "bg-primary motion-safe:animate-pulse",
  Waiting: "border border-muted-foreground/50 bg-transparent",
  Failed: "bg-destructive",
};

const stateClass: Record<StepState, string> = {
  Done: "text-green-700 dark:text-green-400",
  "In progress": "text-foreground font-medium",
  Waiting: "text-muted-foreground",
  Failed: "text-destructive font-medium",
};

function Checklist({ status, step }: { status: Status; step: string | null }) {
  // AC-5: each step's state is visible text, not colour alone, and the current step has aria-current.
  return (
    <ol className="space-y-3">
      {checklist(status, step).map((item) => (
        <li key={item.title} className="flex items-center gap-3 text-sm" aria-current={item.current ? "step" : undefined}>
          <span className={`size-2.5 shrink-0 rounded-full ${dotClass[item.state]}`} aria-hidden="true" />
          <span className={item.state === "Waiting" ? "text-muted-foreground" : "text-foreground"}>{item.title}</span>
          <span className={`ml-auto shrink-0 text-xs ${stateClass[item.state]}`}>{item.state}</span>
        </li>
      ))}
    </ol>
  );
}
