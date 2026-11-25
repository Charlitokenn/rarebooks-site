// Every string on the homepage, word for word from spec 0019 *Page copy* (AC-3). Change the words in the
// spec first, then here, so the copy and the claims checked in AC-14 stay in step. `{name}` placeholders are
// filled by `fill` in src/lib/marketing/home.ts; `*word*` in a headline is its one MkHighlight word.

export interface HomeCopy {
  hero: {
    overline: string;
    title: string;
    lead: string;
    primary: string;
    demo: string;
    priceLine: string;
    screenshotAlt: string;
  };
}

const hero = {
  overline: "For shops and small businesses",
  primary: "Start free trial",
  demo: "Watch the demo",
  screenshotAlt: "The RareBooks dashboard showing cash and bank balances and the best selling items",
};

export const homeCopy: { local: HomeCopy; abroad: HomeCopy } = {
  local: {
    hero: {
      ...hero,
      title: "Your stock and sales, always *current*",
      lead: "RareBooks turns your notebooks into live records: what's on the shelf, what's selling and what you're earning, on your phone or computer.",
      priceLine: "Free for {freeDays} days, then TZS {tzsYear} a year. We can set up your shop for you.",
    },
  },
  abroad: {
    hero: {
      ...hero,
      title: "Clear books, confident *stock*",
      lead: "RareBooks keeps your accounting, invoicing, point of sale and stock in one place, hosted for you. Know your numbers and stay ready for tax.",
      priceLine: "Free for {freeDays} days, then ${usdYear} a year or ${usdMonth} a month.",
    },
  },
};

/** Signed in visitors see this in place of every body "Start free trial" (AC-12). */
export const dashboardLabel = "Go to your dashboard";
