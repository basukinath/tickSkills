# 🎯 Quick Guide - Update Question Search & Preview

## What Changed?

The **Update Question** page now has a **search-first workflow**:

1. ✅ Search for question by ID first
2. ✅ See preview of question details
3. ✅ Close preview to show update form
4. ✅ Update the question

---

## Visual Flow

### Step-by-Step

```
┌─────────────────────────────────┐
│  STEP 1: Enter ID & Search      │
│  ┌──────────────┬────────────┐  │
│  │ ID: [42    ] │ [🔍 Search]│  │
│  └──────────────┴────────────┘  │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  STEP 2A: Question Found ✅     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ 📋 Question Found [✕ Close]┃  │
│  ┃ ─────────────────────────  ┃  │
│  ┃ ID: 42                     ┃  │
│  ┃ Title: Two Sum             ┃  │
│  ┃ Category: Arrays           ┃  │
│  ┃ Difficulty: EASY           ┃  │
│  ┃ Source: LEETCODE           ┃  │
│  ┃ URL: 🔗 link               ┃  │
│  ┃ Tags: array, hash-table    ┃  │
│  ┃ ─────────────────────────  ┃  │
│  ┃ 👇 Close to edit below     ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────────────┘
              ↓ Click ✕ Close
┌─────────────────────────────────┐
│  STEP 3: Update Form Appears    │
│  ┌─────────────────────────┐   │
│  │ Title: [______________] │   │
│  │ Category: [▼ keep curr] │   │
│  │ Difficulty: [▼ keep   ] │   │
│  │ Source: [▼ keep curr  ] │   │
│  │ URL: [________________] │   │
│  │ Tags: [_______________] │   │
│  │       [Update Question] │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Alternative Flow: Not Found

```
┌─────────────────────────────────┐
│  STEP 1: Enter ID & Search      │
│  ┌──────────────┬────────────┐  │
│  │ ID: [999   ] │ [🔍 Search]│  │
│  └──────────────┴────────────┘  │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  STEP 2B: Not Found ❌          │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ❌ Question Not Found      ┃  │
│  ┃              [✕ Close]     ┃  │
│  ┃ ─────────────────────────  ┃  │
│  ┃ The question with ID 999   ┃  │
│  ┃ does not exist.            ┃  │
│  ┃                            ┃  │
│  ┃ Please check the ID and    ┃  │
│  ┃ try again.                 ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└─────────────────────────────────┘
              ↓ Click ✕ Close
┌─────────────────────────────────┐
│  ID field cleared, try again    │
│  ┌──────────────┬────────────┐  │
│  │ ID: [      ] │ [🔍 Search]│  │
│  └──────────────┴────────────┘  │
└─────────────────────────────────┘
```

---

## Key Features

### ✅ Search First
- Must search before updating
- Verifies question exists
- Shows all current details

### ✅ Preview Modal
- Green border when found
- All question details visible
- Clickable external link
- Clear close button

### ✅ Error Handling
- Red border when not found
- Clear error message
- Auto-clears invalid ID

### ✅ Progressive Disclosure
- Form hidden until verified
- One step at a time
- Reduced confusion

---

## Quick Test

1. **Open Update Question page**
2. **Enter ID:** `1` (or any existing question)
3. **Click:** "🔍 Search"
4. **See:** Green preview modal with details
5. **Click:** "✕ Close" button
6. **See:** Update form appears
7. **Edit:** Change any field
8. **Click:** "Update Question"
9. **See:** Success alert + form hidden

---

## Buttons

| Button | Location | Action |
|--------|----------|--------|
| **🔍 Search** | Next to ID field | Search for question |
| **✕ Close** | Preview modal | Show update form |
| **✕ Close** | Not found modal | Clear ID, try again |
| **Update Question** | Bottom of form | Submit update |

---

## Colors

| State | Border Color | Background |
|-------|--------------|------------|
| **Found** | Purple (#667eea) | White |
| **Not Found** | Red (#e53e3e) | Light red (#fff5f5) |

---

## After Update

- ✅ Success alert shown
- ✅ Form is hidden
- ✅ All fields cleared
- ✅ Ready for next question

---

## Try It Now!

**Refresh browser** (Ctrl+Shift+R) and test:
1. Search valid ID → See preview
2. Search invalid ID → See error
3. Update question → See form hide

🎉 **Ready to use!**

*Quick Guide - October 12, 2025*
