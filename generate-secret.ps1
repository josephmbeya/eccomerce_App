# Generate NextAuth Secret Key
Write-Host "Generating NextAuth secret key..." -ForegroundColor Green

# Generate a random 32-byte key and encode it as base64
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

Write-Host ""
Write-Host "Your NextAuth secret key is:" -ForegroundColor Yellow
Write-Host $secret -ForegroundColor Cyan
Write-Host ""
Write-Host "Add this to your Vercel environment variables as:" -ForegroundColor Green
Write-Host "NEXTAUTH_SECRET=$secret" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
