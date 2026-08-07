import { pricingPlans } from "./pricing.ts";
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
  trial: {
    localDuration: "14",
    abroadDuration: "21",
  },
  urls: {
    rootUrl: "https://rarebooks.cc",
    documentationUrl: "rarebooks.cc/getting-started/getting-started-with-rarebooks/",
    storeUrl: "https://apps.microsoft.com/detail/9NTLP4V32WGS",
    portalUrl: "https://rarebooks.cc/dashboard",
  },
  socials: {
    facebook: "https://www.facebook.com/rarebooks",
    instagram: "https://www.instagram.com/rarebooks",
    tiktok: "https://tiktok.com/@rarebooks_",
  },
  keymint: {
    productId: "5dc2d14443ace8f4dcf212",
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
  featuredClients: ["TAJ Home Appliances", "Powerlink Innovations"],
  pricingPlans,
};
