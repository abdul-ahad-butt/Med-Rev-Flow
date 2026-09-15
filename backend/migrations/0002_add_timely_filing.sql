-- Migration: 0002_add_timely_filing.sql
-- Adds timelyFilingDays to the Insurance table.
-- Already applied to production D1 on 2026-09-15.
-- SQLite ALTER TABLE syntax: ADD COLUMN (no quotes around identifiers).

ALTER TABLE Insurance ADD timelyFilingDays INTEGER NOT NULL DEFAULT 0;
