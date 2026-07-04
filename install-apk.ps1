$adb = "C:\Users\Akash Misal\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$apk = "C:\Users\Akash Misal\Desktop\RakshakApp\RakshakApp-Release.apk"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RAKSHAKAPP - AUTO INSTALLER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Connect your phone via USB cable" -ForegroundColor White
Write-Host "Step 2: Allow 'USB Debugging' on your phone when asked" -ForegroundColor White
Write-Host ""
Write-Host "Waiting for phone to connect..." -ForegroundColor Green

# Wait for any device to connect
& $adb wait-for-device

Write-Host ""
Write-Host "Phone detected! Checking device..." -ForegroundColor Green
Start-Sleep -Seconds 2

$devices = & $adb devices
Write-Host $devices

# Uninstall old version silently (ignores error if not installed)
Write-Host ""
Write-Host "Removing old version if exists..." -ForegroundColor Yellow
& $adb uninstall com.rakshak.app 2>$null

Start-Sleep -Seconds 1

# Install the APK
Write-Host ""
Write-Host "Installing RakshakApp..." -ForegroundColor Cyan
$result = & $adb install -r $apk

if ($result -match "Success") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   SUCCESS! RakshakApp Installed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The app is now installed on your phone." -ForegroundColor White
    Write-Host "Open RakshakApp from your app drawer." -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Installation output: $result" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying force install..." -ForegroundColor Yellow
    & $adb install -r -d $apk
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
