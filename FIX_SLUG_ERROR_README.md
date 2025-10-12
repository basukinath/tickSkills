# Quick Fix for Slug Errors

## ⚡ FASTEST FIX (Recommended)

Just run **ONE** of these:

### Windows (PowerShell):
```powershell
.\run_sql_migration.ps1
```
*Choose option 1 when prompted*

### Windows (Command Prompt):
```cmd
quick_fix.bat
```

### Manual SQL (Any Platform):
```sql
ALTER TABLE question MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE category MODIFY COLUMN slug VARCHAR(255) NULL;
ALTER TABLE tag MODIFY COLUMN slug VARCHAR(255) NULL;
```

## Then:
1. Restart Spring Boot
2. Refresh browser (Ctrl+Shift+R)
3. ✅ Done!

---

## Files Available:

- **`make_slug_nullable.sql`** - Quick fix (makes columns nullable)
- **`remove_slug_columns.sql`** - Complete cleanup (drops columns)
- **`quick_fix.bat`** - Windows batch script for quick fix
- **`run_sql_migration.ps1`** - PowerShell script with options
- **`SLUG_REMOVAL_GUIDE.md`** - Detailed documentation

---

## What's the Problem?

You're seeing: **"Field 'slug' doesn't have a default value"**

This means your database still has `slug` columns with `NOT NULL` constraints, but the code no longer provides values for them.

## What's Been Fixed in Code?

✅ All slug references removed from Java code  
✅ Entities updated (Question, Category, Tag)  
✅ Repositories use names/IDs instead  
✅ UI updated to use IDs  

**Only database needs updating now!**

---

## Need Help?

Read the full guide: **SLUG_REMOVAL_GUIDE.md**
