# Bulk Import Questions API Documentation

## Overview
The Bulk Import API allows you to import large batches of questions into the TickSkills database in a single transaction. This is particularly useful for loading questions from external sources like LeetCode, HackerRank, or GeeksforGeeks.

## Endpoint

**URL**: `POST /api/questions/bulkImport`

**Content-Type**: `application/json`

**Authentication**: None (currently)

## Request Body

The request body should be a JSON array of question objects. Each question object must follow this structure:

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
  }
]
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | Long | No | Optional external ID (for reference) |
| `title` | String | Yes | The question title (used for duplicate detection) |
| `slug` | String | Yes | URL-friendly slug for the question |
| `difficulty` | String | Yes | Must be: "Easy", "Medium", or "Hard" |
| `category` | String | Yes | Category name (will be auto-created if it doesn't exist) |
| `source` | String | Yes | Must be: "LEETCODE", "HACKERRANK", or "GFG" |
| `external_url` | String | No | Link to the original question |
| `is_active` | Boolean | No | Whether the question is active (default: true) |
| `is_premium` | Boolean | No | Whether the question requires premium access |
| `acceptance_rate` | Double | No | Acceptance rate percentage |
| `companies` | String[] | No | List of companies that use this question |
| `tags` | String[] | Yes | List of tags/topics (will be auto-created if they don't exist) |

## Response

The API returns a `BulkImportResultDTO` object with statistics about the import operation:

```json
{
  "totalQuestions": 3711,
  "successfulImports": 3650,
  "skippedDuplicates": 50,
  "failedImports": 11,
  "durationMs": 45230,
  "errorMessages": [
    "Failed to import 'Invalid Question': Category cannot be null",
    "Failed to import 'Another Bad Question': Difficulty must be Easy, Medium, or Hard"
  ],
  "skippedTitles": [
    "Two Sum",
    "Three Sum",
    "Four Sum"
  ]
}
```

### Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `totalQuestions` | Integer | Total number of questions in the request |
| `successfulImports` | Integer | Number of questions successfully imported |
| `skippedDuplicates` | Integer | Number of questions skipped (already exist) |
| `failedImports` | Integer | Number of questions that failed to import |
| `durationMs` | Long | Time taken to complete the import (milliseconds) |
| `errorMessages` | String[] | List of error messages for failed imports |
| `skippedTitles` | String[] | List of titles that were skipped as duplicates |

## Features

### 1. Duplicate Detection
- The API checks if a question with the same **title** already exists
- Duplicate questions are **skipped** (not imported)
- All skipped titles are returned in the response

### 2. Auto-Creation of Categories and Tags
- If a category doesn't exist, it will be automatically created
- If tags don't exist, they will be automatically created
- This ensures referential integrity without manual setup

### 3. Transaction Management
- The entire import operation is wrapped in a **@Transactional** annotation
- If any critical error occurs, all changes are rolled back
- Individual question failures don't affect the entire batch

### 4. Validation
- Each question is validated before import
- Invalid difficulty values are rejected
- Invalid source platforms are rejected
- Missing required fields cause import failures

## Usage Examples

### Example 1: Import from PowerShell using Invoke-RestMethod

```powershell
# Import the LeetCode questions JSON file
$questions = Get-Content "etc/leetcode_dsa_questions.json" | ConvertFrom-Json
$result = Invoke-RestMethod -Uri "http://localhost:8080/api/questions/bulkImport" -Method Post -Body ($questions | ConvertTo-Json -Depth 10) -ContentType "application/json"

# Display results
Write-Host "Total: $($result.totalQuestions)"
Write-Host "Success: $($result.successfulImports)"
Write-Host "Skipped: $($result.skippedDuplicates)"
Write-Host "Failed: $($result.failedImports)"
Write-Host "Duration: $($result.durationMs) ms"
```

### Example 2: Import using cURL

```bash
curl -X POST http://localhost:8080/api/questions/bulkImport \
  -H "Content-Type: application/json" \
  -d @etc/leetcode_dsa_questions.json
```

### Example 3: Import using Postman

1. Open Postman
2. Create a new `POST` request
3. URL: `http://localhost:8080/api/questions/bulkImport`
4. Headers: `Content-Type: application/json`
5. Body: Select `raw` and `JSON`, then paste your JSON array
6. Click `Send`

### Example 4: Import Small Batch (Testing)

```json
POST http://localhost:8080/api/questions/bulkImport
Content-Type: application/json

[
  {
    "title": "Test Question 1",
    "slug": "test-question-1",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "source": "LEETCODE",
    "external_url": "https://example.com/test-1",
    "is_active": true,
    "is_premium": false,
    "tags": ["Array", "Test"]
  },
  {
    "title": "Test Question 2",
    "slug": "test-question-2",
    "difficulty": "Medium",
    "category": "Dynamic Programming",
    "source": "HACKERRANK",
    "external_url": "https://example.com/test-2",
    "is_active": true,
    "is_premium": true,
    "tags": ["DP", "Recursion"]
  }
]
```

## Performance Considerations

### Current Implementation
- **Sequential Processing**: Questions are imported one at a time
- **Duplicate Check**: Loads all existing titles into memory at the start
- **Transaction**: Single transaction for the entire batch

### For Large Datasets (3,000+ questions)
The current implementation works well for up to ~5,000 questions. For larger datasets:
- Expect ~12-15 seconds per 1,000 questions
- Memory usage is moderate (duplicate check list)
- Database connection pool should be adequate

### Future Optimizations (if needed)
1. **Batch Processing**: Save questions in chunks (e.g., 100 at a time)
2. **Query Optimization**: Use `EXISTS` query instead of loading all titles
3. **Async Processing**: Return immediate response with job ID, process in background
4. **Progress Tracking**: Add endpoint to check import progress

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Category cannot be null" | Missing or empty category field | Ensure all questions have a valid category |
| "Difficulty must be Easy, Medium, or Hard" | Invalid difficulty value | Check spelling and capitalization |
| "Source must be LEETCODE, HACKERRANK, or GFG" | Invalid source platform | Use one of the three supported platforms |
| "Tags cannot be null or empty" | Missing tags field | Provide at least one tag per question |
| "Title already exists" | Duplicate title | Question is skipped (not an error) |

### Transaction Rollback
The `@Transactional` annotation ensures:
- If a **critical database error** occurs, all changes are rolled back
- Individual validation errors don't trigger rollback (they're tracked in `failedImports`)
- Network/connection errors trigger rollback

## Testing

### Before Production Use

1. **Test with Small Batch** (2-5 questions)
   ```json
   [{"title": "Test", "slug": "test", ...}]
   ```

2. **Verify Categories Created**
   ```
   GET http://localhost:8080/api/questions/listCategories
   ```

3. **Check Imported Questions**
   ```
   GET http://localhost:8080/api/questions?page=0&size=30
   ```

4. **Test Duplicate Detection**
   - Import the same batch twice
   - Second import should show all as duplicates

5. **Test Error Handling**
   - Include question with invalid difficulty
   - Check that valid questions still import

### Load Testing (3,711 LeetCode Questions)

```powershell
# Measure import time
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$questions = Get-Content "etc/leetcode_dsa_questions.json" | ConvertFrom-Json
$result = Invoke-RestMethod -Uri "http://localhost:8080/api/questions/bulkImport" -Method Post -Body ($questions | ConvertTo-Json -Depth 10) -ContentType "application/json"
$stopwatch.Stop()

Write-Host "Import completed in $($stopwatch.Elapsed.TotalSeconds) seconds"
Write-Host "Server processing time: $($result.durationMs / 1000) seconds"
```

## Integration with Existing System

### Database Schema
The bulk import uses the existing Question entity schema:
- **Questions Table**: Stores imported questions
- **Categories Table**: Auto-created if needed
- **Tags Table**: Auto-created if needed
- **Question_Tags Join Table**: Links questions to tags

### Service Layer Integration
The bulk import method:
- Uses the existing `create(QuestionRequestDTO)` method
- Leverages existing category/tag auto-creation logic
- Maintains data consistency with current system

### Future Enhancements
- [ ] Add authentication/authorization
- [ ] Add progress tracking for large imports
- [ ] Add dry-run mode (validate without importing)
- [ ] Add import scheduling (cron jobs)
- [ ] Add conflict resolution strategies (update vs skip)
- [ ] Add import history logging

## Troubleshooting

### Issue: Import Takes Too Long
**Solution**: 
- Check database connection pool settings
- Verify MySQL performance (indexes on title column)
- Consider importing in smaller batches

### Issue: Out of Memory
**Solution**:
- Increase JVM heap size: `-Xmx2g`
- Process file in chunks instead of loading all at once

### Issue: Duplicate Detection Not Working
**Solution**:
- Check that titles match exactly (case-sensitive comparison)
- Verify database has existing questions
- Look at `skippedTitles` in response

### Issue: Categories Not Auto-Created
**Solution**:
- Check that category name is valid
- Verify `CategoryRepository` is working
- Check database constraints on categories table

## Related Documentation

- [LEETCODE_CONVERSION_SUMMARY.md](LEETCODE_CONVERSION_SUMMARY.md) - JSON conversion process
- [TEST_SUMMARY.md](../TEST_SUMMARY.md) - Testing strategy and coverage
- [TESTING_README.md](../TESTING_README.md) - How to run tests
- [README.md](../README.md) - Main project documentation

## API Version
**Version**: 3.0 (Production Ready)  
**Spring Boot**: 3.4.9  
**Java**: 21 (LTS)  
**Last Updated**: 2025
