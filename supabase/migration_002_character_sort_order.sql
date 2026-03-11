-- Migration 002: Add sort_order to characters table
-- Run this if you already have the characters table from migration.sql

ALTER TABLE characters ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_characters_sort_order ON characters(story_id, sort_order);
