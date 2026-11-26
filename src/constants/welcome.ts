// The /welcome page (spec 0023). Paths and copy in one place, so the page, the cards and the tests agree.

export const welcomePath = "/welcome";
export const welcomeOpenPath = "/welcome/open";

export interface WelcomeDoc {
  title: string;
  href: string;
}

// AC-5: the getting started links on the waiting card. Starlight serves the docs at the site root, so these
// are root paths (the spec's `/docs/...` prefix would 404; flagged for /architect).
export const welcomeDocs: WelcomeDoc[] = [
  { title: "Getting started with RareBooks", href: "/getting-started/getting-started-with-rarebooks/" },
  { title: "Chart of accounts", href: "/getting-started/chart-of-accounts/" },
  { title: "Set up opening balances", href: "/getting-started/setup-opening-balances/" },
];

// AC-5, AC-7: the four steps of the checklist, in order.
export const welcomeSteps = [
  "Request received",
  "Getting your site",
  "Making your account",
  "Setting up your address",
] as const;
