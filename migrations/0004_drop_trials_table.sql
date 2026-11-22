-- Spec 0014 AC-7: the desktop license key trial is retired, and its table goes.
-- Export it FIRST and keep the file in the R2 export bucket under archive/ and on your machine:
--   npx wrangler d1 export rarebooks --remote --table trials --output trials-export.sql
-- Only then apply this migration.
DROP TABLE IF EXISTS trials;
