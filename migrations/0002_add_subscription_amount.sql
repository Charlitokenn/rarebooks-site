-- Migration to add subscription_amount to existing trials table
-- Since SQLite (D1) doesn't support adding NOT NULL columns without a default value to an existing table,
-- we add it with a default value of 0.

ALTER TABLE trials ADD COLUMN subscription_amount INTEGER NOT NULL DEFAULT 0;
