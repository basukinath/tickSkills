# 🔍 Search by Question ID - User Guide

## New Feature: Search by Question ID

### What Is It?
A quick way to find a specific question when you know its ID number.

### Where Is It?
Navigate to: **🔍 Search** page → Right side panel

---

## How to Use

### Step 1: Get a Question ID
Question IDs are displayed everywhere in the app:
- 📚 **Browse Questions** - Shows "ID: 123" for each question
- ➕ **Create Question** - Success message shows the new ID
- 📁 **Categories** - Click a category to see question IDs
- 🔍 **Search by Difficulty** - Results show IDs

### Step 2: Navigate to Search Page
Click **🔍 Search** in the top navigation bar

### Step 3: Enter Question ID
On the right side, you'll see:
```
Search by Question ID
[Enter question ID]
[Search]
```
Type the question ID number (e.g., `123`)

### Step 4: Click Search
Click the **Search** button

### Step 5: View Results
You'll see the question with:
- ✅ Title
- ✅ ID
- ✅ Category
- ✅ Difficulty level
- ✅ Source platform
- ✅ External link (🔗 clickable icon)

---

## Examples

### Example 1: Successful Search
```
Input: 45

Result:
┌──────────────────────────────────────┐
│ Two Sum                          🔗 │
│ ID: 45 • Arrays • EASY • LEETCODE   │
└──────────────────────────────────────┘
```

### Example 2: Question Not Found
```
Input: 99999

Result:
┌──────────────────────────────────────┐
│ Question not found                   │
└──────────────────────────────────────┘
```

---

## Use Cases

### 1. Verify Before Update
Before updating a question, search by ID to:
- ✅ Confirm the question exists
- ✅ See current values
- ✅ Decide what to update

### 2. Verify Before Delete
Before deleting, search by ID to:
- ✅ Make sure you have the right question
- ✅ Avoid deleting wrong question

### 3. Quick Lookup
When someone mentions question ID in conversation:
- ✅ Quickly find what they're talking about
- ✅ No need to browse through categories

### 4. Testing
After creating a question:
- ✅ Search by the new ID
- ✅ Verify all details are correct
- ✅ Test external link works

---

## Search Page Layout

The Search page now has **two search options** side by side:

```
┌─────────────────────────────────────────────────────┐
│  🔍 Search Questions                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────┬──────────────────────┐  │
│  │ Search by Difficulty │ Search by Question ID│  │
│  ├──────────────────────┼──────────────────────┤  │
│  │ [EASY/MEDIUM/HARD v] │ [Enter question ID_] │  │
│  │ [Search]             │ [Search]             │  │
│  │                      │                      │  │
│  │ Results              │ Result               │  │
│  │ ─────────────────    │ ─────────────────    │  │
│  │ • Question 1         │ Two Sum          🔗  │  │
│  │ • Question 2         │ ID: 45 • Arrays      │  │
│  │ • Question 3         │ EASY • LEETCODE      │  │
│  │ ...                  │                      │  │
│  └──────────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Left Panel: Search by Difficulty
- Finds **multiple** questions with the selected difficulty
- Results show as a list
- Good for browsing by difficulty level

### Right Panel: Search by Question ID (NEW!)
- Finds **one specific** question
- Result shows single question card
- Perfect for quick lookup

---

## Tips & Tricks

### Tip 1: Copy IDs from Browse
1. Go to **📚 Browse Questions**
2. Click **Load Random 10**
3. Copy any question ID you see
4. Go to **🔍 Search**
5. Paste ID and search

### Tip 2: Use After Creating
After creating a question:
1. Note the ID from success message
2. Go to **🔍 Search**
3. Search by that ID
4. Verify all details are correct

### Tip 3: Verify Before Deleting
Before deleting question ID 123:
1. Search for ID 123
2. Confirm it's the right question
3. Then go to **🗑️ Delete** page

### Tip 4: Check External Links
1. Search by ID
2. Click the 🔗 icon
3. Verify link opens correctly

---

## Error Messages

### "Question ID is required"
- **Cause:** You clicked Search without entering an ID
- **Fix:** Enter a number in the ID field

### "Question not found"
- **Cause:** No question exists with that ID
- **Fix:** Double-check the ID number

### "HTTP 500" or other errors
- **Cause:** Backend error
- **Fix:** Check Spring Boot is running, check logs

---

## Keyboard Shortcuts

While in the ID search field:
- **Enter key** → Triggers search (same as clicking button)
- **Tab** → Move to search button
- **Ctrl+A** → Select all text in field

---

## Comparison: When to Use Each Search

| Feature | Search by Difficulty | Search by ID |
|---------|---------------------|--------------|
| **Input** | Dropdown (EASY/MEDIUM/HARD) | Number field |
| **Results** | Multiple questions | Single question |
| **Use When** | Browse by level | Know exact ID |
| **Output** | List of questions | One question card |
| **Best For** | Exploration | Verification |

---

## Technical Details

### API Endpoint
```
GET /api/questions/findById/{id}
```

### Response (Success)
```json
{
  "id": 45,
  "title": "Two Sum",
  "category": {
    "id": 1,
    "name": "Arrays"
  },
  "difficulty": "EASY",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum",
  "tags": [...],
  "active": true
}
```

### Response (Not Found)
```
HTTP 404 Not Found
```

---

## Benefits

- ✅ **Fast:** Find specific question in seconds
- ✅ **Accurate:** No scrolling through lists
- ✅ **Convenient:** Available from Search page
- ✅ **Useful:** Great for verification before update/delete
- ✅ **Simple:** Just enter ID and click search

---

## Common Workflows

### Workflow 1: Create → Verify
1. Create new question
2. Note the ID from success message (e.g., "ID: 78")
3. Go to Search page
4. Search for ID 78
5. Verify all details are correct

### Workflow 2: Update Safely
1. Know question ID (e.g., 23)
2. Search for ID 23
3. Review current values
4. Go to Update page
5. Update with confidence

### Workflow 3: Delete Safely
1. Have question ID to delete (e.g., 15)
2. Search for ID 15
3. Confirm it's the right question
4. Go to Delete page
5. Delete with confidence

---

## Screenshot Guide

### What You'll See

**Empty state:**
```
┌──────────────────────────┐
│ Result                   │
│ (no results yet)         │
└──────────────────────────┘
```

**After successful search:**
```
┌──────────────────────────────────┐
│ Result                           │
│ ┌──────────────────────────┐    │
│ │ Two Sum              🔗  │    │
│ │ ID: 45 • Arrays          │    │
│ │ EASY • LEETCODE          │    │
│ └──────────────────────────┘    │
└──────────────────────────────────┘
```

**After failed search:**
```
┌──────────────────────────┐
│ Result                   │
│ Question not found       │
└──────────────────────────┘
```

---

**Happy Searching! 🔍✨**

*Feature added: October 12, 2025*
