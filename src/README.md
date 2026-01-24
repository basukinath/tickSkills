# TickSkills

This is the Spring Boot backend for the TickSkills question/user platform. It serves the REST APIs and ships a ready-to-use admin/practice dashboard at `/admin/dashboard.html` and `/practice/index.html`. The primary UI project is separate; this repo focuses on the services, endpoints, and tests.

## What's inside
- REST controllers and services for questions, users, and practice flows.
- Static HTML/JS/CSS served from [src/main/resources/static](src/main/resources/static) (admin + practice dashboards).
- Postman collection: [tickskills.postman_collection.json](tickskills.postman_collection.json).
- Tests (~65) using JUnit 5/Mockito; Gradle build.

## Run it
- Prereqs: Java 21, MySQL. Set DB credentials in [src/main/resources/application.properties](src/main/resources/application.properties).
- Dev server: `gradlew.bat bootRun`
- Build: `gradlew.bat clean build`
- Run jar: `java -jar build/libs/tickSkills-0.0.1-SNAPSHOT.jar`

## URLs after start
- Practice: http://localhost:8080/practice/index.html
- Admin dashboard: http://localhost:8080/admin/dashboard.html
- API base: http://localhost:8080/api/

## API testing
- Import Postman collection: [tickskills.postman_collection.json](tickskills.postman_collection.json).

## Tests
- Run all tests: `gradlew.bat test` (uses test settings in [src/test/resources/application.properties](src/test/resources/application.properties)).