// The marketing nav and footer links (spec 0018). Every link MkNav and MkFooter show comes from here, so a
// link change is one edit. The homepage must keep its `features` and `pricing` ids, or this list changes in
// the same commit.
import { AppConfig } from "./index.ts";

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterLink extends NavLink {
  /** Show the link only to signed in or only to signed out visitors. */
  auth?: "signed-in" | "signed-out";
  /** The `data-cta-location` of a Start free trial link (AC-8). */
  ctaLocation?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
  /** The Legal column, shown only once `AppConfig.legal.approved` is true (AC-10). */
  legal?: true;
}

export const signInPath = "/auth/sign-in";
export const dashboardPath = "/dashboard";

// AC-3: four flat links, in this order.
export const navLinks: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Compare", href: "/compare" },
  { label: "Docs", href: AppConfig.urls.docsHomePath },
];

// AC-9: four columns.
export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Start free trial", href: AppConfig.urls.signUpUrl, auth: "signed-out", ctaLocation: "footer" },
      { label: "Sign in", href: signInPath, auth: "signed-out" },
      { label: "Dashboard", href: dashboardPath, auth: "signed-in" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "All comparisons", href: "/compare" },
      { label: "Alternatives guides", href: "/alternatives" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: AppConfig.urls.docsHomePath },
      { label: "Support", href: `mailto:${AppConfig.emails.supportEmail}` },
    ],
  },
  {
    title: "Legal",
    legal: true,
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
