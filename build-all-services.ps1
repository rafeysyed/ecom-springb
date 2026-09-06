# Stop execution on first error
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building all microservices with Java:" -ForegroundColor Cyan
java -version
Write-Host "========================================" -ForegroundColor Cyan

$services = @(
  "servicediscovery",
  "gatewayservice",
  "authservice",
  "userservice",
  "productservice",
  "orderservice",
  "paymentservice"
)

foreach ($service in $services) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Building: $service" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    Push-Location $service
    try {
        & .\mvnw.cmd clean package -DskipTests
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Build failed for $service"
            exit $LASTEXITCODE
        }

        Write-Host ""
        Write-Host "Generated JAR:" -ForegroundColor Green
        Get-ChildItem -Path "target\*.jar" | Where-Object { $_.Name -notmatch "\.original$" } | Select-Object Name, Length
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ALL SERVICES BUILT SUCCESSFULLY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
