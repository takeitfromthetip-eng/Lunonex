# ForTheWeebs .env Encryption Script
# ⚠️ You will be prompted for the encryption password

Write-Host "🔐 ForTheWeebs Environment Encryption" -ForegroundColor Cyan
Write-Host ""

$password = Read-Host "Enter encryption password" -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
$salt = [byte[]]@(0x53,0x63,0x6F,0x72,0x70,0x69,0x6F,0x23,0x39,0x36,0x21,0x40,0x23,0x24,0x25,0x5E)

try {
    # Derive encryption key and IV from password
    $key = (New-Object Security.Cryptography.Rfc2898DeriveBytes($password, $salt, 10000)).GetBytes(32)
    $iv = (New-Object Security.Cryptography.Rfc2898DeriveBytes($password, $salt, 10000)).GetBytes(16)
    
    # Create AES encryptor
    $aes = New-Object Security.Cryptography.AesCryptoServiceProvider
    $aes.Key = $key
    $aes.IV = $iv
    $encryptor = $aes.CreateEncryptor()
    
    # Read .env file
    if (-not (Test-Path '.env')) {
        Write-Host "❌ .env file not found!" -ForegroundColor Red
        exit 1
    }
    
    $plaintext = Get-Content -Path '.env' -Raw -Encoding UTF8
    $plaintextBytes = [Text.Encoding]::UTF8.GetBytes($plaintext)
    
    # Encrypt
    $encryptedBytes = $encryptor.TransformFinalBlock($plaintextBytes, 0, $plaintextBytes.Length)
    $encryptedBase64 = [Convert]::ToBase64String($encryptedBytes)
    
    # Save encrypted file
    Set-Content -Path '.env.encrypted' -Value $encryptedBase64 -NoNewline
    
    Write-Host "✅ .env file encrypted successfully!" -ForegroundColor Green
    Write-Host "📁 Location: .\.env.encrypted" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 To decrypt, run: .\decrypt-env.ps1" -ForegroundColor Cyan
    Write-Host "⚠️  Safe to commit .env.encrypted to Git" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Encryption failed: $_" -ForegroundColor Red
    exit 1
}
