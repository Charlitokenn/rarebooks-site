// Shared content for /compare/[slug] and /alternatives/[slug] pages.
// Researched and updated July 2026. Update pricing figures periodically —
// vendor pricing (especially QuickBooks Desktop, Sage 50, TallyPrime) changes.

export interface FeatureRow {
  capability: string;
  rarebooks: string;
  competitor: string;
}

export interface DualCard {
  heading: string;
  body: string;
}

export interface DeepDive {
  title: string;
  intro: string;
  rarebooks: DualCard;
  competitor: DualCard;
}

export interface Faq {
  q: string;
  a: string;
}

export interface CompetitorEntry {
  slug: string;
  name: string;
  shortName: string;
  metaDescription: string;
  pricingRareBooks: string;
  pricingCompetitor: string;
  bestForCompetitor: string;
  bestForRareBooks: string;
  featureMatrix: FeatureRow[];
  deepDives: [DeepDive, DeepDive];
  recommendationCompetitor: string;
  recommendationRareBooks: string;
  whenToChooseCompetitor: string;
  whySwitchToRareBooks: string;
  migrationSteps: [string, string, string, string];
  faqs: [Faq, Faq];
}

export const competitors: CompetitorEntry[] = [
  // ---------------------------------------------------------------- GNUCASH
  {
    slug: "gnucash",
    name: "GnuCash",
    shortName: "GnuCash",
    metaDescription:
      "Compare RareBooks vs GnuCash: features, pricing, POS, inventory, and which offline accounting tool actually fits a running business.",
    pricingRareBooks:
      "One flexible license, sold as a one-time deal through AppSumo or as a standard subscription — device-bound with a 7-day offline grace period, no feature-gated tiers.",
    pricingCompetitor:
      "Completely free forever under the GPL. Currently on the stable 5.x series (5.16 as of mid-2026), maintained entirely by volunteer contributors with no commercial support tier.",
    bestForCompetitor:
      "Individuals and very small operations tracking personal or household finances who want zero cost and full source-code transparency.",
    bestForRareBooks:
      "Any business selling products or services that needs real invoicing, point of sale, and inventory alongside double-entry accounting.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes", competitor: "Yes" },
      { capability: "Double-entry accounting", rarebooks: "Yes", competitor: "Yes" },
      { capability: "Point of Sale", rarebooks: "Built-in", competitor: "Not available" },
      { capability: "Professional invoicing", rarebooks: "Templates, quotes, price lists", competitor: "Basic, limited templating" },
      { capability: "Inventory & batch tracking", rarebooks: "Yes", competitor: "Very limited" },
      { capability: "Interface", rarebooks: "Modern, reactive Vue.js UI", competitor: "Dated, accountant-oriented" },
      { capability: "Support", rarebooks: "Commercial, included with license", competitor: "Community forums only" },
    ],
    deepDives: [
      {
        title: "Running a business vs. tracking accounts",
        intro:
          "GnuCash was built to track money moving through accounts, not to run the day-to-day operations of a business.",
        rarebooks: {
          heading: "RareBooks",
          body: "Sales Invoices, Purchase Invoices, Sales Quotes, Price Lists, Pricing Rules, and a full POS Profile system come standard — the operational tools a retail or service business actually touches every day.",
        },
        competitor: {
          heading: "GnuCash",
          body: "Strong at the ledger level, but there's no point-of-sale mode and invoicing is a thin layer on top of the accounting engine rather than a built-for-purpose workflow.",
        },
      },
      {
        title: "Inventory that keeps up with a shop",
        intro: "For any business that sells physical goods, inventory depth matters.",
        rarebooks: {
          heading: "RareBooks",
          body: "Native support for item groups, batches, and stock tracking, with live stock levels reflected across invoicing and POS.",
        },
        competitor: {
          heading: "GnuCash",
          body: "No meaningful inventory management — it can log an expense or a sale, but it won't tell you what's on the shelf.",
        },
      },
    ],
    recommendationCompetitor:
      "GnuCash is completely free forever, has strong personal-finance features — budgeting, scheduled transactions, investment tracking — that go beyond what RareBooks targets, and is fully open-source and auditable. That's a genuine advantage if you want zero cost and full transparency for personal or very small-scale bookkeeping.",
    recommendationRareBooks:
      "RareBooks delivers the same solid double-entry core GnuCash offers, plus the operational layer — POS, invoicing, inventory, and a guided setup wizard — that a running business actually needs and backed by commercial support.",
    whenToChooseCompetitor:
      "GnuCash is a strong choice if you're tracking personal or household finances, or running a very small operation where you don't need invoicing, POS, or inventory — and you're comfortable with a steeper, accountant-oriented interface in exchange for paying nothing.",
    whySwitchToRareBooks:
      "Businesses outgrow GnuCash the moment they need to send a real invoice, ring up a retail sale, or track stock — none of which GnuCash was designed to do. RareBooks picks up exactly where that gap starts.",
    migrationSteps: [
      "Export your account list and historical transactions from GnuCash (it supports CSV and QIF export from the File menu).",
      "Use RareBooks' guided setup wizard to create your company profile and chart of accounts, matching your existing GnuCash account structure.",
      "Import your customer, vendor, and item lists via CSV, then enter opening balances so your books pick up exactly where GnuCash left off.",
      "Start invoicing, ringing up POS sales, and tracking inventory — the operational layer GnuCash never had.",
    ],
    faqs: [
      {
        q: "Can I keep using GnuCash for personal finances and RareBooks for my business?",
        a: "Yes — plenty of RareBooks users keep a separate GnuCash or spreadsheet for personal budgeting while running their business books in RareBooks. The two aren't mutually exclusive; they just serve different jobs.",
      },
      {
        q: "Is my transaction history safe during the move?",
        a: "Your GnuCash file stays untouched on export, and RareBooks stores its own data locally in a portable SQLite file, so you always retain a copy of your original records.",
      },
    ],
  },

  // -------------------------------------------------------- BUSY ACCOUNTING
  {
    slug: "busy-accounting",
    name: "BUSY Accounting Software",
    shortName: "BUSY",
    metaDescription:
      "Compare RareBooks vs BUSY Accounting Software: editions, pricing, GST tooling, POS, and platform support for SMEs outside India.",
    pricingRareBooks:
      "One flexible license covering the full feature set — invoicing, POS, inventory, reporting, multi-currency — sold as a one-time AppSumo deal or standard subscription.",
    pricingCompetitor:
      "Perpetual, edition-based licensing (Basic, Standard, Enterprise, recently rebranded under the newer 'BUSY Magic' generation), roughly $160–$266 per user per year depending on tier, with features gated by edition.",
    bestForCompetitor:
      "India-based micro, small, and medium businesses that need deep GST filing, reconciliation, and a large local reseller and support network.",
    bestForRareBooks:
      "SMEs — particularly in Tanzania and East Africa — that want the full feature set without paying to unlock basics across editions.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes", competitor: "Yes" },
      { capability: "Platform support", rarebooks: "Windows, macOS, Linux", competitor: "Primarily Windows desktop, with newer cloud & mobile app options" },
      { capability: "Interface", rarebooks: "Modern, reactive Vue.js UI", competitor: "Traditional grid/forms-based UI" },
      { capability: "POS", rarebooks: "Built-in, dedicated profile system", competitor: "Available in higher editions" },
      { capability: "Licensing tiers", rarebooks: "Single flexible model", competitor: "Multiple paid editions with feature gating" },
      { capability: "Tax compliance", rarebooks: "Configurable per region", competitor: "GST-first, India-centric" },
      { capability: "Regional focus", rarebooks: "Tanzania / East Africa", competitor: "India" },
    ],
    deepDives: [
      {
        title: "Editions and feature gating",
        intro: "How much of the product you actually get depends heavily on which tier you buy.",
        rarebooks: {
          heading: "RareBooks",
          body: "One license unlocks the core feature set — invoicing, POS, inventory, reporting, multi-currency — without an upgrade ladder for basics.",
        },
        competitor: {
          heading: "BUSY",
          body: "Functionality is split across Basic, Standard, and Enterprise (or the newer Smart/Power/Power Plus tiers), so features like advanced inventory or multi-user access often require upgrading.",
        },
      },
      {
        title: "Built for a region, not retrofitted",
        intro: "Tax and compliance tooling reflects who the software was designed for first.",
        rarebooks: {
          heading: "RareBooks",
          body: "Designed around SMEs needs from the very start.",
        },
        competitor: {
          heading: "BUSY",
          body: "Deeply tied to India's GST framework — powerful within that context, but not built with East African tax or payment rails in mind.",
        },
      },
    ],
    recommendationCompetitor:
      "BUSY has deep, mature inventory and GST compliance tooling refined over three decades specifically for Indian SMEs, a large reseller and support network in India, and enterprise-tier features for larger operations that need them.",
    recommendationRareBooks:
      "RareBooks offers full core functionality without paying to unlock basics across editions, genuine cross-platform support, and a product actually designed around African tax and mobile money realities rather than an India-first tool adapted after the fact.",
    whenToChooseCompetitor:
      "BUSY is the stronger pick if you're operating in India and need its mature GST filing and reconciliation tooling, or you rely on the large network of local BUSY resellers and trained consultants.",
    whySwitchToRareBooks:
      "If you're outside India and tired of paying to unlock basic functionality across editions — or you need Windows support — RareBooks is built for exactly that gap.",
    migrationSteps: [
      "Export your ledgers, customer/vendor lists, and stock data from BUSY (Excel/CSV export is available from most BUSY reports).",
      "Set up your company profile and chart of accounts in RareBooks using the guided onboarding wizard.",
      "Import your item catalog, customers, and vendors via CSV, then enter opening balances from your last BUSY closing report.",
      "Switch invoicing and POS operations over to RareBooks, keeping your BUSY file as a read-only historical archive.",
    ],
    faqs: [
      {
        q: "Does RareBooks handle GST the way BUSY does?",
        a: "RareBooks' tax reporting is configurable per region rather than purpose-built for India's GST regime specifically. If GST filing depth is your top priority and you operate in India, BUSY's India-first design is hard to match.",
      },
      {
        q: "Will I lose multi-branch reporting moving from BUSY Enterprise?",
        a: "RareBooks supports multi-currency and per-device licensing, but very large multi-location consolidated reporting is an area where BUSY's higher tiers currently go deeper — worth evaluating against your specific branch structure before switching.",
      },
    ],
  },

  // -------------------------------------------------------------- MANAGER.IO
  {
    slug: "manager-io",
    name: "Manager.io Desktop Edition",
    shortName: "Manager.io",
    metaDescription:
      "Compare RareBooks vs Manager.io Desktop: pricing, POS, loyalty tools",
    pricingRareBooks:
      "One structured license with commercial support included, sold as a one-time AppSumo deal or standard subscription with device management.",
    pricingCompetitor:
      "Desktop Edition is completely free forever, with no feature gating on core accounting. The optional Cloud Edition is a flat $59/month for remote, multi-user access.",
    bestForCompetitor:
      "Solo users and small businesses that want a genuinely free, full-featured desktop ledger and are comfortable relying on community forums for support.",
    bestForRareBooks:
      "Retail-facing SMEs that need real point-of-sale, loyalty and promotions tooling, backed by a support relationship rather than a forum.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes", competitor: "Yes" },
      { capability: "Cost model", rarebooks: "Commercial (one-time via AppSumo)", competitor: "Free desktop edition; Cloud from $59/mo" },
      { capability: "POS", rarebooks: "Built-in, dedicated profile system", competitor: "Basic sales invoice workflow, no dedicated POS mode" },
      { capability: "Loyalty programs & coupon codes", rarebooks: "Built-in", competitor: "Not available" },
      { capability: "Pricing rules & price lists", rarebooks: "Built-in", competitor: "Limited" },
      { capability: "Mobile money integration", rarebooks: "Yes (ClickPesa)", competitor: "No" },
      { capability: "Support", rarebooks: "Commercial, included", competitor: "Forum-based" },
      { capability: "Onboarding", rarebooks: "Guided wizard, auto super admin", competitor: "Manual setup" },
    ],
    deepDives: [
      {
        title: "POS and retail tooling",
        intro: "Free desktop bookkeeping is one job; ringing up walk-in retail sales all day is another.",
        rarebooks: {
          heading: "RareBooks",
          body: "Ships with a dedicated POS Profile system plus Loyalty Programs, Coupon Codes, and configurable Pricing Rules for growing retailers.",
        },
        competitor: {
          heading: "Manager.io",
          body: "Handles sales invoices well, but the free desktop edition has no true point-of-sale mode built for high-volume, walk-in transactions.",
        },
      },
      {
        title: "Support and local payments",
        intro: "What happens when something goes wrong, or a customer wants to pay by mobile money.",
        rarebooks: {
          heading: "RareBooks",
          body: "Commercial support is part of the license, and the Client Portal integrates ClickPesa for mobile money billing on license renewals.",
        },
        competitor: {
          heading: "Manager.io",
          body: "Relies on community forums for help, and has no local payment rail integration for African mobile money.",
        },
      },
    ],
    recommendationCompetitor:
      "Manager.io's desktop edition is genuinely free with no feature gating on core accounting, has been battle-tested by a large global user base for years, and offers Cloud and Server editions if you eventually want hosted access.",
    recommendationRareBooks:
      "For built-in POS, loyalty and pricing tools, and a licensing and support structure backed by a real vendor — plus mobile money billing designed for African markets — RareBooks goes further than Manager.io's free tier out of the box.",
    whenToChooseCompetitor:
      "If you need zero-cost, single-user desktop bookkeeping with no retail POS requirement, and you're fine self-serving support questions through community forums, Manager.io's free tier is hard to beat on price.",
    whySwitchToRareBooks:
      "The moment you need real point-of-sale or customer loyalty tooling, Manager.io's free tier stops covering you — that's exactly where RareBooks starts.",
    migrationSteps: [
      "Export your chart of accounts, customers, and inventory items from Manager.io using its built-in Excel/CSV export.",
      "Set up your company in RareBooks via the guided wizard, which auto-creates a default super admin account.",
      "Import your customer, vendor, and item lists, then enter opening balances from your last Manager.io reporting period.",
      "Move day-to-day invoicing and retail sales over to RareBooks' POS, keeping Manager.io as an offline archive of prior records.",
    ],
    faqs: [
      {
        q: "Is Manager.io really free with no catch?",
        a: "Yes — the Desktop Edition has no feature gating and no trial expiry. The catch, if there is one, is that multi-user and remote access require the paid Cloud Edition, and support is community-based rather than commercial.",
      },
      {
        q: "Why switch from a free tool at all?",
        a: "If your business is purely back-office bookkeeping with no retail counter, you may not need to. RareBooks makes the most sense once POS or loyalty programs become part of daily operations.",
      },
    ],
  },

  // ------------------------------------------------------- QUICKBOOKS DESKTOP
  {
    slug: "quickbooks-desktop",
    name: "QuickBooks Desktop",
    shortName: "QuickBooks Desktop",
    metaDescription:
      "Compare RareBooks vs QuickBooks Desktop in 2026: Intuit's phase-out of new sales, rising subscription prices, and an offline-first alternative",
    pricingRareBooks:
      "One-time AppSumo deal or standard subscription, device-bound with a 7-day offline grace period — available to purchase today, at a predictable price.",
    pricingCompetitor:
      "Subscription-only. Intuit stopped selling new Pro Plus, Premier Plus, and Mac Plus subscriptions in September 2024 — only Enterprise is still sold to new customers. Existing subscribers faced steep increases from February 2026 (Pro Plus rose from $999 to $1,149/year; Premier Plus from $1,399 to $1,609/year).",
    bestForCompetitor:
      "US-based businesses with an accountant already on QuickBooks, deep payroll needs, or that are willing to buy into Enterprise, the only tier Intuit still sells new.",
    bestForRareBooks:
      "Businesses anywhere — especially outside the US — that want full offline accounting they can actually purchase today, without a rising subscription.",
    featureMatrix: [
      { capability: "Available to new customers", rarebooks: "Yes, all tiers", competitor: "Only Enterprise — Pro/Premier/Mac Plus discontinued for new sales (Sept 2024)" },
      { capability: "Works fully offline", rarebooks: "Yes, 7-day grace period", competitor: "Degrades once a version's support window ends" },
      { capability: "Point of Sale", rarebooks: "Built-in", competitor: "Separate add-on product" },
      { capability: "Pricing trend", rarebooks: "Predictable, one-time-friendly", competitor: "Rising — Pro Plus +15% in Feb 2026 alone" },
      { capability: "Local database", rarebooks: "SQLite (lightweight, portable)", competitor: "Proprietary local file" },
      { capability: "Built for African SME tax context", rarebooks: "Yes", competitor: "No" },
    ],
    deepDives: [
      {
        title: "Can you even still buy it?",
        intro: "This is the question that's changed the most since Intuit's 2024–2026 announcements.",
        rarebooks: {
          heading: "RareBooks",
          body: "Every tier of RareBooks is available to purchase today, as a one-time AppSumo deal or a standard subscription — no discontinued product lines to navigate.",
        },
        competitor: {
          heading: "QuickBooks Desktop",
          body: "Intuit stopped selling new Pro Plus, Premier Plus, and Mac Plus subscriptions in September 2024. Desktop 2023 lost all support — payroll, bank feeds, security patches — on May 31, 2026. Desktop 2024, the last version ever released for those product lines, loses support September 30, 2027. Only Enterprise remains open to new buyers, at a materially higher price point.",
        },
      },
      {
        title: "Licensing and offline reality",
        intro: "How each product behaves once you're actually running it day to day.",
        rarebooks: {
          heading: "RareBooks",
          body: "Validates online when connected, but keeps working for a full 7-day offline grace period on an encrypted, device-bound cache — built for intermittent connectivity from day one.",
        },
        competitor: {
          heading: "QuickBooks Desktop",
          body: "Increasingly tied to Intuit's cloud ecosystem even for 'desktop' products, with per-seat pricing that rose again in February 2026 across nearly every surviving tier.",
        },
      },
    ],
    recommendationCompetitor:
      "QuickBooks Desktop Enterprise still has a 30-plus-year head start: a huge accountant ecosystem, deep payroll integrations, extensive third-party app support, and name recognition that makes it an easy sell to US-based accountants and auditors. If your business has US-specific payroll or tax filing needs and the Enterprise budget to match, that ecosystem is hard to beat.",
    recommendationRareBooks:
      "RareBooks gives you the double-entry accounting, POS, invoicing, and reporting essentials QuickBooks charges an escalating premium for — plus local payment rails QuickBooks doesn't offer at all — and critically, you can actually buy it new today.",
    whenToChooseCompetitor:
      "If you're a US business with an accountant already fluent in QuickBooks, need its payroll depth, and can absorb Enterprise-tier pricing, staying in the QuickBooks ecosystem still makes sense.",
    whySwitchToRareBooks:
      "If you're a new or growing business outside that specific niche, Intuit has made the decision harder to avoid: the affordable Desktop tiers you'd normally start with aren't for sale anymore, and the ones still running are getting more expensive on every renewal.",
    migrationSteps: [
      "Export your chart of accounts, customer/vendor lists, and item catalog from QuickBooks Desktop (File → Utilities → Export).",
      "Set up your company profile in RareBooks using the guided wizard, mapping your existing account structure.",
      "Import customers, vendors, and inventory via CSV, then enter opening balances from your last QuickBooks trial balance.",
      "Run both systems in parallel for a billing cycle if you want a safety net, then move invoicing and POS fully to RareBooks.",
    ],
    faqs: [
      {
        q: "Is QuickBooks Desktop actually shutting down?",
        a: "Not entirely — Enterprise remains for sale with no announced end date. But Pro Plus, Premier Plus, and Mac Plus are closed to new customers, and each version's connected services (payroll, bank feeds, security patches) stop on a rolling support-end schedule.",
      },
      {
        q: "Can I import my QuickBooks data directly into RareBooks?",
        a: "RareBooks accepts CSV imports for accounts, customers, vendors, and items, which QuickBooks Desktop can export directly. There isn't a one-click proprietary-file importer, so budget time for mapping your chart of accounts during setup.",
      },
    ],
  },

  // -------------------------------------------------------- REACH ACCOUNTANT
  {
    slug: "reach-accountant",
    name: "Reach Accountant",
    shortName: "Reach Accountant",
    metaDescription:
      "Compare RareBooks vs Reach Accountant: cloud vs. true offline accounting, vertical editions and POS",
    pricingRareBooks:
      "One flexible license covering general SME accounting, POS, and inventory — one-time AppSumo deal or standard subscription.",
    pricingCompetitor:
      "Custom, quote-based pricing across industry-specific editions (retail, restaurant, distribution, and more); Reach positions itself today primarily as a cloud/web-based platform rather than a dedicated offline desktop product.",
    bestForCompetitor:
      "India-based businesses in a specific vertical — retail, restaurant, distribution — that want a cloud platform tuned to that industry with mobile and multi-branch access.",
    bestForRareBooks:
      "General SMEs anywhere that want one flexible, genuinely offline-capable system rather than choosing among narrow vertical cloud editions.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes, works fully without internet", competitor: "Primarily cloud/web-based" },
      { capability: "Platform support", rarebooks: "Windows, macOS, Linux desktop app", competitor: "Web-based, with mobile apps" },
      { capability: "Interface", rarebooks: "Modern Vue.js UI", competitor: "Standard cloud dashboard UI" },
      { capability: "POS", rarebooks: "Built-in, dedicated system", competitor: "Available, industry-specific editions" },
      { capability: "Product structure", rarebooks: "One flexible system for general SME use", competitor: "Vertical-specific editions (retail, restaurant, distribution)" },
      { capability: "Loyalty & pricing tools", rarebooks: "Built-in", competitor: "Varies by edition" },
      { capability: "Regional focus", rarebooks: "Tanzania / East Africa", competitor: "India" },
    ],
    deepDives: [
      {
        title: "One product vs. vertical editions",
        intro: "How each vendor structures what you actually buy.",
        rarebooks: {
          heading: "RareBooks",
          body: "A single, flexible accounting and POS system that covers general SME needs — invoicing, POS, inventory, reporting — without vertical lock-in.",
        },
        competitor: {
          heading: "Reach Accountant",
          body: "Splits its offering across industry-specific editions, meaning you're often paying for and learning a product tailored narrowly to one vertical rather than your specific mix of operations.",
        },
      },
      {
        title: "Offline reliability and local payments",
        intro: "What happens when the internet connection isn't reliable.",
        rarebooks: {
          heading: "RareBooks",
          body: "Built offline-first from the ground up, with a 7-day encrypted offline grace period and mobile money and credit card billing through the Client Portal.",
        },
        competitor: {
          heading: "Reach Accountant",
          body: "As a cloud/web-first platform, day-to-day operation assumes an active connection, and there's no equivalent local East African payment integration.",
        },
      },
    ],
    recommendationCompetitor:
      "Reach Accountant's industry-specific editions can offer deeper, purpose-built workflows for businesses in narrow verticals like restaurants or distribution, and its broader product family includes cloud and mobile apps for businesses that want that model.",
    recommendationRareBooks:
      "For one general-purpose, genuinely offline-capable accounting and POS system — rather than choosing among cloud-dependent vertical editions — with mobile money billing suited to African markets, RareBooks is the more flexible and regionally relevant option.",
    whenToChooseCompetitor:
      "Reach Accountant is worth a look if you're in India, fit neatly into one of its supported verticals, and want a cloud platform with mobile access from day one.",
    whySwitchToRareBooks:
      "If your business doesn't fit neatly into a single vertical, needs to keep working when the internet doesn't, or operates in regions where mobile money matters, Reach's cloud-first, vertical-edition model is a harder fit.",
    migrationSteps: [
      "Export your ledgers, customers, and inventory from Reach Accountant's reporting tools (CSV/Excel export is available from most modules).",
      "Set up your company profile and chart of accounts in RareBooks via the guided wizard.",
      "Import customers, vendors, and item lists, then enter opening balances from your last Reach closing period.",
      "Move invoicing and POS operations to RareBooks, keeping your Reach account for historical reference during the transition.",
    ],
    faqs: [
      {
        q: "Does RareBooks offer vertical-specific editions like Reach does?",
        a: "No — RareBooks is intentionally one flexible product covering general SME accounting, POS, and inventory rather than separate retail/restaurant/distribution editions. Most small businesses find this simpler; those needing deep vertical-specific workflows may prefer Reach's specialized editions.",
      },
      {
        q: "Can I use RareBooks without an internet connection at all?",
        a: "Yes. RareBooks is designed offline-first and keeps working for a 7-day grace period on an encrypted local cache even without connectivity, unlike Reach Accountant's cloud-first architecture.",
      },
    ],
  },

  // -------------------------------------------------------------------- SAGE 50
  {
    slug: "sage-50",
    name: "Sage 50",
    shortName: "Sage 50",
    metaDescription:
      "Compare RareBooks vs Sage 50 (Sage 50cloud): pricing, subscription requirements, POS, and true offline capability for SMEs.",
    pricingRareBooks:
      "One flexible license, device-bound with a 7-day offline grace period — one-time AppSumo deal or standard subscription, no forced internet dependency.",
    pricingCompetitor:
      "Now sold as Sage 50cloud, requiring a mandatory annual subscription across three tiers — Pro (~$340/year), Premium (~$850/year), and Quantum (~$2,150/year) — with no perpetual license and no traditional free trial (a cloud-hosted 'TestDrive' instead).",
    bestForCompetitor:
      "Established businesses that need Sage's deep inventory and job-costing reports, have decades of accountant familiarity with the product, and are comfortable with mandatory subscription billing.",
    bestForRareBooks:
      "Businesses that want genuine offline resilience without a mandatory subscription, plus built-in POS support Sage doesn't offer.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes, works fully offline", competitor: "Requires active subscription; full functionality assumes periodic connectivity" },
      { capability: "Interface", rarebooks: "Modern, clean Vue.js UI", competitor: "Dated Windows-style UI" },
      { capability: "Platform support", rarebooks: "Windows, macOS, Linux", competitor: "Primarily Windows, with cloud access add-on" },
      { capability: "POS included", rarebooks: "Yes", competitor: "No — separate product" },
      { capability: "Licensing", rarebooks: "Device-bound, 7-day offline grace period", competitor: "Mandatory annual subscription, per-seat" },
      { capability: "Setup", rarebooks: "Auto-provisioned super admin, guided wizard", competitor: "Manual, often accountant-assisted" },
    ],
    deepDives: [
      {
        title: "Cloud-tethered vs. truly offline",
        intro: "Both call themselves offline-capable, but the licensing model tells a different story.",
        rarebooks: {
          heading: "RareBooks",
          body: "Validates online when possible but tolerates up to 7 full days offline on an encrypted local cache before requiring reconnection — built for inconsistent connectivity.",
        },
        competitor: {
          heading: "Sage 50",
          body: "Now sold exclusively as Sage 50cloud on a mandatory annual subscription; if a subscription lapses, you're left with read-only access to your own data until payment resumes.",
        },
      },
      {
        title: "POS and setup friction",
        intro: "What it takes to get from install to your first sale.",
        rarebooks: {
          heading: "RareBooks",
          body: "Point of sale ships standard, and a default super admin account is created automatically on first setup — no manual database configuration.",
        },
        competitor: {
          heading: "Sage 50",
          body: "Retail businesses typically need to purchase a separate POS product, and setup is often accountant-assisted rather than self-serve.",
        },
      },
    ],
    recommendationCompetitor:
      "Sage 50 has decades of accountant familiarity, an extensive reports library that rivals dedicated inventory tools, and a large partner network — a real advantage if your market has strong local Sage support and you value that ecosystem over subscription cost.",
    recommendationRareBooks:
      "RareBooks delivers the same double-entry, invoicing, POS, and reporting fundamentals Sage 50 offers, without a mandatory subscription lock, with genuine offline resilience",
    whenToChooseCompetitor:
      "Sage 50 remains a solid pick if you need its specific advanced inventory and job-costing report depth and you're fine paying a rising annual per-seat subscription to keep full functionality active.",
    whySwitchToRareBooks:
      "If 'offline accounting software' should mean you can actually go a week without internet and keep working — not read-only access if a subscription lapses — RareBooks matches that expectation more literally.",
    migrationSteps: [
      "Export your chart of accounts, customers, vendors, and inventory from Sage 50 (File → Export in most modules).",
      "Create your company profile in RareBooks through the guided setup wizard, mapping your existing account structure.",
      "Import your customer, vendor, and item data via CSV, then enter opening balances from your last Sage 50 closing report.",
      "Shift invoicing and POS to RareBooks, keeping your Sage 50 subscription active only as long as you need historical access.",
    ],
    faqs: [
      {
        q: "Does Sage 50 still offer a perpetual, one-time-purchase license?",
        a: "No — Sage 50 is now sold exclusively as Sage 50cloud on an annual subscription. There's no current path to a one-time purchase.",
      },
      {
        q: "What happens to my Sage 50 data if I stop paying?",
        a: "Sage's own terms note that if your subscription lapses, you retain read-only access until the account is brought current — full functionality is tied to active billing.",
      },
    ],
  },

  // ---------------------------------------------------------------- TALLYPRIME
  {
    slug: "tallyprime",
    name: "TallyPrime (Tally.ERP 9)",
    shortName: "TallyPrime",
    metaDescription:
      "Compare RareBooks vs TallyPrime: pricing, GST-first design, learning curve, and offline accounting built for African and global SMEs.",
    pricingRareBooks:
      "One flexible license, device-bound with an encrypted cache and 7-day offline grace period — one-time AppSumo deal or standard subscription.",
    pricingCompetitor:
      "TallyPrime Silver (single user) costs roughly $260 as a one-time perpetual license including a year of Tally Software Services; Gold (multi-user) is roughly $800. Annual TSS renewal (~$50) is needed to keep receiving updates. Subscription options also exist.",
    bestForCompetitor:
      "India-based businesses needing deep GST/compliance tooling, a large network of trained resellers and accountants, and mature inventory or manufacturing modules.",
    bestForRareBooks:
      "SMEs outside India — particularly Tanzania and East Africa — that want offline accounting genuinely designed around their region's tax and payment realities.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes", competitor: "Yes" },
      { capability: "Platform support", rarebooks: "Windows, macOS, Linux", competitor: "Windows only (some cloud access add-ons)" },
      { capability: "Interface", rarebooks: "Modern Vue.js UI", competitor: "Text-heavy, keyboard-shortcut-driven UI" },
      { capability: "Learning curve", rarebooks: "Guided wizard, intuitive for non-accountants", competitor: "Steep — power-user oriented, often needs training" },
      { capability: "POS", rarebooks: "Built-in", competitor: "Available but retrofitted, not POS-first" },
      { capability: "Tax reporting", rarebooks: "Configurable per region", competitor: "Deeply India-centric (GST-first design)" },
      { capability: "Licensing", rarebooks: "Device-bound, encrypted cache, 7-day grace period", competitor: "Perpetual license + annual TSS renewal, or subscription" },
    ],
    deepDives: [
      {
        title: "Learning curve and interface",
        intro: "How long it takes a non-accountant to become productive.",
        rarebooks: {
          heading: "RareBooks",
          body: "A guided setup wizard and modern interface let a shop owner get running the same day, with a default super admin created automatically.",
        },
        competitor: {
          heading: "TallyPrime",
          body: "Power comes from deep keyboard-shortcut workflows that take real time to master — businesses frequently hire Tally-trained staff or consultants to get the most out of it.",
        },
      },
      {
        title: "Built for a region, not retrofitted for it",
        intro: "Where each product's tax and compliance design actually starts.",
        rarebooks: {
          heading: "RareBooks",
          body: "Designed with SME pain points — Tax compliance and bookkeeping simplicity — as core drivers.",
        },
        competitor: {
          heading: "TallyPrime",
          body: "Centers its entire design philosophy on India's GST regime; businesses outside India often work around features that don't map to local tax rules.",
        },
      },
    ],
    recommendationCompetitor:
      "TallyPrime has an enormous installed base, deep GST and India tax compliance tooling, a huge network of trained resellers and accountants, and mature inventory and manufacturing modules for complex operations — a strong choice within India's tax and compliance framework.",
    recommendationRareBooks:
      "If you're operating outside India — particularly in Tanzania or East Africa — RareBooks offers offline accounting actually designed around your region's tax and payment realities, without a steep learning curve or Windows-only lock-in.",
    whenToChooseCompetitor:
      "TallyPrime is the stronger choice if you're operating primarily within India's GST and compliance framework, or you value its very large trained-reseller ecosystem over a gentler learning curve.",
    whySwitchToRareBooks:
      "Outside India, Tally's GST-first design and steep keyboard-driven workflow are solving problems you don't have while missing ones you do — African tax context and mobile money chief among them.",
    migrationSteps: [
      "Export your ledgers, stock items, and party (customer/vendor) lists from TallyPrime using its built-in Excel/XML export.",
      "Create your company and chart of accounts in RareBooks through the guided wizard, mapping Tally's ledger groups to RareBooks accounts.",
      "Import your item, customer, and vendor data via CSV, then enter opening balances from your last Tally trial balance.",
      "Move day-to-day invoicing, POS, and inventory to RareBooks, retaining your Tally data file for historical reference.",
    ],
    faqs: [
      {
        q: "Is TallyPrime a one-time purchase or a subscription?",
        a: "Both options exist. Silver and Gold can be bought as a one-time perpetual license (needing an annual Tally Software Services renewal for updates) or paid on a recurring subscription schedule.",
      },
      {
        q: "Can RareBooks handle GST-style tax reporting like Tally does?",
        a: "RareBooks' tax reporting is configurable per region rather than purpose-built around India's GST regime specifically. If deep GST filing is your top requirement and you operate in India, Tally's India-first design currently goes further.",
      },
    ],
  },

  // ---------------------------------------------------------------- TURBOCASH
  {
    slug: "turbocash",
    name: "TurboCASH",
    shortName: "TurboCASH",
    metaDescription:
      "Compare RareBooks vs TurboCASH: TurboCASH 5's new subscription requirement, POS, and a modern, actively developed alternative.",
    pricingRareBooks:
      "One flexible license — one-time AppSumo deal or standard subscription, device-bound with a 7-day offline grace period.",
    pricingCompetitor:
      "TurboCASH 5, the current version, now requires an annual subscription fee — it's commercial again after years as a free, open-source tool. TurboCASH 4 remains free and open-source, but its last source release was in January 2018 and it's effectively unmaintained.",
    bestForCompetitor:
      "Long-time South African users already invested in TurboCASH 4 who want zero cost and full control, and are comfortable with a tool that's no longer actively developed.",
    bestForRareBooks:
      "Businesses that want an actively developed, modern accounting tool with built-in POS and mobile-money-aware billing.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes", competitor: "Yes" },
      { capability: "Interface", rarebooks: "Modern Vue.js UI", competitor: "Legacy Windows desktop UI" },
      { capability: "Platform support", rarebooks: "Windows, macOS, Linux", competitor: "Primarily Windows" },
      { capability: "POS", rarebooks: "Built-in", competitor: "Not native" },
      { capability: "Licensing model", rarebooks: "Device-bound, one-time or subscription", competitor: "TurboCASH 5 requires annual subscription; TurboCASH 4 is free but unmaintained since 2018" },
      { capability: "Active development pace", rarebooks: "Actively maintained commercial product", competitor: "TurboCASH 5 active; TurboCASH 4 dormant" },
    ],
    deepDives: [
      {
        title: "\"Free\" no longer means free",
        intro: "This is the biggest change in TurboCASH's story in years.",
        rarebooks: {
          heading: "RareBooks",
          body: "Pricing is transparent from the start — a one-time AppSumo deal or a standard subscription, with no bait-and-switch between versions.",
        },
        competitor: {
          heading: "TurboCASH",
          body: "TurboCASH built its reputation as free and open-source, but version 5 — the current, actively developed release — now requires an annual subscription. Staying on the genuinely free TurboCASH 4 means staying on a codebase last updated in 2018.",
        },
      },
      {
        title: "POS and active development",
        intro: "What you get today, and how fast it improves.",
        rarebooks: {
          heading: "RareBooks",
          body: "A full POS Profile system, pricing rules, and loyalty programs, developed on an active commercial release schedule.",
        },
        competitor: {
          heading: "TurboCASH",
          body: "No native point-of-sale system, and the free version's development pace has slowed considerably compared to its actively-updated (but now paid) TurboCASH 5.",
        },
      },
    ],
    recommendationCompetitor:
      "TurboCASH has strong brand recognition in South Africa specifically and a long history of community trust in that region — a real consideration if you're already running TurboCASH 4 and don't need POS or modern retail tooling.",
    recommendationRareBooks:
      "RareBooks is under active commercial development with structured releases, built-in POS and mobile-money-aware billing via ClickPesa — a more future-proof choice than a tool whose free version stopped moving forward and whose current version now charges a subscription.",
    whenToChooseCompetitor:
      "If you're already on TurboCASH 4, don't need POS, and cost is the deciding factor over active development, staying put is a reasonable call — just budget for the fact that it won't receive further updates.",
    whySwitchToRareBooks:
      "If you assumed TurboCASH meant 'free forever,' that assumption changed with version 5. RareBooks is transparent about its licensing from day one and keeps shipping new features.",
    migrationSteps: [
      "Export your general ledger, debtors, and creditors data from TurboCASH (available via its reporting and export tools).",
      "Set up your company profile and chart of accounts in RareBooks using the guided wizard.",
      "Import customer, vendor, and stock item lists via CSV, then enter opening balances from your last TurboCASH trial balance.",
      "Move invoicing, POS, and inventory operations to RareBooks, keeping your TurboCASH file for historical reference.",
    ],
    faqs: [
      {
        q: "Is TurboCASH still free?",
        a: "It depends which version. TurboCASH 4 remains free and open-source but hasn't had a source release since January 2018. TurboCASH 5, the current actively developed version, requires an annual subscription.",
      },
      {
        q: "Does TurboCASH have point-of-sale functionality?",
        a: "Not natively as a dedicated POS mode — it's built primarily as a general ledger, cash book, and invoicing system rather than a retail checkout tool.",
      },
    ],
  },

  // -------------------------------------------------------- WINGS ACCOUNTING
  {
    slug: "wings-accounting",
    name: "Wings Accounting Software",
    shortName: "Wings",
    metaDescription:
      "Compare RareBooks vs Wings Accounting Software: platform support, POS, licensing, and offline accounting for businesses outside India.",
    pricingRareBooks:
      "One flexible license, device-bound with an encrypted cache and 7-day offline grace period — one-time AppSumo deal or standard subscription.",
    pricingCompetitor:
      "Sold mainly through regional resellers with quote-based pricing (legacy desktop licenses commonly seen around $90–100/unit locally); a newer web-based edition, Wings Accounting Nxt, is also offered alongside the traditional Windows product.",
    bestForCompetitor:
      "India-based traders, manufacturers, and distributors who want a reseller-supported, GST-ready billing and inventory tool with local implementation help.",
    bestForRareBooks:
      "Cross-platform SMEs that want built-in retail promotions tooling and mobile money billing, without relying on a regional reseller network.",
    featureMatrix: [
      { capability: "Offline-first", rarebooks: "Yes", competitor: "Yes (legacy desktop edition)" },
      { capability: "Platform support", rarebooks: "Windows, macOS, Linux", competitor: "Windows (desktop edition); web-based Nxt edition also available" },
      { capability: "Interface", rarebooks: "Modern Vue.js, reactive UI", competitor: "Traditional Windows forms UI" },
      { capability: "POS", rarebooks: "Built-in, dedicated system", competitor: "Add-on module in some editions" },
      { capability: "Loyalty & pricing rules", rarebooks: "Built-in", competitor: "Not standard" },
      { capability: "Setup experience", rarebooks: "Guided wizard, auto super admin", competitor: "Typically reseller-assisted" },
      { capability: "Regional focus", rarebooks: "Tanzania / East Africa", competitor: "India" },
    ],
    deepDives: [
      {
        title: "Platform and setup",
        intro: "How you get from purchase to a working system.",
        rarebooks: {
          heading: "RareBooks",
          body: "Runs on Windows, macOS, and Linux, and auto-creates a default admin account on first setup through a guided wizard — no reseller visit required.",
        },
        competitor: {
          heading: "Wings",
          body: "The traditional desktop edition is Windows-only, and setup is commonly handled through a local reseller rather than self-serve onboarding.",
        },
      },
      {
        title: "Retail and promotions tooling",
        intro: "What's available for a growing retail business beyond core ledgers.",
        rarebooks: {
          heading: "RareBooks",
          body: "Native Point of Sale, Loyalty Programs, Coupon Codes, and Pricing Rules let a retail business run promotions and manage repeat customers without third-party add-ons.",
        },
        competitor: {
          heading: "Wings",
          body: "POS is an add-on in some editions rather than a standard feature, and loyalty/promotions tooling isn't part of the core product.",
        },
      },
    ],
    recommendationCompetitor:
      "Wings has an established presence and trained user base in the Indian SME market, with accounting workflows tuned to Indian tax and business practices and local reseller support — a natural fit if you're operating specifically within that ecosystem.",
    recommendationRareBooks:
      "RareBooks runs across platforms, includes retail-ready POS and promotions tooling out of the box, and is designed with East African payment and tax realities in mind — without depending on a regional reseller network.",
    whenToChooseCompetitor:
      "Wings makes sense if you're in India, already have staff trained on it, and value local reseller support over cross-platform flexibility.",
    whySwitchToRareBooks:
      "If you want offline accounting that runs across platforms, includes retail-ready POS and promotions tooling out of the box, and is designed with East African payment realities in mind, RareBooks is the stronger fit outside Wings' home market.",
    migrationSteps: [
      "Export your ledgers, stock, and party data from Wings (export options vary by edition — check with your reseller if unsure).",
      "Set up your company profile and chart of accounts in RareBooks via the guided wizard.",
      "Import your customer, vendor, and item lists via CSV, then enter opening balances from your last Wings closing report.",
      "Move invoicing, POS, and inventory to RareBooks, keeping your Wings installation for historical reference during the transition.",
    ],
    faqs: [
      {
        q: "Does Wings Accounting run on macOS or Linux?",
        a: "The traditional Wings desktop edition is Windows-only. A newer web-based edition, Wings Accounting Nxt, is browser-accessible, but the core product most resellers sell is still Windows-based.",
      },
      {
        q: "Do I need a reseller to set up RareBooks the way I did with Wings?",
        a: "No — RareBooks is designed for self-serve setup through a guided onboarding wizard that auto-creates your admin account and walks you through configuring your company.",
      },
    ],
  },
];

export function getCompetitor(slug: string): CompetitorEntry | undefined {
  return competitors.find((c) => c.slug === slug);
}
