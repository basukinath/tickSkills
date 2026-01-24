# Generate SQL UPDATE statements to set is_active based on leetcode_dsa_questions.json

Write-Host "Loading leetcode_dsa_questions.json..."
$dsaContent = Get-Content "d:\wrkspc\tickSkillsGradle\etc\leetcode_dsa_questions.json" -Raw | ConvertFrom-Json

# Separate active and inactive questions
$activeQuestions = $dsaContent | Where-Object { $_.is_active -eq $true }
$inactiveQuestions = $dsaContent | Where-Object { $_.is_active -eq $false }

Write-Host "`nStatistics:"
Write-Host "  Total questions: $($dsaContent.Count)"
Write-Host "  Active (is_active = true): $($activeQuestions.Count)"
Write-Host "  Inactive (is_active = false): $($inactiveQuestions.Count)"

# Generate SQL file
$sqlFile = "d:\wrkspc\tickSkillsGradle\etc\update_is_active.sql"
$sqlContent = @"
-- Update is_active column for all questions based on leetcode_dsa_questions.json
-- Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
-- Total questions: $($dsaContent.Count)
-- Active: $($activeQuestions.Count), Inactive: $($inactiveQuestions.Count)

-- First, set all questions to inactive
UPDATE question SET is_active = FALSE;

-- Then, set specific questions to active based on title
"@

# Add UPDATE statements for active questions (batch by title)
if ($activeQuestions.Count -gt 0) {
    $titles = $activeQuestions | ForEach-Object { 
        $escapedTitle = $_.title -replace "'", "''"  # Escape single quotes
        "'$escapedTitle'"
    }
    
    # Split into batches of 100 for better performance
    $batchSize = 100
    for ($i = 0; $i -lt $titles.Count; $i += $batchSize) {
        $batch = $titles[$i..[Math]::Min($i + $batchSize - 1, $titles.Count - 1)]
        $titleList = $batch -join ", "
        $sqlContent += "`nUPDATE question SET is_active = TRUE WHERE title IN ($titleList);"
    }
}

$sqlContent += "`n`n-- Verify counts"
$sqlContent += "`nSELECT 'Active' as status, COUNT(*) as count FROM question WHERE is_active = TRUE"
$sqlContent += "`nUNION ALL"
$sqlContent += "`nSELECT 'Inactive' as status, COUNT(*) as count FROM question WHERE is_active = FALSE;"

# Save SQL file
Set-Content -Path $sqlFile -Value $sqlContent -Encoding UTF8

Write-Host "`nSQL file generated: $sqlFile"
Write-Host "`nTo apply these changes:"
Write-Host "  1. Review the SQL file"
Write-Host "  2. Connect to your database"
Write-Host "  3. Run the SQL script"
Write-Host "  4. Verify the counts match: Active=$($activeQuestions.Count), Inactive=$($inactiveQuestions.Count)"
