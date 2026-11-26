import { defineCollection } from "astro:content";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Spec 0024 AC-3: only the header bar's links are named "Main". Starlight names its sidebar nav "Main" too,
  // so src/content/i18n/en.json renames it; without this axe reports landmark-unique from 72rem.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
