#!/bin/bash

set -e

SERVICES=(
  "servicediscovery:service-discovery"
  "gatewayservice:gateway-service"
  "authservice:auth-service"
  "userservice:user-service"
  "productservice:product-service"
  "orderservice:order-service"
  "paymentservice:payment-service"
)

for ENTRY in "${SERVICES[@]}"; do
  FOLDER="${ENTRY%%:*}"
  IMAGE="${ENTRY##*:}"

  echo ""
  echo "========================================"
  echo "Building Docker image: $IMAGE"
  echo "From folder: $FOLDER"
  echo "========================================"

  docker build -t "$IMAGE" "./$FOLDER"
done

echo ""
echo "========================================"
echo "ALL DOCKER IMAGES BUILT SUCCESSFULLY"
echo "========================================"

echo ""
echo "Available images:"
docker images