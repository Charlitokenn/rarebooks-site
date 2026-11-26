import { abroadServices, hostedPlan, localServices } from "./pricing.ts";


export const AppConfig = {
  appName: "RareBooks",
  version: "0.3.0",
  // Spec 0019 AC-13: the meta description and the footer line.
  description: "Online accounting, stock and point of sale for small businesses, hosted for you.",
  author: "Charles Nkonoki",
  emails: {
    supportEmail: "support@rarebooks.cc",
    nonReply: "nonreply@rarebooks.cc"
  },
  logo: "/logo.png",
  // Spec 0019 AC-4: the trial as specs 0005 and 0007 run it. Free for `freeDays`, payable from
  // `payFromDay`, read only from `readOnlyFromDay`, and the site removed on `removedOnDay` if unpaid.
  trial: {
    freeDays: 21,
    payFromDay: 22,
    readOnlyFromDay: 26,
    removedOnDay: 30,
  },
  // Spec 0020 AC-17: after a paid period ends. Full access for `graceDays` more days (spec 0005 AC-14), then
  // read only, and the site removed `removedAfterDays` after that (spec 0007 AC-1). Check those two
  // criteria if either number changes; the pricing FAQ reads them.
  renewal: {
    graceDays: 7,
    removedAfterDays: 60,
  },
  urls: {
    rootUrl: "https://rarebooks.cc",
    documentationUrl: "rarebooks.cc/getting-started/getting-started-with-rarebooks/",
    storeUrl: "https://apps.microsoft.com/detail/9NTLP4V32WGS",
    portalUrl: "https://rarebooks.cc/welcome",
    // Spec 0014 AC-7: every "Start free trial" link goes to Clerk sign up, which lands on the start form.
    signUpUrl: "/auth/sign-up",
    // Spec 0018: the docs home, with the trailing slash Starlight serves, used by the nav, footer and 404.
    docsHomePath: "/getting-started/getting-started-with-rarebooks/",
    // Spec 0019 AC-6: the Arcade product demo, the one fixed URL the homepage ever embeds.
    demoUrl:
      "https://demo.arcade.software/FeRaybGnq8w8icVFYOSu?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
  },
  // The tawk.to property and its two chat widgets: one for the marketing pages (Layout.astro) and one for the
  // /welcome page (WelcomeLayout.astro), so each has its own look and routing in tawk.to. Secure Mode is set per
  // property, so both use the same TAWK_API_KEY.
  tawk: {
    propertyId: "6a43b438854f801d4378af24",
    widgets: {
      marketing: "1k8bf0dgm",
      dashboard: "1jsc7fva2",
    },
  },
  socials: {
    facebook: "https://www.facebook.com/rarebooks",
    instagram: "https://www.instagram.com/rarebooks",
    tiktok: "https://tiktok.com/@rarebooks_",
  },
  paypal: {
    // "Rarebooks Desktop" hosted button (NCP single-button embed), created
    // in the PayPal business dashboard. The price is fixed to whatever that
    // button was configured with (currently a "One set price" button) - it
    // is NOT read dynamically from pricingPlans, so if the USD price for
    // RareBooks Desktop ever changes, update the button in the PayPal
    // dashboard too. See: paypal.com/businessmanage/buttons
    hostedButtonId: "D4TCL8TVG7MYN",
  },
  // Hosted sign up (spec 0014): each site's address is `<subdomain>.<siteDomain>`.
  onboarding: {
    siteDomain: "rarebooks.cc",
  },
  // Spec 0018 AC-10: /privacy and /terms stay drafts (noindex, a draft banner, linked from nowhere) until
  // `approved` is true. Fill in `controller` (the legal name and postal address of whoever runs RareBooks)
  // before you approve. Bump `updated` (an ISO date) whenever the wording changes.
  legal: {
    approved: false as boolean,
    updated: "2026-11-25",
    controller: {
      name: "Inuweza Group Ltd",
      address: "Mbweha Street, Kijitonyama, Dar es Salaam, Tanzania",
    },
  },
  featuredClients: ["TAJ Home Appliances", "Powerlink Innovations"],
  // Spec 0019 AC-7: the homepage trust row shows this quote only once all three are filled in, with the
  // person's permission. Until then no quote markup renders.
  testimonial: {
    quote: "" as string,
    name: "" as string,
    business: "" as string,
  },
  hostedPlan,
  localServices,
  abroadServices,
};
