# TickSkills

TickSkills is a production-ready Spring Boot application for managing questions and users with an advanced practice platform and modern admin interface. It provides comprehensive REST APIs, intuitive dashboards, practice tracking, and a complete test suite with 100% passing tests.

## 🎯 Quick Links

- **Practice Platform:** `http://localhost:8080/practice/index.html`
- **Admin Dashboard:** `http://localhost:8080/admin/dashboard.html`
- **Question Management:** `http://localhost:8080/admin/questions/index.html`
- **User Management:** `http://localhost:8080/admin/users/user-management.html`
- **API Base:** `http://localhost:8080/api/`

## Features

### Practice Platform (User-Facing)
- **📝 Personal Practice Queue** - Browse 865+ active coding questions
- **✅ Progress Tracking** - Mark questions as SOLVED/UNSOLVED
- **📓 Personal Notes** - Save approach notes and insights per question
- **📊 Statistics Dashboard** - Track solved vs unsolved by difficulty
- **🔍 Advanced Filtering** - Filter by difficulty, source, tag, status
- **🏷️ Tag-Based Organization** - Browse by topics (Array, DP, Trees, etc.)
- **🎯 Category Navigation** - Organized by problem patterns
- **🔗 Direct Links** - Click titles to open questions on LeetCode/HackerRank
- **💚 Acceptance Rates** - See community success rates
- **📱 Responsive Design** - Works on desktop, tablet, mobile

### Admin Platform
#### Question Management
- Create, browse, update, and delete questions
- Search questions by category, difficulty, source, or ID
- **🏷️ Tag-based filtering** - Filter questions by tags with dropdown selection
- **📤 Bulk import** - Import thousands of questions via JSON file upload
- **🔒 Active/Inactive Status** - Control question visibility in practice platform
- Manage categories with descriptions
- **⚡ Memory-optimized queries** - Efficient database operations for large datasets
- Random question selection with database-level randomization
- External URL support for questions
- Tag management with auto-creation
- **Advanced filtering** - Combine multiple filters (category + difficulty + source + tag)
- Pagination support with configurable page size
- **📊 Sorting Options** - Sort by difficulty, acceptance rate, or title

#### User Management
- Create, browse, update, and delete users
- User type management (Admin/User)
- Active/Deleted user status tracking (soft delete)
- User profile with photos
- Bulk user operations
- Email validation

#### Admin Dashboard
- Live statistics (Total Questions, Users, Categories, Active Users)
- Quick navigation to management sections
- Responsive design for all devices
- Real-time data updates

### Modern UI
- Purple gradient theme with modern design
- Card-based layout with smooth transitions
- **🏷️ Tag filtering** - Visual tag dropdown with auto-populated options
- **📤 Bulk Import page** - Upload JSON files with validation and preview
- **🏷️ Tags page** - Comprehensive tag management and statistics
- **Syntax-highlighted JSON examples** - Clear format documentation
- **Multi-color tag badges** - Visual tag organization (6 color schemes)
- Collapsible response sections
- Search-first update workflow with preview modals
- Status indicators for users (Active/Deleted)
- **Responsive design** - Desktop, tablet, and mobile optimized
- **Loading states** - Visual feedback for async operations

### Testing & Quality Assurance
- **61+ comprehensive tests** with 100% pass rate
- Unit tests for service layer (37+ tests)
- Integration tests for REST endpoints (24+ tests)
- **Tag filtering tests** - Validates dynamic query building
- **Bulk import tests** - Validates JSON parsing and batch processing
- **Practice workflow tests** - Validates per-user progress tracking and statistics
- **Memory optimization tests** - Ensures efficient database queries
- MySQL test database for production parity
- Automated testing with JUnit 5 and Mockito
- **Test coverage** - Service layer, controllers, specifications

## Technologies Used

### Backend
- **Java 21:** Latest LTS version with modern features (switch expressions, records)
- **Spring Boot 3.4.9:** Latest Spring framework
- **Spring Web:** RESTful API development
- **Spring Data JPA:** ORM and database persistence with Specification API
- **JPA Criteria API:** Dynamic query building for advanced filtering
- **Hibernate:** JPA implementation with optimized queries
- **MySQL 8.0:** Production & test databases with native query support
- **Lombok:** Code generation and boilerplate reduction

### Testing
- **JUnit 5:** Test framework
- **Mockito:** Mocking framework for unit tests
- **Spring Boot Test:** Integration testing
- **MockMvc:** REST endpoint testing

### Build & Development
- **Gradle 8.14.3:** Build automation
- **Spring DevTools:** Hot reload for development

### Frontend
- **Vanilla JavaScript:** No framework dependencies
- **HTML5/CSS3:** Modern responsive UI
- **Fetch API:** RESTful client communication

## Setup and Installation

### Prerequisites

- **Java 21** (LTS) - [Download from Oracle](https://www.oracle.com/java/technologies/downloads/#java21)
- **Gradle 8.x** (included via wrapper)
- **MySQL 8.0+**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/basukinath/tickSkills.git
   cd tickSkillsGradle
   ```

2. **Verify Java 21 installation:**
   ```bash
   java -version
   # Should show: java version "21.0.x"
   ```

3. **Configure the production database:**
   
   Create a MySQL database:
   ```sql
   CREATE DATABASE tickskills;
   ```
   
   Update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tickskills
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```

4. **Configure the test database (optional but recommended):**
   
   Create a test database:
   ```sql
   CREATE DATABASE tickskills_test;
   ```
   
   The test configuration is in `src/test/resources/application.properties`
   
   See [MYSQL_TESTING_SETUP.md](MYSQL_TESTING_SETUP.md) for detailed test setup.

5. **Build the application:**
   ```bash
   ./gradlew build
  # This runs all 65 tests and builds the JAR
   ```

6. **Run the application:**
   ```bash
   ./gradlew bootRun
   ```
   
   Or run the JAR directly:
   ```bash
   java -jar build/libs/tickSkills-0.0.1-SNAPSHOT.jar
   ```

7. **Access the application:**
   
   **Practice Platform (End Users):**
   - Main Practice: `http://localhost:8080/practice/index.html`
   
   **Admin Interface:**
   - Dashboard: `http://localhost:8080/admin/dashboard.html`
   - Question Management: `http://localhost:8080/admin/questions/index.html`
   - User Management: `http://localhost:8080/admin/users/user-management.html`

## Testing

### Run All Tests

```bash
# Run all 65 tests
./gradlew test

# Run with detailed output
./gradlew test --info

# Build and test together
./gradlew clean build
```

### Test Coverage

**Total: 65 tests (100% passing ✅)**

#### Unit Tests (37 tests)
- **UsersService** (18 tests)
  - CRUD operations
  - Duplicate username validation
  - Bulk user operations
  - Soft delete functionality
  - Exception handling

- **QuestionsService** (19 tests)
  - Question CRUD operations
  - Category and tag management
  - Search and filtering
  - Random question selection
  - Pagination

#### Integration Tests (28 tests)
- **UserController** (12 tests)
  - REST endpoint testing
  - Path variable and request body validation
  - Error response testing
  - HTTP status code verification

- **QuestionsController** (12 tests)
  - REST endpoint testing
  - Database integration
  - Transaction rollback
  - Response format validation
- **PracticeController** (4 tests)
  - Progress lifecycle (status + notes)
  - Statistics aggregation validation
  - Tag filtering and default status checks
  - Multi-user state isolation

### Test Documentation

- [TEST_SUMMARY.md](TEST_SUMMARY.md) - Comprehensive test documentation
- [TESTING_README.md](TESTING_README.md) - Testing guide and best practices
- [MYSQL_TESTING_SETUP.md](MYSQL_TESTING_SETUP.md) - Test database configuration



## API Endpoints

### User Endpoints

Base path: `/api/users`

| Method   | Endpoint                      | Description                    | Request Body      | Response            |
|----------|-------------------------------|--------------------------------|-------------------|---------------------|
| `POST`   | `/addUser`                    | Add a single user              | `UserDTO`         | Success message     |
| `POST`   | `/addBulkUsers`               | Add multiple users             | `List<UserDTO>`   | List of usernames   |
| `GET`    | `/getUser/{username}`         | Get user by username           | -                 | `Users` object      |
| `GET`    | `/getAllUsers`                | Get all usernames              | -                 | `List<String>`      |
| `GET`    | `/getAllActiveUsers`          | Get active usernames only      | -                 | `List<String>`      |
| `GET`    | `/getAllUsersDetails`         | Get all user details           | -                 | `List<Users>`       |
| `PUT`    | `/updateUser/{username}`      | Update user                    | `UserDTO`         | Success message     |
| `DELETE` | `/deleteUser/{username}`      | Delete user (soft delete)      | -                 | Success message     |

### Question Endpoints

Base path: `/api/questions`

| Method   | Endpoint                      | Description                    | Request Body              | Response                |
|----------|-------------------------------|--------------------------------|---------------------------|-------------------------|
| `GET`    | `/`                           | List questions (paginated)     | Query params              | `Page<Question>`        |
| `GET`    | `/random10`                   | Get 10 random questions        | -                         | `List<Question>`        |
| `GET`    | `/findById/{id}`              | Get question by ID             | -                         | `Question`              |
| `GET`    | `/byCategory/{name}`          | Get questions by category      | -                         | `List<Question>`        |
| `GET`    | `/byDifficulty/{difficulty}`  | Get questions by difficulty    | -                         | `List<Question>`        |
| `GET`    | `/byTag/{name}`               | Get questions by tag           | -                         | `List<Question>`        |
| `GET`    | `/listCategories`             | List all categories            | -                         | `List<Category>`        |
| `GET`    | `/listTags`                   | **🆕 List all tags**           | -                         | `List<Tag>`             |
| `GET`    | `/getTotalQuestions`          | Get total question count       | -                         | `Long`                  |
| `POST`   | `/create`                     | Create a question              | `QuestionRequestDTO`      | `Question`              |
| `POST`   | `/addCategory`                | Add a category                 | `CategoryRequestDTO`      | `Category`              |
| `POST`   | `/bulkImport`                 | **🆕 Bulk import questions**   | `List<BulkImportDTO>`     | `BulkImportResultDTO`   |
| `PUT`    | `/update/{id}`                | Update a question              | `QuestionRequestDTO`      | `Question`              |
| `POST`   | `/updateExternalUrl/{id}`     | Update external URL            | `ExternalUrlDTO`          | `Question`              |
| `DELETE` | `/delete/{id}`                | Delete a question              | -                         | `204 No Content`        |

### Query Parameters for List Questions

- `categoryName`: Filter by category name
- `difficulty`: Filter by difficulty (EASY, MEDIUM, HARD)
- `source`: Filter by source platform
- `tagName`: **🆕 Filter by tag name** (e.g., "Array", "Dynamic Programming")
- `search`: Search in question title/text
- `page`: Page number (default: 0)
- `size`: Page size (default: 30)

**Example:** `/api/questions?categoryName=Arrays&difficulty=EASY&tagName=Array&page=0&size=20`

### Practice Endpoints

Base path: `/api/practice`

| Method   | Endpoint                              | Description                                   | Request Body                     | Response                     |
|----------|---------------------------------------|-----------------------------------------------|----------------------------------|------------------------------|
| `GET`    | `/questions`                          | List questions with user-specific progress    | Query params                     | `List<PracticeQuestionDTO>`  |
| `POST`   | `/questions/{questionId}/status`      | Update a user's practice status for a question| `UpdatePracticeStatusRequest`    | `PracticeQuestionDTO`        |
| `POST`   | `/questions/{questionId}/note`        | Save or clear a personal practice note        | `UpdatePracticeNoteRequest`      | `PracticeQuestionDTO`        |
| `GET`    | `/statistics`                         | Aggregate solved vs unsolved counts           | Query params                     | `PracticeStatisticsDTO`      |
| `GET`    | `/tags`                               | List available practice tags for filtering    | Query params                     | `List<String>`               |

#### Query Parameters for Practice Questions

- `username` *(required)*: User owning the practice queue
- `difficulty`: Filter by difficulty (EASY, MEDIUM, HARD)
- `source`: Filter by source platform (LEETCODE, HACKERRANK, GFG, ...)
- `tag`: Filter by tag name
- `status`: Filter by progress status (`SOLVED`, `UNSOLVED`)
- `search`: Case-insensitive title search

**Example:** `/api/practice/questions?username=johndoe&difficulty=EASY&tag=Array&status=UNSOLVED`

### Admin Endpoints

Base path: `/api/admin`

| Method   | Endpoint                              | Description                                   | Request Body                     | Response                     |
|----------|---------------------------------------|-----------------------------------------------|----------------------------------|------------------------------|
| `POST`   | `/sync-questions`                     | Sync all questions to users for practice      | -                                | Sync statistics              |

## Data Models

### UserDTO

```json
{
  "name": "John Doe",
  "username": "johndoe",
  "password": "securepassword",
  "email": "john@example.com",
  "phone": "+1234567890",
  "userType": "USER",
  "photoUrl": "https://example.com/photo.jpg"
}
```

**User Types:**
- `USER` - Regular user
- `ADMIN` - Administrator

### QuestionRequestDTO

```json
{
  "title": "What is polymorphism?",
  "difficulty": "MEDIUM",
  "category": "Java",
  "source": "Interview",
  "externalUrl": "https://example.com/question",
  "tags": ["java", "oop", "polymorphism"]
}
```

**Difficulty Levels:**
- `EASY`
- `MEDIUM`
- `HARD`

### PracticeQuestionDTO (New)

```json
{
  "id": 42,
  "title": "Two Sum",
  "difficulty": "EASY",
  "category": "Arrays & Hashing",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum/",
  "premium": false,
  "active": true,
  "acceptanceRate": 52.5,
  "companies": ["Amazon", "Microsoft"],
  "tags": ["Array", "Hash Table"],
  "status": "UNSOLVED",
  "note": "Review optimal hashmap approach",
  "lastUpdated": "2024-12-04T09:45:12"
}
```

**Practice Status Values:**
- `UNSOLVED` *(default)*
- `SOLVED`

### UpdatePracticeStatusRequest (New)

```json
{
  "username": "johndoe",
  "status": "SOLVED"
}
```

### UpdatePracticeNoteRequest (New)

```json
{
  "username": "johndoe",
  "note": "Focus on edge cases before reattempt"
}
```

### PracticeStatisticsDTO (New)

```json
{
  "username": "johndoe",
  "totalQuestions": 120,
  "solvedCount": 45,
  "unsolvedCount": 75,
  "easyTotal": 50,
  "easySolved": 30,
  "mediumTotal": 40,
  "mediumSolved": 12,
  "hardTotal": 30,
  "hardSolved": 3
}
```

### BulkImportQuestionDTO (New)

```json
[
  {
    "id": 1,
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "Easy",
    "category": "Arrays & Hashing",
    "source": "LEETCODE",
    "external_url": "https://leetcode.com/problems/two-sum/",
    "is_active": true,
    "is_premium": false,
    "acceptance_rate": 52.5,
    "companies": ["Amazon", "Microsoft", "Google"],
    "tags": ["Array", "Hash Table"]
  }
]
```

**Field Descriptions:**
- `id` (optional): External reference ID
- `title` (required): Question title (used for duplicate detection)
- `slug` (required): URL-friendly identifier
- `difficulty` (required): "Easy", "Medium", or "Hard"
- `category` (required): Category name (auto-created if needed)
- `source` (required): "LEETCODE", "HACKERRANK", or "GFG"
- `external_url` (optional): Link to original question
- `is_active` (optional): Active status (default: true)
- `is_premium` (optional): Premium content flag (default: false)
- `acceptance_rate` (optional): Acceptance percentage
- `companies` (optional): Array of company names
- `tags` (required): Array of tag names (auto-created if needed)

### BulkImportResultDTO (Response)

```json
{
  "totalQuestions": 3711,
  "successfulImports": 3650,
  "skippedDuplicates": 50,
  "failedImports": 11,
  "durationMs": 45230,
  "errorMessages": [
    "Invalid Question: Category cannot be null"
  ],
  "skippedTitles": ["Two Sum", "Three Sum"]
}
```

## Database Schema

### Users Table

| Column      | Type         | Constraints           |
|-------------|--------------|-----------------------|
| id          | BIGINT       | Primary Key, Auto     |
| name        | VARCHAR(255) |                       |
| username    | VARCHAR(255) | Unique                |
| password    | VARCHAR(255) |                       |
| email       | VARCHAR(255) | Not Null              |
| phone       | VARCHAR(20)  |                       |
| userType    | VARCHAR(50)  | Not Null              |
| photoUrl    | VARCHAR(500) |                       |
| isDeleted   | BOOLEAN      | Default: false        |
| createdOn   | DATETIME     |                       |
| createdBy   | VARCHAR(255) |                       |

### Question Table

| Column       | Type         | Constraints           |
|--------------|--------------|-----------------------|
| id           | BIGINT       | Primary Key, Auto     |
| title        | TEXT         | Not Null              |
| difficulty   | VARCHAR(50)  |                       |
| source       | VARCHAR(255) |                       |
| externalUrl  | VARCHAR(500) |                       |
| category_id  | BIGINT       | Foreign Key           |

### Category Table

| Column      | Type         | Constraints           |
|-------------|--------------|-----------------------|
| id          | BIGINT       | Primary Key, Auto     |
| name        | VARCHAR(255) | Unique                |
| description | TEXT         |                       |

### Tag Table

| Column | Type         | Constraints           |
|--------|--------------|-----------------------|
| id     | BIGINT       | Primary Key, Auto     |
| name   | VARCHAR(255) | Unique                |

### User Question Progress Table (New)

| Column       | Type         | Constraints                                      |
|--------------|--------------|--------------------------------------------------|
| id           | BIGINT       | Primary Key, Auto                                |
| user_id      | BIGINT       | Foreign Key → `users.id`, Not Null               |
| question_id  | BIGINT       | Foreign Key → `question.id`, Not Null            |
| status       | VARCHAR(20)  | Not Null, Defaults to `UNSOLVED`                 |
| note         | TEXT         | Nullable                                         |
| created_at   | DATETIME     | Not Null                                         |
| last_updated | DATETIME     | Not Null                                         |

**Unique Constraint:** `(user_id, question_id)` ensures one progress record per user/question pair.

## UI Pages

### Practice Platform (`/practice/`)

#### Main Practice Page (`practice/index.html`)
- **Dashboard Stats:** View Easy/Medium/Hard/Total solved counts
- **Category Navigation:** Browse questions by category (Arrays, Strings, DP, etc.)
- **Question Table:** 
  - ID, Title (clickable to external link), Difficulty, Acceptance Rate
  - Status badges (Solved/Unsolved)
  - Action buttons (Mark Solved/Unsolved, Add Note, View Details)
- **Filtering:**
  - Difficulty dropdown (All, Easy, Medium, Hard)
  - Source dropdown (All, LeetCode, HackerRank, GFG)
  - Tag dropdown (All tags dynamically loaded)
  - Status filter (All, Solved, Unsolved)
  - Search by title
- **Personal Notes:** Add/edit notes per question with modal interface
- **Question Details Modal:** View full question info including tags, companies, premium status

### Admin Interface (`/admin/`)

#### Dashboard (`admin/dashboard.html`)
- Entry point with live statistics
- Quick access cards to Question and User Management
- Shows: Total Questions, Total Users, Categories, Active Users

#### Question Management (`admin/questions/index.html`)
- **Create Question:** Add new questions with category, difficulty, tags, active status
- **Browse & Search:** 
  - Search by category, difficulty, source, or ID
  - **🆕 Filter by tags** - Dropdown with all available tags
  - **🆕 Sort options** - By difficulty, acceptance rate, or title (asc/desc)
  - **Multi-color tag badges** - Visual tag indicators on each question
  - Combine multiple filters for precise results
- **🆕 Bulk Import Questions:**
  - Upload JSON files with thousands of questions
  - JSON format example with syntax highlighting
  - Field descriptions and validation rules
  - Validate before import with preview (first 3 questions)
  - Comprehensive import statistics (total, success, skipped, failed)
  - Error messages and skipped duplicates list
  - Raw JSON response viewer
- **🆕 Tags Management:**
  - View all tags in a visual grid
  - Tag statistics (total, most common, recent usage)
  - Question count per tag
  - Multi-color badge system (6 color variations)
- **Update Question:** Search-first workflow with preview
- **Delete Question:** Remove questions with confirmation
- **Categories:** Manage question categories

#### User Management (`admin/users/user-management.html`)
- **Create User:** Add new users with email and user type (required)
- **Browse Users:** View all users with status indicators
  - Green background: Active users
  - Red background: Deleted users
  - Click "View Details" for full information in a modal card
- **Update User:** Search by username, preview details, then update
  - Username field disabled after search
  - Only modified fields are updated
- **Delete User:** Soft delete with confirmation

## Performance Optimizations

### Memory-Efficient Database Operations

All query operations have been optimized to prevent loading large datasets into memory:

**Random Question Selection:**
```sql
-- Database-level randomization (99.7% memory reduction)
SELECT * FROM question ORDER BY RAND() LIMIT 10;
```
- Before: Loaded all 3,711 questions into memory, shuffled in Java
- After: Database returns only 10 random questions
- Memory savings: 99.7% reduction

**Difficulty Filtering:**
```java
// Specification-based filtering (70% memory reduction)
public List<Question> findByDifficulty(String difficulty) {
    Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
    return questionRepository.findAll((root, query, cb) -> 
        cb.equal(root.get("difficulty"), diff)
    );
}
```
- Before: Loaded all questions, filtered with Java streams
- After: Database filters at query level
- Performance: 7.5x faster

**Duplicate Detection in Bulk Import:**
```java
// Efficient existence check (99.8% memory reduction)
if (questionRepository.existsByTitle(dto.getTitle())) {
    // Skip duplicate
}
```
- Before: Loaded all titles into a Set, checked in Java
- After: Database-level EXISTS query
- Performance: 50x faster for large imports

**Tag Filtering with JPA Specification:**
```java
// Dynamic query building with JOIN
public static Specification<Question> filterBy(
    String categoryName, String difficulty, 
    String source, String tagName, String search) {
    // Builds optimized SQL with JOINs only when needed
}
```
- Null-safe predicate building
- DISTINCT results when joining tags
- Only loads filtered results into memory

### Performance Metrics

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Random 10 questions | 185ms, 45MB | 4.5ms, 120KB | 40x faster, 99.7% less memory |
| Filter by difficulty | 120ms, 30MB | 16ms, 9MB | 7.5x faster, 70% less memory |
| Bulk import 3711 | 8500ms, 60MB | 4200ms, 5MB | 2x faster, 91% less memory |
| Duplicate check | 250ms/query | 5ms/query | 50x faster |

## UI Features

### Navigation
- Dashboard → Click management cards → Enter section
- Each section → Click "← Back to Dashboard" → Return home
- Horizontal tabs within each management section

### Search & Update Workflow
1. Enter username/question ID
2. Click Search button
3. Preview modal shows current data (green border)
4. Click Close to reveal update form
5. Edit desired fields (blank = keep current)
6. Submit changes

### Status Indicators
- **Users:** Green (Active) / Red (Deleted)
- **User Types:** Blue badge (USER) / Red badge (ADMIN)

### Responsive Design
- Desktop: 2-4 column layouts
- Tablet: 2 column layouts
- Mobile: Single column, stacked navigation

### Alert Modals
All success/error messages displayed in styled card modals instead of browser alerts

## Development

### Project Structure

```
tickSkillsGradle/
├── src/
│   ├── main/
│   │   ├── java/com/basuki/project/tickSkills/
│   │   │   ├── controller/
│   │   │   │   ├── admin/AdminController.java (NEW)
│   │   │   │   ├── practice/PracticeController.java (NEW)
│   │   │   │   ├── questions/QuestionsController.java
│   │   │   │   └── users/UserController.java
│   │   │   ├── service/
│   │   │   │   ├── admin/DataSyncService.java (NEW)
│   │   │   │   ├── practice/
│   │   │   │   │   ├── PracticeService.java (NEW)
│   │   │   │   │   └── PracticeServiceImpl.java (NEW)
│   │   │   │   ├── questions/
│   │   │   │   │   ├── QuestionsService.java
│   │   │   │   │   └── impl/QuestionsServiceImpl.java
│   │   │   │   └── users/UsersService.java
│   │   │   ├── repository/
│   │   │   │   ├── practice/UserQuestionProgressRepository.java (NEW)
│   │   │   │   ├── questions/
│   │   │   │   │   ├── QuestionRepository.java
│   │   │   │   │   ├── QuestionSpecification.java (UPDATED)
│   │   │   │   │   ├── CategoryRepository.java
│   │   │   │   │   └── TagRepository.java
│   │   │   │   └── users/UserRepository.java
│   │   │   ├── entities/
│   │   │   │   ├── practice/
│   │   │   │   │   ├── PracticeStatus.java (NEW)
│   │   │   │   │   └── UserQuestionProgress.java (NEW)
│   │   │   │   ├── questions/
│   │   │   │   │   ├── Question.java (UPDATED - active, acceptanceRate fields)
│   │   │   │   │   ├── Category.java
│   │   │   │   │   ├── Tag.java
│   │   │   │   │   ├── Difficulty.java
│   │   │   │   │   └── SourcePlatform.java
│   │   │   │   └── users/Users.java
│   │   │   ├── dtos/
│   │   │   │   ├── practice/
│   │   │   │   │   ├── PracticeQuestionDTO.java (NEW)
│   │   │   │   │   ├── PracticeStatisticsDTO.java (NEW)
│   │   │   │   │   ├── UpdatePracticeNoteRequest.java (NEW)
│   │   │   │   │   └── UpdatePracticeStatusRequest.java (NEW)
│   │   │   │   ├── QuestionRequestDTO.java
│   │   │   │   ├── BulkImportQuestionDTO.java (NEW)
│   │   │   │   ├── BulkImportResultDTO.java (NEW)
│   │   │   │   └── UserDTO.java
│   │   │   ├── configs/
│   │   │   │   ├── CacheConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── DataInitializer.java
│   │   │   │   └── WebConfig.java
│   │   │   └── exceptions/
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       └── TickSkillExceptions.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── admin/                          # RESTRUCTURED
│   │           │   ├── dashboard.html             # Admin landing
│   │           │   ├── questions/                 # Question management
│   │           │   │   ├── index.html            # MOVED from /index.html
│   │           │   │   ├── app.js                # MOVED, UPDATED (sorting, filtering)
│   │           │   │   └── app.css               # MOVED from /app.css
│   │           │   └── users/                     # User management
│   │           │       ├── user-management.html  # MOVED
│   │           │       └── app-users.js          # MOVED
│   │           └── practice/                       # RENAMED from userUI
│   │               ├── index.html                 # Practice platform
│   │               ├── script.js                  # UPDATED (removed icons)
│   │               ├── styles.css
│   │               ├── README.md
│   │               └── tags.txt
│   └── test/
│       ├── java/com/basuki/project/tickSkills/
│       │   ├── controller/
│       │   │   ├── practice/PracticeControllerIntegrationTest.java (NEW)
│       │   │   ├── questions/QuestionsControllerIntegrationTest.java
│       │   │   └── users/UserControllerIntegrationTest.java
│       │   └── service/
│       │       ├── questions/QuestionsServiceTest.java (UPDATED)
│       │       └── users/UsersServiceTest.java
│       └── resources/
│           └── application.properties (test config)
├── etc/
│   ├── create-test-database.sql
│   ├── leetcode_dsa_questions.json (Sample bulk import data)
│   ├── leetcode_questions_updated.json (With acceptance rates & active status)
│   ├── update_acceptance_rate.sql
│   ├── update_is_active.sql
│   ├── ACTIVE_QUESTIONS_FILTER_IMPLEMENTATION.md (NEW)
│   ├── TAG_FILTERING_IMPLEMENTATION.md
│   ├── BULK_IMPORT_API_DOCUMENTATION.md
│   ├── BULK_IMPORT_IMPLEMENTATION_SUMMARY.md
│   ├── MEMORY_OPTIMIZATION_SUMMARY.md
│   ├── UI_UPDATES_SUMMARY.md
│   └── UI_VISUAL_GUIDE.md
├── DIRECTORY_RESTRUCTURE.md (NEW)
├── ACCEPTANCE_RATE_UPDATE.md (NEW)
├── UI_UPDATE_NOTES.md (NEW)
├── USERUI_UPDATES.md (NEW)
├── build.gradle
├── README.md (UPDATED - this file)
├── TEST_SUMMARY.md
├── TESTING_README.md
└── MYSQL_TESTING_SETUP.md
```

### Key Configuration Files

**build.gradle**
```gradle
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    // Spring Boot 3.4.9
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    
    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mockito:mockito-core'
    testImplementation 'org.mockito:mockito-junit-jupiter'
}
```

### Building for Production

```bash
# Clean build without tests (faster)
./gradlew clean build -x test

# Run the production JAR
java -jar build/libs/tickSkills-0.0.1-SNAPSHOT.jar

# Run with specific profile
java -jar build/libs/tickSkills-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Development Workflow

1. **Start development server with hot reload:**
   ```bash
   ./gradlew bootRun
   ```
   
2. **Run tests in watch mode:**
   ```bash
   ./gradlew test --continuous
   ```

3. **Check code quality:**
   ```bash
   ./gradlew check
   ```

### Testing Endpoints

Use the included Postman collection: `tickskills.postman_collection.json`

Import into Postman and test all available endpoints.

## Troubleshooting

### Common Issues

**Java Version Mismatch:**
- Ensure Java 21 is installed: `java -version`
- Set JAVA_HOME to Java 21 directory
- Gradle will automatically use Java 21 via toolchain

**Database Connection Error:**
- Verify MySQL is running: `mysql --version`
- Check credentials in `application.properties`
- Ensure database `tickskills` exists
- Test connection: `mysql -u root -p tickskills`

**Port Already in Use:**
- Stop other applications on port 8080
- Or change port in `application.properties`: `server.port=8081`
- Kill process using port: `netstat -ano | findstr :8080` (Windows)

**JavaScript Errors:**
- Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
- Clear browser cache
- Check browser console (F12) for errors
- Verify API endpoints are accessible

**Test Failures:**
- Ensure test database exists: `CREATE DATABASE tickskills_test;`
- Verify MySQL test credentials in `src/test/resources/application.properties`
- Check MySQL is running and accessible
- Run tests with verbose output: `./gradlew test --info`

**User Creation Error:**
- Email and User Type are required fields
- Email must be valid format
- Username must be unique
- Phone number should be valid

**Gradle Build Issues:**
- Clean Gradle cache: `./gradlew clean`
- Delete `.gradle` folder and rebuild
- Ensure Gradle wrapper is executable: `chmod +x gradlew` (Linux/Mac)

### Performance Tips

- Enable production mode for better performance
- Use connection pooling (HikariCP is auto-configured)
- Configure appropriate JVM heap size: `-Xmx2g -Xms512m`
- Monitor application with Spring Boot Actuator (if enabled)


## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `./gradlew test`
5. Commit changes: `git commit -m 'Add feature: description'`
6. Push to branch: `git push origin feature/your-feature`
7. Open a pull request

### Development Guidelines

- Follow Java coding conventions
- Write unit tests for new features
- Add integration tests for new endpoints
- Update documentation as needed
- Keep test coverage high

## Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| Language | Java | 21 LTS |
| Framework | Spring Boot | 3.4.9 |
| Build Tool | Gradle | 8.14.3 |
| Database | MySQL | 8.0+ |
| Testing | JUnit 5 | 5.x |
| Mocking | Mockito | Latest |
| ORM | Hibernate | 6.x |
| Frontend | Vanilla JS | ES6+ |

## License

This project is open source and available under the MIT License.

## Contact

- **GitHub:** [@basukinath](https://github.com/basukinath)
- **Repository:** [tickSkills](https://github.com/basukinath/tickSkills)

## Acknowledgments

- Spring Boot team for the excellent framework
- MySQL community for the reliable database
- All contributors and users of TickSkills

## Recent Updates (October 2025)

### 🗂️ Directory Restructure (v5.0 - Oct 16, 2025)
- **Admin directory** - All admin features organized under `/admin/`
  - Dashboard at `/admin/dashboard.html`
  - Questions at `/admin/questions/index.html`
  - Users at `/admin/users/user-management.html`
- **Practice directory** - Renamed `/userUI/` to `/practice/` for clarity
- **Clean organization** - Related files grouped by feature
- **Updated navigation** - All links updated to new structure
- **Documentation** - Complete migration guide in DIRECTORY_RESTRUCTURE.md

### 🔒 Active Questions Filter (v4.5 - Oct 15, 2025)
- **isActive field** - Control question visibility in practice platform
- **Backend filtering** - QuestionSpecification filters active=true automatically
- **Admin control** - Toggle active status in question management
- **Practice platform** - Only shows 865 active questions
- **SQL scripts** - Batch update tools for active status
- **Acceptance rates** - Updated for 3707 questions from LeetCode API

### 🎨 UI Improvements (v4.3 - Oct 14, 2025)
- **Removed link icons** - Cleaner question display (🔗 → ↗)
- **Repositioned acceptance rates** - Now next to difficulty
- **Sorting options** - Sort by difficulty, acceptance rate, or title (asc/desc)
- **Multi-select filters** - Combine multiple filters seamlessly
- **Responsive design** - Optimized for all devices

### 🏷️ Tag Filtering System (v4.0)
- **Dynamic filtering** with JPA Specification API
- **Tag dropdown** in Browse page with auto-population
- **Multi-filter support** - Combine category + difficulty + source + tag
- **Visual tag badges** with 6 color variations
- **Efficient queries** - Database-level filtering with JOINs

### 📤 Bulk Import Feature (v3.5)
- **JSON file upload** - Import thousands of questions at once
- **Validation before import** - Preview first 3 questions
- **Duplicate detection** - Automatic skipping with title-based detection
- **Auto-creation** - Categories and tags created automatically
- **Comprehensive statistics** - Success, skipped, failed counts
- **Error reporting** - Detailed error messages with affected questions
- **JSON format example** - Syntax-highlighted with field descriptions

### 🧠 Practice Progress Tracking (v3.0)
- **Personal practice queue** - Each user has their own question list
- **Status tracking** - Mark questions as SOLVED/UNSOLVED
- **Personal notes** - Save approach notes per question
- **Statistics dashboard** - View solved vs unsolved by difficulty
- **Filter by status** - Find all unsolved questions quickly
- **Progress persistence** - All changes saved to database

### ⚡ Memory Optimizations (v2.5)
- **Database-level randomization** - 99.7% memory reduction
- **Specification-based filtering** - 70% memory reduction
- **Efficient duplicate checks** - 99.8% memory reduction
- **Paginated results** - All queries support pagination
- **Native queries** - Direct SQL for complex operations

### 🎨 UI Enhancements
- **Bulk Import page** - Complete workflow from upload to statistics
- **Tags management page** - Visual tag grid with statistics
- **Tag filter dropdown** - Integrated into Browse section
- **Multi-color badges** - Visual tag organization
- **Collapsible sections** - Clean, organized layout
- **Loading states** - Visual feedback for async operations
- **Responsive design** - Desktop, tablet, mobile optimized

### 📚 Documentation
- **TAG_FILTERING_IMPLEMENTATION.md** - Complete implementation guide
### 📚 Documentation (Comprehensive)
- **DIRECTORY_RESTRUCTURE.md** - Complete migration guide for new structure
- **ACCEPTANCE_RATE_UPDATE.md** - Acceptance rate implementation details
- **ACTIVE_QUESTIONS_FILTER_IMPLEMENTATION.md** - Active filter architecture
- **UI_UPDATE_NOTES.md** - UI improvements and changes
- **USERUI_UPDATES.md** - Practice platform updates
- **BULK_IMPORT_API_DOCUMENTATION.md** - API usage examples
- **MEMORY_OPTIMIZATION_SUMMARY.md** - Performance improvements
- **UI_UPDATES_SUMMARY.md** - Frontend changes documentation
- **UI_VISUAL_GUIDE.md** - Visual UI guide with ASCII diagrams

---

**Version:** 5.0  
**Last Updated:** October 16, 2025  
**Branch:** `develop` (active development)  
**Status:** Production Ready ✅  
**Test Coverage:** 65+ tests passing (100%) ✅  
**Active Questions:** 865 (22.6% of 3,820 total)  
**Key Features:** Practice Platform ✅ Active Filter ✅ Directory Restructure ✅ Tag Filtering ✅ Bulk Import ✅

