# Load the files
Write-Host "Loading leetcode_questions_updated.json..."
$updatedContent = Get-Content "d:\wrkspc\tickSkillsGradle\etc\leetcode_questions_updated.json" -Raw | ConvertFrom-Json

Write-Host "Loading leetcode_dsa_questions.json..."
$dsaContent = Get-Content "d:\wrkspc\tickSkillsGradle\etc\leetcode_dsa_questions.json" -Raw | ConvertFrom-Json

# Get titles where isActive is false from updated file
Write-Host "Extracting titles with isActive=false..."
$falseTitlesArray = $updatedContent.data.question | Where-Object { $_.isActive -eq $false } | Select-Object -ExpandProperty title

Write-Host "Found $($falseTitlesArray.Count) titles with isActive=false"

# Create a hashtable for faster lookup (using Hashtable instead of HashSet to avoid null issues)
$falseTitlesHash = @{}
foreach ($title in $falseTitlesArray) {
    if ($null -ne $title -and $title -ne "") {
        $falseTitlesHash[$title] = $true
    }
}

Write-Host "Created lookup table with $($falseTitlesHash.Count) unique titles"

# Update the DSA file
Write-Host "Updating leetcode_dsa_questions.json..."
$changeCount = 0
$skippedCount = 0

foreach ($question in $dsaContent) {
    if ($null -ne $question -and $null -ne $question.title -and $falseTitlesHash.ContainsKey($question.title)) {
        if ($question.is_active -eq $true) {
            $question.is_active = $false
            $changeCount++
        }
    }
}

Write-Host "Total questions updated: $changeCount"

# Save the updated file
Write-Host "Saving updated file..."
$jsonOutput = $dsaContent | ConvertTo-Json -Depth 100
Set-Content "d:\wrkspc\tickSkillsGradle\etc\leetcode_dsa_questions.json" -Value $jsonOutput -Encoding UTF8

Write-Host "File saved successfully!"
Write-Host "`nSummary:"
Write-Host "  - Questions with isActive=false in updated file: $($falseTitlesArray.Count)"
Write-Host "  - Questions updated in DSA file: $changeCount"
