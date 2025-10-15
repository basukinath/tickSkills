# Database Schema Documentation

## Overview

TickSkills uses MySQL 8.0+ as its primary database with a normalized schema supporting questions, users, categories, tags, and practice progress tracking.

**Database Names:**
- **Production:** `tickskills`
- **Test:** `tickskills_test`

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │         │  Question    │         │  Category   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ name        │         │ title        │    ┌────│ name        │
│ username    │         │ difficulty   │    │    │ description │
│ password    │         │ source       │────┘    └─────────────┘
│ email       │         │ externalUrl  │
│ phone       │         │ category_id  │
│ userType    │         │ active       │──────┐
│ photoUrl    │         │ acceptanceRate│     │
│ isDeleted   │         └──────────────┘     │   ┌─────────────┐
│ createdOn   │                              │   │    Tag      │
│ createdBy   │                              │   ├─────────────┤
└─────────────┘                              │   │ id (PK)     │
       │                                     └───│ name        │
       │                                         └─────────────┘
       │                                                │
       │         ┌──────────────────────┐              │
       └─────────│ UserQuestionProgress │──────────────┘
                 ├──────────────────────┤
                 │ id (PK)              │
                 │ user_id (FK)         │
                 │ question_id (FK)     │
                 │ status               │
                 │ note                 │
                 │ created_at           │
                 │ last_updated         │
                 └──────────────────────┘
                 
       Many-to-Many Relationship (Question ↔ Tag)
       └──────── question_tags ────────┘
                (Join Table)
```

## Tables

### 1. users

Stores user information with soft delete support.

| Column     | Type         | Constraints                    | Description                              |
|------------|--------------|--------------------------------|------------------------------------------|
| id         | BIGINT       | PRIMARY KEY, AUTO_INCREMENT    | Unique user identifier                   |
| name       | VARCHAR(255) | NOT NULL                       | User's full name                         |
| username   | VARCHAR(255) | NOT NULL, UNIQUE               | Unique username for login                |
| password   | VARCHAR(255) | NOT NULL                       | User's password (should be encrypted)    |
| email      | VARCHAR(255) | NOT NULL                       | User's email address                     |
| phone      | VARCHAR(20)  | NULL                           | Phone number                             |
| userType   | VARCHAR(50)  | NOT NULL                       | USER or ADMIN                            |
| photoUrl   | VARCHAR(500) | NULL                           | URL to user's photo                      |
| isDeleted  | BOOLEAN      | DEFAULT FALSE                  | Soft delete flag                         |
| createdOn  | DATETIME     | NULL                           | Account creation timestamp               |
| createdBy  | VARCHAR(255) | NULL                           | Who created this account                 |

**Indexes:**
- Primary: `id`
- Unique: `username`

**Sample Data:**
```sql
INSERT INTO users (name, username, password, email, phone, userType, isDeleted) 
VALUES ('John Doe', 'johndoe', 'hashed_password', 'john@example.com', '+1234567890', 'USER', FALSE);
```

---

### 2. category

Stores question categories with descriptions.

| Column      | Type         | Constraints                  | Description                     |
|-------------|--------------|------------------------------|---------------------------------|
| id          | BIGINT       | PRIMARY KEY, AUTO_INCREMENT  | Unique category identifier      |
| name        | VARCHAR(255) | NOT NULL, UNIQUE             | Category name                   |
| description | TEXT         | NULL                         | Detailed category description   |

**Indexes:**
- Primary: `id`
- Unique: `name`

**Sample Data:**
```sql
INSERT INTO category (name, description) 
VALUES 
  ('Arrays & Hashing', 'Problems involving array manipulation and hash tables'),
  ('Two Pointers', 'Problems using two-pointer technique'),
  ('Stack', 'Problems involving stack data structure');
```

---

### 3. question

Stores coding questions with metadata.

| Column         | Type          | Constraints                    | Description                                |
|----------------|---------------|--------------------------------|--------------------------------------------|
| id             | BIGINT        | PRIMARY KEY, AUTO_INCREMENT    | Unique question identifier                 |
| title          | TEXT          | NOT NULL                       | Question title                             |
| difficulty     | VARCHAR(50)   | NULL                           | EASY, MEDIUM, or HARD                      |
| source         | VARCHAR(255)  | NULL                           | LEETCODE, HACKERRANK, GFG, etc.            |
| externalUrl    | VARCHAR(500)  | NULL                           | Link to original question                  |
| active         | BOOLEAN       | DEFAULT TRUE                   | Visibility in practice platform            |
| acceptanceRate | DECIMAL(5,2)  | NULL                           | Success rate (0.00 to 100.00)              |
| premium        | BOOLEAN       | DEFAULT FALSE                  | Premium/paid content flag                  |
| category_id    | BIGINT        | FOREIGN KEY (category.id)      | Reference to category                      |

**Indexes:**
- Primary: `id`
- Foreign Key: `category_id` → `category(id)`
- Index on: `difficulty`, `source`, `active`

**Constraints:**
- `active` defaults to `TRUE`
- `acceptanceRate` must be between 0.00 and 100.00
- `category_id` can be NULL

**Sample Data:**
```sql
INSERT INTO question (title, difficulty, source, externalUrl, active, acceptanceRate, premium, category_id) 
VALUES 
  ('Two Sum', 'EASY', 'LEETCODE', 'https://leetcode.com/problems/two-sum/', TRUE, 52.50, FALSE, 1),
  ('3Sum', 'MEDIUM', 'LEETCODE', 'https://leetcode.com/problems/3sum/', TRUE, 33.80, FALSE, 2);
```

---

### 4. tag

Stores tags for categorizing questions by topic.

| Column | Type         | Constraints                 | Description              |
|--------|--------------|-----------------------------|-----------------------------|
| id     | BIGINT       | PRIMARY KEY, AUTO_INCREMENT | Unique tag identifier       |
| name   | VARCHAR(255) | NOT NULL, UNIQUE            | Tag name                    |

**Indexes:**
- Primary: `id`
- Unique: `name`

**Sample Data:**
```sql
INSERT INTO tag (name) 
VALUES ('Array'), ('Hash Table'), ('Two Pointers'), ('Dynamic Programming');
```

---

### 5. question_tags (Join Table)

Many-to-many relationship between questions and tags.

| Column      | Type   | Constraints                      | Description                 |
|-------------|--------|----------------------------------|-----------------------------|
| question_id | BIGINT | FOREIGN KEY (question.id)        | Reference to question       |
| tag_id      | BIGINT | FOREIGN KEY (tag.id)             | Reference to tag            |

**Indexes:**
- Composite Primary Key: `(question_id, tag_id)`
- Foreign Keys: 
  - `question_id` → `question(id)` ON DELETE CASCADE
  - `tag_id` → `tag(id)` ON DELETE CASCADE

**Sample Data:**
```sql
-- Two Sum has tags: Array, Hash Table
INSERT INTO question_tags (question_id, tag_id) 
VALUES (1, 1), (1, 2);

-- 3Sum has tags: Array, Two Pointers
INSERT INTO question_tags (question_id, tag_id) 
VALUES (2, 1), (2, 3);
```

---

### 6. user_question_progress

Tracks individual user progress on questions.

| Column       | Type         | Constraints                      | Description                            |
|--------------|--------------|----------------------------------|----------------------------------------|
| id           | BIGINT       | PRIMARY KEY, AUTO_INCREMENT      | Unique progress record identifier      |
| user_id      | BIGINT       | FOREIGN KEY (users.id), NOT NULL | Reference to user                      |
| question_id  | BIGINT       | FOREIGN KEY (question.id), NOT NULL | Reference to question               |
| status       | VARCHAR(20)  | NOT NULL, DEFAULT 'UNSOLVED'     | SOLVED or UNSOLVED                     |
| note         | TEXT         | NULL                             | User's personal notes                  |
| created_at   | DATETIME     | NOT NULL                         | When progress was first created        |
| last_updated | DATETIME     | NOT NULL                         | Last modification timestamp            |

**Indexes:**
- Primary: `id`
- Unique Composite: `(user_id, question_id)` - One progress record per user/question
- Foreign Keys:
  - `user_id` → `users(id)` ON DELETE CASCADE
  - `question_id` → `question(id)` ON DELETE CASCADE

**Constraints:**
- `status` must be either 'SOLVED' or 'UNSOLVED'
- `created_at` and `last_updated` auto-managed by JPA

**Sample Data:**
```sql
INSERT INTO user_question_progress (user_id, question_id, status, note, created_at, last_updated)
VALUES 
  (1, 1, 'SOLVED', 'Used hashmap approach - O(n) time', NOW(), NOW()),
  (1, 2, 'UNSOLVED', 'Need to review two-pointer technique', NOW(), NOW());
```

---

## Enums and Constants

### Difficulty
```java
public enum Difficulty {
    EASY,
    MEDIUM,
    HARD
}
```

### SourcePlatform
```java
public enum SourcePlatform {
    LEETCODE,
    HACKERRANK,
    GFG,
    CODECHEF,
    CODEFORCES,
    INTERVIEWBIT,
    OTHER
}
```

### UserType
```java
public enum UserType {
    USER,
    ADMIN
}
```

### PracticeStatus
```java
public enum PracticeStatus {
    SOLVED,
    UNSOLVED
}
```

---

## Database Creation Scripts

### Production Database

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS tickskills 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE tickskills;

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    userType VARCHAR(50) NOT NULL,
    photoUrl VARCHAR(500),
    isDeleted BOOLEAN DEFAULT FALSE,
    createdOn DATETIME,
    createdBy VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Category table
CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question table
CREATE TABLE question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title TEXT NOT NULL,
    difficulty VARCHAR(50),
    source VARCHAR(255),
    externalUrl VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    acceptanceRate DECIMAL(5,2),
    premium BOOLEAN DEFAULT FALSE,
    category_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL,
    INDEX idx_difficulty (difficulty),
    INDEX idx_source (source),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tag table
CREATE TABLE tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question-Tag join table
CREATE TABLE question_tags (
    question_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Question Progress table
CREATE TABLE user_question_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNSOLVED',
    note TEXT,
    created_at DATETIME NOT NULL,
    last_updated DATETIME NOT NULL,
    UNIQUE KEY unique_user_question (user_id, question_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Test Database

```sql
CREATE DATABASE IF NOT EXISTS tickskills_test 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the same schema as production
-- (Run the same CREATE TABLE statements as above)
```

---

## Common Queries

### 1. Get All Active Questions

```sql
SELECT q.id, q.title, q.difficulty, q.source, q.acceptanceRate, c.name as category
FROM question q
LEFT JOIN category c ON q.category_id = c.id
WHERE q.active = TRUE
ORDER BY q.id;
```

### 2. Get Questions by Tag

```sql
SELECT DISTINCT q.id, q.title, q.difficulty, q.source
FROM question q
JOIN question_tags qt ON q.id = qt.question_id
JOIN tag t ON qt.tag_id = t.id
WHERE t.name = 'Array' AND q.active = TRUE;
```

### 3. Get User's Progress Statistics

```sql
SELECT 
    u.username,
    COUNT(*) as total_questions,
    SUM(CASE WHEN uqp.status = 'SOLVED' THEN 1 ELSE 0 END) as solved_count,
    SUM(CASE WHEN uqp.status = 'UNSOLVED' THEN 1 ELSE 0 END) as unsolved_count
FROM users u
LEFT JOIN user_question_progress uqp ON u.id = uqp.user_id
WHERE u.username = 'johndoe'
GROUP BY u.username;
```

### 4. Get Solved Questions by Difficulty

```sql
SELECT 
    q.difficulty,
    COUNT(*) as solved_count
FROM user_question_progress uqp
JOIN question q ON uqp.question_id = q.id
WHERE uqp.user_id = 1 AND uqp.status = 'SOLVED'
GROUP BY q.difficulty;
```

### 5. Find Questions Not Yet Attempted by User

```sql
SELECT q.id, q.title, q.difficulty
FROM question q
WHERE q.active = TRUE
  AND q.id NOT IN (
      SELECT question_id 
      FROM user_question_progress 
      WHERE user_id = 1
  )
ORDER BY q.id;
```

### 6. Get Top Tags by Question Count

```sql
SELECT t.name, COUNT(qt.question_id) as question_count
FROM tag t
JOIN question_tags qt ON t.id = qt.tag_id
JOIN question q ON qt.question_id = q.id
WHERE q.active = TRUE
GROUP BY t.id, t.name
ORDER BY question_count DESC
LIMIT 10;
```

### 7. Update Question Active Status (Bulk)

```sql
-- Mark specific questions as inactive
UPDATE question 
SET active = FALSE 
WHERE title IN ('Question Title 1', 'Question Title 2');

-- Mark all LEETCODE premium questions as inactive
UPDATE question 
SET active = FALSE 
WHERE source = 'LEETCODE' AND premium = TRUE;
```

### 8. Update Acceptance Rates (Bulk)

```sql
-- Update from JSON data
UPDATE question q
JOIN (
    SELECT 'Two Sum' as title, 52.50 as rate
    UNION ALL
    SELECT '3Sum', 33.80
    UNION ALL
    SELECT 'Valid Parentheses', 41.20
) AS rates ON q.title = rates.title
SET q.acceptanceRate = rates.rate;
```

---

## Database Maintenance

### Backup

```bash
# Backup production database
mysqldump -u root -p tickskills > tickskills_backup_$(date +%Y%m%d).sql

# Backup with compression
mysqldump -u root -p tickskills | gzip > tickskills_backup_$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# Restore from backup
mysql -u root -p tickskills < tickskills_backup_20251016.sql

# Restore from compressed backup
gunzip < tickskills_backup_20251016.sql.gz | mysql -u root -p tickskills
```

### Optimize Tables

```sql
-- Analyze tables
ANALYZE TABLE question, users, user_question_progress, question_tags;

-- Optimize tables
OPTIMIZE TABLE question, users, user_question_progress, question_tags;

-- Check table integrity
CHECK TABLE question, users, user_question_progress;
```

---

## Performance Tuning

### Recommended Indexes

```sql
-- Question table indexes (for filtering)
CREATE INDEX idx_question_active_difficulty ON question(active, difficulty);
CREATE INDEX idx_question_active_source ON question(active, source);

-- User Question Progress indexes (for statistics)
CREATE INDEX idx_progress_user_status ON user_question_progress(user_id, status);
CREATE INDEX idx_progress_last_updated ON user_question_progress(last_updated);
```

### Query Optimization Tips

1. **Use indexes effectively** - Filter on indexed columns first
2. **Avoid SELECT *** - Select only needed columns
3. **Use JOINs wisely** - LEFT JOIN only when necessary
4. **Limit results** - Use LIMIT for pagination
5. **Use EXPLAIN** - Analyze query execution plans

```sql
EXPLAIN SELECT q.* FROM question q WHERE q.active = TRUE AND q.difficulty = 'EASY';
```

---

## Migration Scripts

### Add acceptance_rate Column (if upgrading)

```sql
ALTER TABLE question 
ADD COLUMN acceptanceRate DECIMAL(5,2) NULL 
AFTER externalUrl;
```

### Add active Column (if upgrading)

```sql
ALTER TABLE question 
ADD COLUMN active BOOLEAN DEFAULT TRUE 
AFTER externalUrl;

-- Set all existing questions to active
UPDATE question SET active = TRUE WHERE active IS NULL;
```

### Add premium Column (if upgrading)

```sql
ALTER TABLE question 
ADD COLUMN premium BOOLEAN DEFAULT FALSE 
AFTER acceptanceRate;
```

---

## Data Statistics (Current)

- **Total Questions:** 3,820
- **Active Questions:** 865 (22.6%)
- **Questions with Acceptance Rates:** 3,707
- **Total Tags:** ~150
- **Total Categories:** ~25
- **Average Questions per Tag:** ~25

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 5.0 | Oct 16, 2025 | Directory restructure documentation |
| 4.5 | Oct 15, 2025 | Added active and acceptanceRate fields |
| 4.0 | Oct 13, 2025 | Added tag filtering support |
| 3.0 | Oct 10, 2025 | Added user_question_progress table |
| 2.0 | Oct 5, 2025 | Added tag and question_tags tables |
| 1.0 | Sep 2025 | Initial schema with users, question, category |

---

**Last Updated:** October 16, 2025  
**Database Version:** 5.0  
**Schema Compatibility:** Spring Boot 3.4.9, Hibernate 6.x, MySQL 8.0+
