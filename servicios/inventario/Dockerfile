# Build stage: uses the project's own Gradle wrapper, so the Gradle version always matches
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /src
COPY . .
RUN chmod +x gradlew \
 && ./gradlew bootJar -x test --no-daemon \
 && cp "$(ls build/libs/*.jar | grep -v plain | head -n 1)" /app.jar

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
