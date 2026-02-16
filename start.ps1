Write-Host "Starting School Entry Test System..."
$env:Path = "C:\Program Files\nodejs;" + $env:Path
Start-Process "http://localhost:3000"
npm run dev
