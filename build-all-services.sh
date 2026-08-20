#!/bin/bash

set -e

echo "========================================"
echo "Building all microservices with Java:"
java -version
echo "========================================"

SERVICES=(
  "servicediscovery"
  "gatewayservice"
  "authservice"
  "userservice"
  "productservice"
  "orderservice"
  "paymentservice"
)

for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "========================================"
  echo "Building: $SERVICE"
  echo "========================================"

  cd "$SERVICE"

  # Give Maven Wrapper permission to execute
  chmod +x mvnw

  # Build JAR without running tests
  ./mvnw clean package -DskipTests

  # Verify JAR was created
  echo ""
  echo "Generated JAR:"
  ls -lh target/*.jar

  cd ..
done

echo ""
echo "========================================"
echo "ALL SERVICES BUILT SUCCESSFULLY"
echo "========================================"