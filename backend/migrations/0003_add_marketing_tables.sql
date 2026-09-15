-- Migration: 0003_add_marketing_tables.sql
-- Adds Campaign and SeoKeyword tables for the Marketing & SEO module.

-- CreateTable Campaign
CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "practiceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "budget" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "cost" TEXT NOT NULL,
    "cpa" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable SeoKeyword
CREATE TABLE IF NOT EXISTS "SeoKeyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "practiceId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "volume" TEXT NOT NULL,
    "trend" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeoKeyword_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Campaign_practiceId_idx" ON "Campaign"("practiceId");
CREATE INDEX IF NOT EXISTS "SeoKeyword_practiceId_idx" ON "SeoKeyword"("practiceId");
