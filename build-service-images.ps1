# Stop execution on first error
$ErrorActionPreference = "Stop"

# Auto-detect Docker CLI if not currently in PATH
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    $dockerDefaultPath = "C:\Program Files\Docker\Docker\resources\bin"
    if (Test-Path "$dockerDefaultPath\docker.exe") {
        $env:Path = "$dockerDefaultPath;" + $env:Path
        Write-Host "Added Docker to session PATH from: $dockerDefaultPath" -ForegroundColor Yellow
    } else {
        Write-Error "Docker CLI not found in PATH or at default installation directory ($dockerDefaultPath)."
        exit 1
    }
}

# Verify Docker daemon is running
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker daemon is not running. Please start Docker Desktop first and wait until it is running!"
        exit 1
    }
} catch {
    Write-Error "Could not connect to Docker daemon. Please ensure Docker Desktop is started!"
    exit 1
}

$services = @(
  @{ Folder = "servicediscovery"; Image = "service-discovery" },
  @{ Folder = "gatewayservice";   Image = "gateway-service" },
  @{ Folder = "authservice";      Image = "auth-service" },
  @{ Folder = "userservice";      Image = "user-service" },
  @{ Folder = "productservice";   Image = "product-service" },
  @{ Folder = "orderservice";     Image = "order-service" },
  @{ Folder = "paymentservice";   Image = "payment-service" },
  @{ Folder = "inventoryservice"; Image = "inventory-service" }
)

foreach ($entry in $services) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Building Docker image: $($entry.Image)" -ForegroundColor Cyan
    Write-Host "From folder: $($entry.Folder)" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

    docker build -t $entry.Image "./$($entry.Folder)"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed for $($entry.Image)"
        exit $LASTEXITCODE
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ALL DOCKER IMAGES BUILT SUCCESSFULLY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Available images:" -ForegroundColor Cyan
docker images
