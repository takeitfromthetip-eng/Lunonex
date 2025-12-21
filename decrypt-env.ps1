# ForTheWeebs .env Decryption Script
# ⚠️ You will be prompted for the encryption password

Write-Host "🔐 ForTheWeebs Environment Decryption" -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Enter decryption password" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
$salt = [byte[]]@(0x53,0x63,0x6F,0x72,0x70,0x69,0x6F,0x23,0x39,0x36,0x21,0x40,0x23,0x24,0x25,0x5E)

try {
    # Derive encryption key and IV from password
    $key = (New-Object Security.Cryptography.Rfc2898DeriveBytes($password, $salt, 10000)).GetBytes(32)
    $iv = (New-Object Security.Cryptography.Rfc2898DeriveBytes($password, $salt, 10000)).GetBytes(16)
    
    # Create AES decryptor
    $aes = New-Object Security.Cryptography.AesCryptoServiceProvider
    $aes.Key = $key
    $aes.IV = $iv
    $decryptor = $aes.CreateDecryptor()
    
    # Read encrypted file
    if (-not (Test-Path '.env.encrypted')) {
        Write-Host "❌ .env.encrypted file not found!" -ForegroundColor Red
        exit 1
    }
    
    $encryptedBase64 = Get-Content -Path '.env.encrypted' -Raw
    $encryptedBytes = [Convert]::FromBase64String($encryptedBase64)
    
    # Decrypt
    $decryptedBytes = $decryptor.TransformFinalBlock($encryptedBytes, 0, $encryptedBytes.Length)
    $decryptedText = [Text.Encoding]::UTF8.GetString($decryptedBytes)
    
    # Save decrypted .env file
    Set-Content -Path '.env' -Value $decryptedText -NoNewline -Encoding UTF8
    
    Write-Host "✅ .env file decrypted successfully!" -ForegroundColor Green
    Write-Host "📁 Location: .\.env" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Remember to re-encrypt before committing to Git!" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Decryption failed: $_" -ForegroundColor Red
    exit 1
}
