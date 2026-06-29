import { pricingPlans } from "./pricing.ts";

export const AppConfig = {
  appName: "RareBooks",
  version: "0.2.0",
  description: "Modern desktop accounting app for small and medium businesses",
  author: "Charles Nkonoki",
  supportEmail: "support@rarebooks.cc",
  logo: "src/assets/logo.png",
  trial: {
    localDuration: "14",
    abroadDuration: "21",
  },
  rootUrl: "https://rarebooks.cc",
  documentationUrl:
    "rarebooks.cc/getting-started/getting-started-with-rarebooks/",
  storeUrl: "https://apps.microsoft.com/detail/9NTLP4V32WGS",
  socials: {
    facebook: "https://www.facebook.com/rarebooks",
    instagram: "https://www.instagram.com/rarebooks",
    tiktok: "https://tiktok.com/@rarebooks_",
  },
  keymint: {
    productId: "5dc2d14443ace8f4dcf212",
  },
  featuredClients: ["TAJ Home Appliances", "Powerlink Innovations"],
  pricingPlans,
};
