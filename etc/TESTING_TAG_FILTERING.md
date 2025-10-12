# Quick Testing Guide - Tag Filtering Feature

## Prerequisites
1. Spring Boot application running on `http://localhost:8080`
2. Database populated with questions (preferably the 3,711 LeetCode questions)

## PowerShell Test Commands

### 1. List All Available Tags
```powershell
# Get all tags in the system
$tags = Invoke-RestMethod -Uri "http://localhost:8080/api/questions/listTags"
Write-Host "Total tags available: $($tags.Count)" -ForegroundColor Green
$tags | Select-Object -First 10 | Format-Table
```

**Expected Output:**
```
Total tags available: 50+
id  name
--  ----
1   Array
2   Hash Table
3   Dynamic Programming
...
```

### 2. Filter Questions by Tag
```powershell
# Get questions with "Array" tag (first page)
$arrayQuestions = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&page=0&size=10"
Write-Host "`nArray Questions - Total: $($arrayQuestions.totalElements)" -ForegroundColor Cyan
Write-Host "Showing page $($arrayQuestions.number + 1) of $($arrayQuestions.totalPages)" -ForegroundColor Cyan
$arrayQuestions.content | Select-Object id, title, difficulty | Format-Table -AutoSize
```

**Expected Output:**
```
Array Questions - Total: 1556
Showing page 1 of 156

id  title                    difficulty
--  -----                    ----------
1   Two Sum                  EASY
15  3Sum                     MEDIUM
18  4Sum                     MEDIUM
...
```

### 3. Combine Tag + Difficulty Filters
```powershell
# Get Easy questions with "Array" tag
$easyArrays = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&difficulty=Easy"
Write-Host "`nEasy Array Questions: $($easyArrays.totalElements)" -ForegroundColor Yellow
$easyArrays.content | Select-Object -First 5 | Select-Object title, difficulty, @{Name='Tags';Expression={$_.tags.name -join ', '}} | Format-Table -Wrap
```

**Expected Output:**
```
Easy Array Questions: 450

title                       difficulty  Tags
-----                       ----------  ----
Two Sum                     EASY        Array, Hash Table
Remove Duplicates           EASY        Array, Two Pointers
Best Time to Buy Stock      EASY        Array, Dynamic Programming
...
```

### 4. Combine Tag + Category + Source Filters
```powershell
# Get LeetCode "Arrays & Hashing" category questions with "Array" tag
$params = @{
    Uri = "http://localhost:8080/api/questions"
    Body = @{
        tagName = "Array"
        categoryName = "Arrays & Hashing"
        source = "LEETCODE"
        page = 0
        size = 5
    }
}
$filtered = Invoke-RestMethod @params
Write-Host "`nFiltered Results: $($filtered.totalElements) questions" -ForegroundColor Magenta
$filtered.content | Select-Object title, @{Name='Category';Expression={$_.category.name}}, source | Format-Table
```

### 5. Search + Tag Filter
```powershell
# Find questions with "sum" in title AND "Array" tag
$searchResults = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&search=sum"
Write-Host "`nSearch Results for 'sum' with Array tag: $($searchResults.totalElements)" -ForegroundColor Green
$searchResults.content | Select-Object title, difficulty | Format-Table
```

**Expected Output:**
```
Search Results for 'sum' with Array tag: 45

title                       difficulty
-----                       ----------
Two Sum                     EASY
3Sum                        MEDIUM
4Sum                        MEDIUM
Maximum Subarray Sum        EASY
...
```

### 6. Test Multiple Tags (Get all questions for different tags)
```powershell
# Test different tags
$testTags = @("Array", "Hash Table", "Dynamic Programming", "String", "Math")

foreach ($tag in $testTags) {
    $result = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=$tag&size=1"
    Write-Host "$tag : $($result.totalElements) questions" -ForegroundColor Cyan
}
```

**Expected Output:**
```
Array : 1556 questions
Hash Table : 856 questions
Dynamic Programming : 527 questions
String : 222 questions
Math : 141 questions
```

### 7. Test Pagination with Tag Filter
```powershell
# Get multiple pages of Array questions
Write-Host "`nPagination Test - Array Questions:" -ForegroundColor Yellow

for ($i = 0; $i -lt 3; $i++) {
    $page = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&page=$i&size=5"
    Write-Host "`nPage $($i + 1):" -ForegroundColor Green
    $page.content | Select-Object id, title | Format-Table
}
```

### 8. Compare Filtered vs Unfiltered Results
```powershell
# Get total questions
$allQuestions = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?size=1"
Write-Host "Total questions in database: $($allQuestions.totalElements)" -ForegroundColor White

# Get filtered by tag
$arrayQuestions = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&size=1"
Write-Host "Questions with Array tag: $($arrayQuestions.totalElements)" -ForegroundColor Cyan

# Calculate percentage
$percentage = [math]::Round(($arrayQuestions.totalElements / $allQuestions.totalElements) * 100, 2)
Write-Host "Array questions represent $percentage% of total" -ForegroundColor Green
```

### 9. Test Tag + Difficulty + Source Combinations
```powershell
# Test different combinations
$combinations = @(
    @{tagName="Array"; difficulty="Easy"; desc="Easy Arrays"},
    @{tagName="Array"; difficulty="Medium"; desc="Medium Arrays"},
    @{tagName="Array"; difficulty="Hard"; desc="Hard Arrays"},
    @{tagName="Dynamic Programming"; difficulty="Medium"; desc="Medium DP"},
    @{tagName="Graph"; source="LEETCODE"; desc="LeetCode Graphs"}
)

Write-Host "`nFilter Combinations:" -ForegroundColor Yellow
foreach ($combo in $combinations) {
    $uri = "http://localhost:8080/api/questions?size=1"
    if ($combo.tagName) { $uri += "&tagName=$($combo.tagName)" }
    if ($combo.difficulty) { $uri += "&difficulty=$($combo.difficulty)" }
    if ($combo.source) { $uri += "&source=$($combo.source)" }
    
    $result = Invoke-RestMethod -Uri $uri
    Write-Host "$($combo.desc): $($result.totalElements) questions" -ForegroundColor Cyan
}
```

### 10. Comprehensive Filter Test
```powershell
# Test all filters together
$allFilters = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&categoryName=Arrays & Hashing&difficulty=Medium&source=LEETCODE&search=sum&page=0&size=10"

Write-Host "`n=== COMPREHENSIVE FILTER TEST ===" -ForegroundColor Magenta
Write-Host "Filters Applied:" -ForegroundColor Yellow
Write-Host "  - Tag: Array"
Write-Host "  - Category: Arrays & Hashing"
Write-Host "  - Difficulty: Medium"
Write-Host "  - Source: LEETCODE"
Write-Host "  - Search: sum"
Write-Host "`nResults Found: $($allFilters.totalElements)" -ForegroundColor Green
Write-Host "Total Pages: $($allFilters.totalPages)" -ForegroundColor Green

if ($allFilters.content.Count -gt 0) {
    Write-Host "`nSample Results:" -ForegroundColor Cyan
    $allFilters.content | Select-Object title, difficulty, @{Name='Tags';Expression={$_.tags.name -join ', '}} | Format-Table -Wrap
}
```

## Quick Validation Checklist

After running the tests, verify:

- [ ] `listTags` endpoint returns all tags
- [ ] Filtering by single tag works
- [ ] Filtering by tag + difficulty works
- [ ] Filtering by tag + category works
- [ ] Filtering by tag + source works
- [ ] Search + tag filter works together
- [ ] Pagination works with tag filtering
- [ ] Combining all filters works
- [ ] Results are accurate (manually verify a few)
- [ ] Response includes proper tag information in results

## Expected LeetCode Dataset Results

If you've imported the full 3,711 LeetCode questions, expect approximately:

| Tag | Approximate Count |
|-----|-------------------|
| Array | ~1,200-1,600 |
| Hash Table | ~800-900 |
| Dynamic Programming | ~500-600 |
| String | ~400-500 |
| Math | ~300-400 |
| Greedy | ~300-400 |
| Sorting | ~250-350 |
| Binary Search | ~250-300 |
| Tree | ~200-250 |
| Graph | ~200-250 |

## Troubleshooting

### No Results Found
```powershell
# Check if tags exist
$tags = Invoke-RestMethod -Uri "http://localhost:8080/api/questions/listTags"
if ($tags.Count -eq 0) {
    Write-Host "No tags found. Import questions first with bulk import." -ForegroundColor Red
}
```

### Invalid Tag Name
```powershell
# Test with non-existent tag (should return empty results)
$invalid = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=NonExistentTag"
if ($invalid.totalElements -eq 0) {
    Write-Host "Correctly returns 0 results for invalid tag" -ForegroundColor Green
}
```

### Server Not Running
```powershell
try {
    $test = Invoke-RestMethod -Uri "http://localhost:8080/api/questions/listTags"
    Write-Host "Server is running!" -ForegroundColor Green
} catch {
    Write-Host "Server not responding. Start with: ./gradlew bootRun" -ForegroundColor Red
}
```

## Performance Testing

```powershell
# Test query performance
Write-Host "Testing query performance..." -ForegroundColor Yellow

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$result = Invoke-RestMethod -Uri "http://localhost:8080/api/questions?tagName=Array&page=0&size=100"
$stopwatch.Stop()

Write-Host "Query returned $($result.content.Count) results in $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Cyan
Write-Host "Total matching records: $($result.totalElements)" -ForegroundColor Cyan

if ($stopwatch.ElapsedMilliseconds -lt 500) {
    Write-Host "✓ Performance is excellent!" -ForegroundColor Green
} elseif ($stopwatch.ElapsedMilliseconds -lt 1000) {
    Write-Host "✓ Performance is good" -ForegroundColor Yellow
} else {
    Write-Host "⚠ Performance could be improved - consider adding database indexes" -ForegroundColor Red
}
```

## Complete Test Script

```powershell
# Save as test-tag-filtering.ps1 and run

$baseUrl = "http://localhost:8080/api/questions"

Write-Host "=== TAG FILTERING FEATURE TEST SUITE ===" -ForegroundColor Magenta
Write-Host ""

# Test 1: List Tags
Write-Host "Test 1: Listing all tags..." -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "$baseUrl/listTags"
    Write-Host "✓ Found $($tags.Count) tags" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to list tags: $_" -ForegroundColor Red
}

# Test 2: Filter by Tag
Write-Host "`nTest 2: Filtering by 'Array' tag..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl?tagName=Array&size=5"
    Write-Host "✓ Found $($result.totalElements) Array questions" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to filter by tag: $_" -ForegroundColor Red
}

# Test 3: Combined Filters
Write-Host "`nTest 3: Combined filters (Tag + Difficulty)..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "$baseUrl?tagName=Array&difficulty=Easy"
    Write-Host "✓ Found $($result.totalElements) Easy Array questions" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed combined filter: $_" -ForegroundColor Red
}

# Test 4: Pagination
Write-Host "`nTest 4: Pagination with tag filter..." -ForegroundColor Yellow
try {
    $page1 = Invoke-RestMethod -Uri "$baseUrl?tagName=Array&page=0&size=10"
    $page2 = Invoke-RestMethod -Uri "$baseUrl?tagName=Array&page=1&size=10"
    Write-Host "✓ Page 1: $($page1.content.Count) results" -ForegroundColor Green
    Write-Host "✓ Page 2: $($page2.content.Count) results" -ForegroundColor Green
} catch {
    Write-Host "✗ Pagination failed: $_" -ForegroundColor Red
}

Write-Host "`n=== ALL TESTS COMPLETED ===" -ForegroundColor Magenta
```

Run with:
```powershell
.\test-tag-filtering.ps1
```
