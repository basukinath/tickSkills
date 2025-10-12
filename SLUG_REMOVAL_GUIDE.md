# Fix for Slug Column Errors

## Problem
You're getting one of these errors:
- ❌ "Column 'slug' cannot be null"
- ❌ "Field 'slug' doesn't have a default value"

This happens because the `slug` columns still exist in the database with `NOT NULL` constraints, but the code no longer sets these values.

## Solution - Choose One Approach:

---

## 🚀 **OPTION 1: Quick Fix (Make Slug Nullable) - RECOMMENDED**

This is the fastest way to get your application working immediately.

### Run this SQL script:
```bash
mysql -u root -p your_database_name < make_slug_nullable.sql
```

Or copy and paste this SQL:
```sql
ALTER TABLE question MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE category MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE tag MODIFY COLUMN slug VARCHAR(255) NULL;
```

### What this does:
- ✅ Makes slug columns accept NULL values
- ✅ Your application works immediately
- ✅ Slug columns remain in database (harmless, just unused)
- ✅ Safe - no data loss

**After running this, restart your Spring Boot server and try creating a question!**

---

## 🗑️ **OPTION 2: Complete Cleanup (Drop Slug Columns)**

This completely removes slug columns from the database.

### Run this SQL script:
```bash
mysql -u root -p your_database_name < remove_slug_columns.sql
```

Or copy and paste this SQL:
```sql
-- First make nullable (safer)
ALTER TABLE question MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE category MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE tag MODIFY COLUMN slug VARCHAR(255) NULL;

-- Then drop the columns
ALTER TABLE question DROP COLUMN slug;
ALTER TABLE category DROP COLUMN slug;
ALTER TABLE tag DROP COLUMN slug;
```

### What this does:
- ✅ Completely removes slug columns
- ✅ Cleaner database schema
- ✅ Frees up disk space (minimal)
- ⚠️ Cannot be easily undone

---

## 📋 **Step-by-Step Instructions:**

### 1. Connect to MySQL
```bash
mysql -u root -p
```

### 2. Select your database
```sql
USE your_database_name;
```

### 3. Choose Quick Fix (Option 1) - RECOMMENDED
```sql
ALTER TABLE question MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE category MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE tag MODIFY COLUMN slug VARCHAR(255) NULL;
```

### 4. Verify the changes
```sql
SHOW COLUMNS FROM question LIKE 'slug';
SHOW COLUMNS FROM category LIKE 'slug';
SHOW COLUMNS FROM tag LIKE 'slug';
```

You should see `NULL: YES` for all slug columns.

### 5. Exit MySQL
```sql
EXIT;
```

### 6. Restart your Spring Boot application

### 7. Test creating a question in the UI

---

## ✅ **What Has Already Been Fixed in Code:**

- ✅ Removed slug from `Question.java` entity
- ✅ Removed slug from `Category.java` entity  
- ✅ Removed slug from `Tag.java` entity
- ✅ Removed all `setSlug()` and `getSlug()` calls
- ✅ Updated repositories to use `findByName()` instead of `findBySlug()`
- ✅ Updated controllers to use IDs and names
- ✅ Updated UI to use question IDs
- ✅ Removed slug generation logic

**The code is 100% slug-free. You just need to update the database!**

---

## 🆘 **Still Having Issues?**

If you're still seeing errors after running the SQL:

1. **Make sure you ran the SQL on the correct database**
   ```sql
   SELECT DATABASE();  -- Shows current database
   ```

2. **Check if columns were actually modified**
   ```sql
   DESCRIBE question;
   DESCRIBE category;
   DESCRIBE tag;
   ```

3. **Restart Spring Boot server** - Required for JPA to reload schema

4. **Clear browser cache** - Ctrl+Shift+R

---

## 📊 **Verify Success:**

After applying the fix, this should work without errors:
1. Open your application UI
2. Go to "Create Question" section
3. Fill in: Title, Category, Difficulty, Source Platform
4. Click "Create Question"
5. ✅ Should succeed without any slug-related errors!

---

## 💡 **Why This Happened:**

The slug fields were removed from the Java code but the database schema wasn't updated. JPA/Hibernate doesn't automatically drop columns - it only adds new ones. Manual database migration was needed.
