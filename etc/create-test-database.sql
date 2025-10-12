-- TickSkills Test Database Setup
-- Run this script in MySQL to create the test database

-- Create test database (separate from production)
DROP DATABASE IF EXISTS tickskills_test;
CREATE DATABASE tickskills_test;

-- Grant permissions (adjust if you use a different user)
USE tickskills_test;

-- Verify database is created
SELECT 'Test database tickskills_test created successfully!' AS status;
SHOW DATABASES LIKE 'tickskills%';
