# 🔍 Update Question - Search & Preview Feature

## Overview

The **Update Question** page now includes a **search and preview** workflow that ensures users verify the question exists before updating it.

---

## How It Works

### 📋 Workflow Steps

```
┌──────────────────────────────────────┐
│ 1. Enter Question ID                 │
│    [42          ] [🔍 Search]        │
└──────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │  Does question exist? │
    └─────────────────────┘
         ↙         ↘
       YES         NO
        ↓           ↓
┌─────────────┐  ┌──────────────┐
│ Show Preview│  │ Show "Not    │
│ with Details│  │ Found" Modal │
└─────────────┘  └──────────────┘
        ↓                ↓
  [✕ Close]        [✕ Close]
        ↓                ↓
┌─────────────┐    (Clear ID &
│ Show Update │     try again)
│ Form Fields │
└─────────────┘
        ↓
 Update Question
        ↓
  [Update] button
        ↓
  Form hidden again
```

---

## Visual Layout

### Step 1: Search Section (Always Visible)

```
┌────────────────────────────────────────────┐
│ 🔍 Update Question                         │
├────────────────────────────────────────────┤
│ ℹ️  Tip: First search for the question to │
│    verify it exists, then update fields.   │
├────────────────────────────────────────────┤
│ Question ID to Update *                    │
│ ┌────────────────────────┬──────────────┐ │
│ │ [Enter question ID]    │ [🔍 Search]  │ │
│ └────────────────────────┴──────────────┘ │
└────────────────────────────────────────────┘
```

### Step 2A: Question Found - Preview Modal

```
┌──────────────────────────────────────────────────┐
│ 📋 Question Found              [✕ Close]         │
├──────────────────────────────────────────────────┤
│ ID: 42                                           │
│ Title: Two Sum Problem                           │
│ Category: Arrays                                 │
│ Difficulty: EASY                                 │
│ Source: LEETCODE                                 │
│ External URL: 🔗 https://leetcode.com/...        │
│ Tags: array, hash-table, two-pointer             │
├──────────────────────────────────────────────────┤
│ 👇 Close this preview to edit the question      │
│    fields below                                  │
└──────────────────────────────────────────────────┘
```

### Step 2B: Question Not Found - Error Modal

```
┌──────────────────────────────────────────────────┐
│ ❌ Question Not Found          [✕ Close]         │
├──────────────────────────────────────────────────┤
│ The question with the specified ID does not      │
│ exist. Please check the ID and try again.        │
└──────────────────────────────────────────────────┘
```

### Step 3: Update Form (Visible After Closing Preview)

```
┌────────────────────────────────────────────┐
│ New Title                                  │
│ [Leave blank to keep current]              │
├────────────────────────────────────────────┤
│ Category              │ Difficulty          │
│ [-- keep current --]  │ [-- keep current --]│
├─────────────────────────────────────────────┤
│ Source Platform       │ External URL        │
│ [-- keep current --]  │ [                  ]│
├────────────────────────────────────────────┤
│ Tags (comma separated)                     │
│ [Leave blank to keep current]              │
├────────────────────────────────────────────┤
│              [Update Question]              │
└────────────────────────────────────────────┘
```

---

## User Experience Flow

### ✅ Success Flow

1. **Enter ID:** User types `42` in the Question ID field
2. **Click Search:** User clicks "🔍 Search" button
3. **See Preview:** Green modal shows all question details
4. **Verify:** User confirms this is the correct question
5. **Close Preview:** User clicks "✕ Close" button
6. **Form Appears:** Update form fields become visible
7. **Edit Fields:** User changes desired fields (e.g., title, difficulty)
8. **Update:** User clicks "Update Question"
9. **Success:** Alert shows "Question updated successfully!"
10. **Form Hidden:** Update form is hidden, ready for next search

### ❌ Not Found Flow

1. **Enter ID:** User types `999` in the Question ID field
2. **Click Search:** User clicks "🔍 Search" button
3. **See Error:** Red modal shows "Question Not Found"
4. **Close Error:** User clicks "✕ Close"
5. **ID Cleared:** Question ID field is automatically cleared
6. **Try Again:** User enters a different ID and searches

---

## Technical Details

### HTML Structure

```html
<!-- Search Section (always visible) -->
<div style="background: #f7fafc; padding: 20px;">
  <label>Question ID to Update *</label>
  <div style="display: flex; gap: 12px;">
    <input id="upd_id" type="number" />
    <button id="btn_search_question">🔍 Search</button>
  </div>
</div>

<!-- Preview Modal (shown when question found) -->
<div id="question_preview_modal" style="display: none;">
  <h3>📋 Question Found</h3>
  <button id="btn_close_preview">✕ Close</button>
  <div id="question_preview_content"></div>
</div>

<!-- Not Found Modal (shown when question not found) -->
<div id="question_notfound_modal" style="display: none;">
  <h3>❌ Question Not Found</h3>
  <button id="btn_close_notfound">✕ Close</button>
</div>

<!-- Update Form (shown after closing preview) -->
<div id="update_form_fields" style="display: none;">
  <!-- All update fields here -->
</div>
```

### JavaScript Functions

#### 1. `searchQuestionForUpdate()`
```javascript
async function searchQuestionForUpdate() {
  const id = document.getElementById('upd_id').value;
  if (!id) {
    alert('Please enter a Question ID');
    return;
  }
  
  // Call API to fetch question by ID
  const res = await fetch(`${apiBase}/findById/${id}`);
  
  if (res.status === 404) {
    showQuestionNotFound();  // Show error modal
  } else {
    const data = await res.json();
    showQuestionPreview(data);  // Show preview modal
  }
}
```

#### 2. `showQuestionPreview(question)`
```javascript
function showQuestionPreview(question) {
  // Build preview HTML with all question details
  // Show preview modal
  // Hide update form
  document.getElementById('question_preview_modal').style.display = 'block';
  document.getElementById('update_form_fields').style.display = 'none';
}
```

#### 3. `showQuestionNotFound()`
```javascript
function showQuestionNotFound() {
  // Show not found modal
  // Hide preview and update form
  document.getElementById('question_notfound_modal').style.display = 'block';
  document.getElementById('update_form_fields').style.display = 'none';
}
```

#### 4. `closePreviewAndShowForm()`
```javascript
function closePreviewAndShowForm() {
  // Hide preview modal
  // Show update form fields
  document.getElementById('question_preview_modal').style.display = 'none';
  document.getElementById('update_form_fields').style.display = 'block';
}
```

#### 5. `closeNotFoundModal()`
```javascript
function closeNotFoundModal() {
  // Hide not found modal
  // Clear the invalid ID
  document.getElementById('question_notfound_modal').style.display = 'none';
  document.getElementById('upd_id').value = '';
}
```

---

## State Management

### Display States

| State | Preview Modal | Not Found Modal | Update Form |
|-------|---------------|-----------------|-------------|
| **Initial** | Hidden | Hidden | Hidden |
| **Question Found** | Visible ✅ | Hidden | Hidden |
| **Question Not Found** | Hidden | Visible ❌ | Hidden |
| **Ready to Update** | Hidden | Hidden | Visible ✏️ |
| **After Update** | Hidden | Hidden | Hidden |

---

## API Endpoints Used

### 1. Search Question
- **Endpoint:** `GET /api/questions/findById/{id}`
- **Purpose:** Fetch question details for preview
- **Response:** Question object or 404

### 2. Update Question
- **Endpoint:** `PUT /api/questions/update/{id}`
- **Purpose:** Update question with new values
- **Response:** Updated question object

---

## Preview Modal Details

### Information Displayed

- ✅ **Question ID** - Numeric identifier
- ✅ **Title** - Question title
- ✅ **Category** - Category name (e.g., "Arrays")
- ✅ **Difficulty** - EASY, MEDIUM, or HARD
- ✅ **Source** - Platform (LEETCODE, HACKERRANK, etc.)
- ✅ **External URL** - Clickable link with 🔗 icon
- ✅ **Tags** - Comma-separated list of tags

### Styling

- **Color:** Purple border (#667eea) for found, Red border (#e53e3e) for not found
- **Background:** White for found, Light red (#fff5f5) for not found
- **Shadow:** Soft shadow for depth
- **Close Button:** Red background, positioned top-right

---

## Benefits

### ✅ For Users

1. **Verification:** Confirm question exists before editing
2. **Context:** See all current values before making changes
3. **Safety:** Prevents accidental updates to wrong questions
4. **Clarity:** Clear feedback for found/not found states
5. **Efficiency:** Quick preview without navigating away

### ✅ For System

1. **Reduced Errors:** Fewer failed update attempts
2. **Better UX:** Modal-based workflow is intuitive
3. **Validation:** ID validation happens before form submission
4. **Feedback:** Immediate visual feedback on search

---

## Testing Checklist

### ✅ Basic Flow
- [ ] Enter valid Question ID
- [ ] Click "🔍 Search"
- [ ] Verify preview modal appears
- [ ] Verify all question details are correct
- [ ] Click "✕ Close" on preview
- [ ] Verify update form appears
- [ ] Update some fields
- [ ] Click "Update Question"
- [ ] Verify success alert
- [ ] Verify form is hidden after update

### ✅ Not Found Flow
- [ ] Enter invalid Question ID (e.g., 99999)
- [ ] Click "🔍 Search"
- [ ] Verify "Not Found" modal appears
- [ ] Click "✕ Close" on not found modal
- [ ] Verify Question ID field is cleared

### ✅ Edge Cases
- [ ] Click Search with empty ID field
- [ ] Verify alert: "Please enter a Question ID"
- [ ] Search for question, close preview, search again
- [ ] Verify modal updates correctly
- [ ] Update question with only some fields changed
- [ ] Verify "keep current" options work

### ✅ Visual
- [ ] Preview modal has purple theme
- [ ] Not found modal has red theme
- [ ] Close buttons work correctly
- [ ] Links in preview are clickable
- [ ] Tags display properly
- [ ] Form fields are properly hidden/shown

---

## Files Modified

### 1. `index.html`
- Added search button next to Question ID input
- Added preview modal (`question_preview_modal`)
- Added not found modal (`question_notfound_modal`)
- Wrapped update form in `update_form_fields` div (initially hidden)

### 2. `app.js`
- **New:** `searchQuestionForUpdate()` - Search for question
- **New:** `showQuestionPreview(question)` - Display preview
- **New:** `showQuestionNotFound()` - Show error modal
- **New:** `closePreviewAndShowForm()` - Close preview, show form
- **New:** `closeNotFoundModal()` - Close error modal
- **Updated:** `updateQuestion()` - Hide form after successful update
- **Updated:** Event listeners - Added handlers for search and close buttons

---

## Design Patterns Used

### 1. **Progressive Disclosure**
- Form fields hidden until question is verified
- Reduces cognitive load
- Focuses user attention on one step at a time

### 2. **Modal Dialogs**
- Preview shown in modal overlay
- Clear call-to-action (Close button)
- Visual hierarchy with borders and colors

### 3. **State Management**
- Three distinct states: search, preview, update
- Only one state visible at a time
- Clear transitions between states

### 4. **Defensive UI**
- ID validation before API call
- Clear error messages
- Automatic cleanup (clear invalid IDs)

---

## Future Enhancements (Optional)

- 🔄 Add "Edit Anyway" button on not found modal
- 🔄 Show loading spinner during API call
- 🔄 Add keyboard shortcut (Escape to close modals)
- 🔄 Add animation transitions between states
- 🔄 Pre-fill form fields with current values after preview
- 🔄 Add "Search Another" button in preview

---

## Comparison: Before vs After

### BEFORE
```
┌────────────────────────────┐
│ Question ID: [____]        │
│ Title: [____]              │
│ Category: [____]           │
│ ...all fields visible      │
│ [Update]                   │
└────────────────────────────┘
❌ User might enter wrong ID
❌ No verification
❌ Could update wrong question
```

### AFTER
```
┌────────────────────────────┐
│ Question ID: [____] [🔍]   │
└────────────────────────────┘
         ↓ Click Search
┌────────────────────────────┐
│ 📋 Preview with all details│
│ [✕ Close]                  │
└────────────────────────────┘
         ↓ Close
┌────────────────────────────┐
│ Title: [____]              │
│ Category: [____]           │
│ ...fields now visible      │
│ [Update]                   │
└────────────────────────────┘
✅ User verified correct question
✅ Saw current values
✅ Confident in update
```

---

*Feature Documentation - October 12, 2025*
