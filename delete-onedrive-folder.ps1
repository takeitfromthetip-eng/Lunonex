$path = "C:\Users\polot\OneDrive\Desktop\fortheweebs"

if (Test-Path $path) {
    try {
        # Try to remove hidden/readonly attributes
        Get-ChildItem $path -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
            $_.Attributes = 'Normal'
        }

        # Delete the folder
        Remove-Item $path -Recurse -Force -ErrorAction Stop
        Write-Host "Successfully deleted OneDrive folder" -ForegroundColor Green
    } catch {
        Write-Host "Failed: Folder is locked by OneDrive sync" -ForegroundColor Red
        Write-Host "You'll need to manually delete it after OneDrive releases the lock" -ForegroundColor Yellow
    }
} else {
    Write-Host "Folder already deleted" -ForegroundColor Gray
}
