# Use lightweight Java runtime
FROM eclipse-temurin:17-jdk-jammy

# Create app directory
WORKDIR /app

# Copy jar from target folder
COPY target/*.jar app.jar

# Expose service port
EXPOSE 8086

# Run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]
