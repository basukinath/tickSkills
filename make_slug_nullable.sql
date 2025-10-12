-- SQL script to make slug columns nullable (quick fix)
-- This allows the application to work without dropping columns
-- Run this against your MySQL database

-- Make slug columns nullable so they accept NULL values
ALTER TABLE question MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE category MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE tag MODIFY COLUMN slug VARCHAR(255) NULL;

-- Verify changes
SELECT 'Verifying question table:' as info;
SHOW COLUMNS FROM question LIKE 'slug';

SELECT 'Verifying category table:' as info;
SHOW COLUMNS FROM category LIKE 'slug';

SELECT 'Verifying tag table:' as info;
SHOW COLUMNS FROM tag LIKE 'slug';

SELECT '✓ Slug columns are now nullable. Your application should work!' as result;
