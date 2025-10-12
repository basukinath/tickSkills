# PowerShell script to fix slug column issues
# Update these variables with your database credentials

$mysqlPath = "mysql"  # or full path like "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$username = "root"    # your MySQL username
$database = "tickskills"  # your database name

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Slug Column Fix - Choose Option" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Quick Fix - Make slug columns nullable (RECOMMENDED)" -ForegroundColor Green
Write-Host "   - Fastest solution" -ForegroundColor Gray
Write-Host "   - Works immediately" -ForegroundColor Gray
Write-Host "   - Keeps columns in database (harmless)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Complete Cleanup - Drop slug columns" -ForegroundColor Yellow
Write-Host "   - Removes columns completely" -ForegroundColor Gray
Write-Host "   - Cleaner database schema" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter your choice (1 or 2)"

$sqlFile = ""
if ($choice -eq "1") {
    $sqlFile = "make_slug_nullable.sql"
    Write-Host "`nUsing: $sqlFile (Quick Fix)" -ForegroundColor Green
} elseif ($choice -eq "2") {
    $sqlFile = "remove_slug_columns.sql"
    Write-Host "`nUsing: $sqlFile (Complete Cleanup)" -ForegroundColor Yellow
} else {
    Write-Host "`nInvalid choice. Exiting." -ForegroundColor Red
    exit 1
}

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: $sqlFile not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Database: $database" -ForegroundColor Cyan
Write-Host "Executing SQL script..." -ForegroundColor White
Write-Host ""

# Execute the SQL script
Get-Content $sqlFile | & $mysqlPath -u $username -p $database

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ SQL script executed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart your Spring Boot application" -ForegroundColor White
    Write-Host "2. Clear browser cache (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host "3. Try creating a question again" -ForegroundColor White
    Write-Host ""
    Write-Host "The slug error should now be fixed! ✓" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Error executing SQL script" -ForegroundColor Red
    Write-Host "You may need to run the SQL manually in MySQL Workbench" -ForegroundColor Yellow
    Write-Host "Or check if MySQL is in your PATH" -ForegroundColor Yellow
}
