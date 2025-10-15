# API Documentation

## Base URL

```
http://localhost:8080
```

## Table of Contents

1. [Practice Platform APIs](#practice-platform-apis)
2. [Admin APIs](#admin-apis)
3. [Question Management APIs](#question-management-apis)
4. [User Management APIs](#user-management-apis)
5. [Authentication](#authentication)
6. [Error Responses](#error-responses)

---

## Practice Platform APIs

### GET /api/practice/questions

Get questions with user-specific progress tracking.

**Query Parameters:**
- `username` (required): string - User owning the practice queue
- `difficulty`: string - EASY | MEDIUM | HARD
- `source`: string - LEETCODE | HACKERRANK | GFG
- `tag`: string - Filter by tag name
- `status`: string - SOLVED | UNSOLVED
- `search`: string - Search in title

**Request Example:**
```http
GET /api/practice/questions?username=johndoe&difficulty=EASY&tag=Array&status=UNSOLVED
```

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "title": "Two Sum",
    "difficulty": "EASY",
    "category": "Arrays & Hashing",
    "source": "LEETCODE",
    "externalUrl": "https://leetcode.com/problems/two-sum/",
    "premium": false,
    "active": true,
    "acceptanceRate": 52.5,
    "companies": ["Amazon", "Microsoft"],
    "tags": ["Array", "Hash Table"],
    "status": "UNSOLVED",
    "note": null,
    "lastUpdated": null
  },
  {
    "id": 15,
    "title": "3Sum",
    "difficulty": "MEDIUM",
    "category": "Two Pointers",
    "source": "LEETCODE",
    "externalUrl": "https://leetcode.com/problems/3sum/",
    "premium": false,
    "active": true,
    "acceptanceRate": 33.8,
    "companies": ["Facebook", "Amazon"],
    "tags": ["Array", "Two Pointers", "Sorting"],
    "status": "SOLVED",
    "note": "Remember to sort array first, then use two pointers",
    "lastUpdated": "2025-10-15T14:30:00"
  }
]
```

---

### POST /api/practice/questions/{questionId}/status

Update user's solve status for a question.

**Path Parameters:**
- `questionId`: number - Question ID

**Request Body:**
```json
{
  "username": "johndoe",
  "status": "SOLVED"
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Two Sum",
  "difficulty": "EASY",
  "category": "Arrays & Hashing",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum/",
  "premium": false,
  "active": true,
  "acceptanceRate": 52.5,
  "companies": ["Amazon", "Microsoft"],
  "tags": ["Array", "Hash Table"],
  "status": "SOLVED",
  "note": null,
  "lastUpdated": "2025-10-16T10:15:00"
}
```

---

### POST /api/practice/questions/{questionId}/note

Save or clear personal note for a question.

**Path Parameters:**
- `questionId`: number - Question ID

**Request Body:**
```json
{
  "username": "johndoe",
  "note": "Use hashmap for O(n) solution. Remember edge case: duplicate values."
}
```

**To clear a note, set note to empty string or null:**
```json
{
  "username": "johndoe",
  "note": ""
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Two Sum",
  "difficulty": "EASY",
  "status": "SOLVED",
  "note": "Use hashmap for O(n) solution. Remember edge case: duplicate values.",
  "lastUpdated": "2025-10-16T10:20:00"
}
```

---

### GET /api/practice/statistics

Get user's practice statistics aggregated by difficulty.

**Query Parameters:**
- `username` (required): string - User owning the statistics

**Request Example:**
```http
GET /api/practice/statistics?username=johndoe
```

**Response: 200 OK**
```json
{
  "username": "johndoe",
  "totalQuestions": 865,
  "solvedCount": 125,
  "unsolvedCount": 740,
  "easyTotal": 387,
  "easySolved": 75,
  "mediumTotal": 356,
  "mediumSolved": 45,
  "hardTotal": 122,
  "hardSolved": 5
}
```

---

### GET /api/practice/tags

Get list of all available tags for filtering.

**Request Example:**
```http
GET /api/practice/tags
```

**Response: 200 OK**
```json
[
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Binary Search",
  "Tree"
]
```

---

## Admin APIs

### POST /api/admin/sync-questions

Sync all active questions to all users for practice tracking.

**Description:** Creates `user_question_progress` records for all active questions for all users who don't have them yet.

**Request Example:**
```http
POST /api/admin/sync-questions
```

**Response: 200 OK**
```json
{
  "message": "Successfully synced questions to users",
  "totalUsers": 15,
  "totalQuestions": 865,
  "totalSynced": 12975,
  "durationMs": 2345
}
```

---

## Question Management APIs

### GET /api/questions

List questions with pagination and filtering.

**Query Parameters:**
- `categoryName`: string - Filter by category
- `difficulty`: string - EASY | MEDIUM | HARD
- `source`: string - LEETCODE | HACKERRANK | GFG
- `tagName`: string - Filter by tag
- `search`: string - Search in title
- `page`: number - Page number (default: 0)
- `size`: number - Page size (default: 30)

**Request Example:**
```http
GET /api/questions?difficulty=EASY&tagName=Array&page=0&size=20
```

**Response: 200 OK**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "EASY",
      "source": "LEETCODE",
      "externalUrl": "https://leetcode.com/problems/two-sum/",
      "active": true,
      "acceptanceRate": 52.5,
      "premium": false,
      "category": {
        "id": 1,
        "name": "Arrays & Hashing",
        "description": "Problems involving arrays and hash tables"
      },
      "tags": [
        {"id": 1, "name": "Array"},
        {"id": 2, "name": "Hash Table"}
      ]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 387,
  "totalPages": 20,
  "last": false
}
```

---

### GET /api/questions/random10

Get 10 random active questions.

**Request Example:**
```http
GET /api/questions/random10
```

**Response: 200 OK**
```json
[
  {
    "id": 42,
    "title": "Trapping Rain Water",
    "difficulty": "HARD",
    "source": "LEETCODE",
    "active": true,
    "acceptanceRate": 59.8,
    "category": { "name": "Two Pointers" },
    "tags": ["Array", "Two Pointers", "Dynamic Programming"]
  }
]
```

---

### GET /api/questions/findById/{id}

Get a specific question by ID.

**Path Parameters:**
- `id`: number - Question ID

**Request Example:**
```http
GET /api/questions/findById/1
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Two Sum",
  "difficulty": "EASY",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum/",
  "active": true,
  "acceptanceRate": 52.5,
  "premium": false,
  "category": {
    "id": 1,
    "name": "Arrays & Hashing"
  },
  "tags": [
    {"id": 1, "name": "Array"},
    {"id": 2, "name": "Hash Table"}
  ]
}
```

---

### POST /api/questions/create

Create a new question.

**Request Body:**
```json
{
  "title": "Valid Parentheses",
  "difficulty": "EASY",
  "category": "Stack",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/valid-parentheses/",
  "tags": ["String", "Stack"]
}
```

**Response: 201 Created**
```json
{
  "id": 3821,
  "title": "Valid Parentheses",
  "difficulty": "EASY",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/valid-parentheses/",
  "active": true,
  "acceptanceRate": null,
  "premium": false,
  "category": {
    "id": 5,
    "name": "Stack"
  },
  "tags": [
    {"id": 15, "name": "String"},
    {"id": 16, "name": "Stack"}
  ]
}
```

---

### POST /api/questions/bulkImport

Bulk import questions from JSON array.

**Request Body:**
```json
[
  {
    "id": 1,
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "source": "LEETCODE",
    "external_url": "https://leetcode.com/problems/two-sum/",
    "is_active": true,
    "is_premium": false,
    "acceptance_rate": 52.5,
    "companies": ["Amazon", "Microsoft", "Google"],
    "tags": ["Array", "Hash Table"]
  },
  {
    "id": 15,
    "title": "3Sum",
    "slug": "3sum",
    "difficulty": "Medium",
    "category": "Two Pointers",
    "source": "LEETCODE",
    "external_url": "https://leetcode.com/problems/3sum/",
    "is_active": true,
    "is_premium": false,
    "acceptance_rate": 33.8,
    "companies": ["Facebook", "Amazon"],
    "tags": ["Array", "Two Pointers", "Sorting"]
  }
]
```

**Response: 200 OK**
```json
{
  "totalQuestions": 2,
  "successfulImports": 2,
  "skippedDuplicates": 0,
  "failedImports": 0,
  "durationMs": 1234,
  "errorMessages": [],
  "skippedTitles": []
}
```

---

### PUT /api/questions/update/{id}

Update an existing question.

**Path Parameters:**
- `id`: number - Question ID

**Request Body:**
```json
{
  "title": "Two Sum (Updated)",
  "difficulty": "EASY",
  "category": "Arrays & Hashing",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum/",
  "tags": ["Array", "Hash Table", "Math"]
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "title": "Two Sum (Updated)",
  "difficulty": "EASY",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum/",
  "active": true,
  "category": { "name": "Arrays & Hashing" },
  "tags": [
    {"name": "Array"},
    {"name": "Hash Table"},
    {"name": "Math"}
  ]
}
```

---

### DELETE /api/questions/delete/{id}

Delete a question.

**Path Parameters:**
- `id`: number - Question ID

**Request Example:**
```http
DELETE /api/questions/delete/1
```

**Response: 204 No Content**

---

### GET /api/questions/listCategories

Get all categories.

**Request Example:**
```http
GET /api/questions/listCategories
```

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "name": "Arrays & Hashing",
    "description": "Problems involving array manipulation and hash tables"
  },
  {
    "id": 2,
    "name": "Two Pointers",
    "description": "Problems using two-pointer technique"
  },
  {
    "id": 3,
    "name": "Stack",
    "description": "Problems involving stack data structure"
  }
]
```

---

### GET /api/questions/listTags

Get all tags.

**Request Example:**
```http
GET /api/questions/listTags
```

**Response: 200 OK**
```json
[
  {"id": 1, "name": "Array"},
  {"id": 2, "name": "Hash Table"},
  {"id": 3, "name": "Two Pointers"},
  {"id": 4, "name": "String"},
  {"id": 5, "name": "Dynamic Programming"}
]
```

---

### GET /api/questions/getTotalQuestions

Get total count of active questions.

**Request Example:**
```http
GET /api/questions/getTotalQuestions
```

**Response: 200 OK**
```json
865
```

---

## User Management APIs

### POST /api/users/addUser

Add a single user.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "password": "securepassword",
  "email": "john@example.com",
  "phone": "+1234567890",
  "userType": "USER",
  "photoUrl": "https://example.com/photo.jpg"
}
```

**Response: 200 OK**
```
johndoe added successfully
```

---

### POST /api/users/addBulkUsers

Add multiple users.

**Request Body:**
```json
[
  {
    "name": "John Doe",
    "username": "johndoe",
    "password": "securepassword",
    "email": "john@example.com",
    "phone": "+1234567890",
    "userType": "USER"
  },
  {
    "name": "Jane Smith",
    "username": "janesmith",
    "password": "securepassword",
    "email": "jane@example.com",
    "phone": "+0987654321",
    "userType": "ADMIN"
  }
]
```

**Response: 200 OK**
```json
["johndoe", "janesmith"]
```

---

### GET /api/users/getUser/{username}

Get user by username.

**Path Parameters:**
- `username`: string - Username

**Request Example:**
```http
GET /api/users/getUser/johndoe
```

**Response: 200 OK**
```json
{
  "id": 1,
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "userType": "USER",
  "photoUrl": "https://example.com/photo.jpg",
  "isDeleted": false,
  "createdOn": "2025-10-01T12:00:00",
  "createdBy": "admin"
}
```

---

### GET /api/users/getAllUsers

Get all usernames.

**Request Example:**
```http
GET /api/users/getAllUsers
```

**Response: 200 OK**
```json
["johndoe", "janesmith", "alice", "bob"]
```

---

### GET /api/users/getAllActiveUsers

Get active usernames only.

**Request Example:**
```http
GET /api/users/getAllActiveUsers
```

**Response: 200 OK**
```json
["johndoe", "janesmith", "alice"]
```

---

### GET /api/users/getAllUsersDetails

Get all user details.

**Request Example:**
```http
GET /api/users/getAllUsersDetails
```

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "userType": "USER",
    "isDeleted": false
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "username": "janesmith",
    "email": "jane@example.com",
    "userType": "ADMIN",
    "isDeleted": false
  }
]
```

---

### PUT /api/users/updateUser/{username}

Update user details.

**Path Parameters:**
- `username`: string - Username

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567891",
  "userType": "ADMIN",
  "photoUrl": "https://example.com/new-photo.jpg"
}
```

**Response: 200 OK**
```
johndoe updated successfully
```

---

### DELETE /api/users/deleteUser/{username}

Soft delete a user.

**Path Parameters:**
- `username`: string - Username

**Request Example:**
```http
DELETE /api/users/deleteUser/johndoe
```

**Response: 200 OK**
```
johndoe deleted successfully
```

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

**Future Enhancement:** JWT-based authentication will be added in a future version.

---

## Error Responses

### 400 Bad Request

Returned when request validation fails.

```json
{
  "timestamp": "2025-10-16T10:15:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email cannot be null",
  "path": "/api/users/addUser"
}
```

### 404 Not Found

Returned when resource doesn't exist.

```json
{
  "timestamp": "2025-10-16T10:15:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with username: johndoe",
  "path": "/api/users/getUser/johndoe"
}
```

### 409 Conflict

Returned when resource already exists.

```json
{
  "timestamp": "2025-10-16T10:15:00",
  "status": 409,
  "error": "Conflict",
  "message": "Username already exists",
  "path": "/api/users/addUser"
}
```

### 500 Internal Server Error

Returned when unexpected server error occurs.

```json
{
  "timestamp": "2025-10-16T10:15:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Database connection error",
  "path": "/api/questions"
}
```

---

## Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST creating new resource |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Invalid request data or parameters |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Internal Server Error | Unexpected server error |

---

## Rate Limiting

Currently, there is no rate limiting on the API.

**Best Practice:** Implement client-side throttling to avoid overwhelming the server.

---

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (0-indexed, default: 0)
- `size`: Items per page (default: 30, max: 1000)

**Example:**
```http
GET /api/questions?page=2&size=50
```

**Response includes:**
- `content`: Array of items
- `totalElements`: Total number of items
- `totalPages`: Total number of pages
- `number`: Current page number
- `size`: Page size
- `first`: Is first page
- `last`: Is last page

---

## Changelog

### v5.0 (Oct 16, 2025)
- Added directory restructure documentation
- Updated all URLs to reflect new structure

### v4.5 (Oct 15, 2025)
- Added active question filter
- Added acceptance rate field
- Updated practice APIs

### v4.0 (Oct 13, 2025)
- Added tag filtering to question APIs
- Added bulk import endpoint
- Added practice progress tracking APIs

### v3.0 (Oct 10, 2025)
- Added practice platform APIs
- Added statistics endpoint
- Added progress tracking

### v2.0 (Oct 1, 2025)
- Added pagination support
- Added category and tag management
- Improved error handling

### v1.0 (Sep 2025)
- Initial API release
- User and question management

---

**API Version:** 5.0  
**Last Updated:** October 16, 2025  
**Base URL:** http://localhost:8080  
**Documentation:** Always refer to latest version
