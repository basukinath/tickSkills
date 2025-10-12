-- SQL script to remove slug columns from the database
-- Run this against your MySQL database

-- First, make slug nullable in case we need to update existing records
ALTER TABLE question MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE category MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE tag MODIFY COLUMN slug VARCHAR(255) NULL;

-- Then drop the slug columns
ALTER TABLE question DROP COLUMN slug;
ALTER TABLE category DROP COLUMN slug;
ALTER TABLE tag DROP COLUMN slug;

-- Verify changes
SELECT 'question table:' as info;
DESCRIBE question;
SELECT 'category table:' as info;
DESCRIBE category;
SELECT 'tag table:' as info;
DESCRIBE tag;
