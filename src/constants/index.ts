import { hostedPlan, localServices } from "./pricing.ts";
import {Cog, LayoutDashboard} from "lucide-react";


export const AppConfig = {
  appName: "RareBooks",
  version: "0.3.0",
  description: "Modern desktop accounting app for small and medium businesses",
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
  urls: {
    rootUrl: "https://rarebooks.cc",
    documentationUrl: "rarebooks.cc/getting-started/getting-started-with-rarebooks/",
    storeUrl: "https://apps.microsoft.com/detail/9NTLP4V32WGS",
    portalUrl: "https://rarebooks.cc/dashboard",
    // Spec 0014 AC-7: every "Start free trial" link goes to Clerk sign up, which lands on the start form.
    signUpUrl: "/auth/sign-up",
    // Spec 0018: the docs home, with the trailing slash Starlight serves, used by the nav, footer and 404.
    docsHomePath: "/getting-started/getting-started-with-rarebooks/",
    // Spec 0019 AC-6: the Arcade product demo, the one fixed URL the homepage ever embeds.
    demoUrl:
      "https://demo.arcade.software/FeRaybGnq8w8icVFYOSu?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
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
  hostedPlan,
  localServices,
};
