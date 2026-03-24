-- Migration 004: Add guiding_answer to story_acts
-- This column stores the user's free-text reflection on the framework's guiding question
-- for each stage. Used by the "Guia Socrático" feature in the Guide tab.

ALTER TABLE story_acts
ADD COLUMN IF NOT EXISTS guiding_answer text not null default '';
