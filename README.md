# TickSkills

TickSkills is a Spring Boot application designed to manage users and their skills. It provides a set of REST APIs to perform operations such as adding users, retrieving user information, and more.

## Features

- **User Management:** Add single or multiple users to the system.
- **RESTful API:** A well-defined set of endpoints to interact with the application.
- **Validation:** Input validation to ensure data integrity.
- **Centralized Exception Handling:** Graceful error handling for a better user experience.

## Technologies Used

- **Java 17:** The core programming language for the application.
- **Spring Boot 3:** The framework used to build the application.
- **Spring Web:** For building RESTful APIs.
- **Spring Data JPA:** For data persistence and interaction with the database.
- **MySQL:** The relational database used to store data.
- **Lombok:** To reduce boilerplate code.
- **Gradle:** The build automation tool for the project.

## Setup and Installation

To get the project up and running on your local machine, follow these steps:

### Prerequisites

- **Java 17** or higher
- **Gradle**
- **MySQL**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   ```
2. **Navigate to the project directory:**
   ```bash
   cd tickSkillsGradle
   ```
3. **Configure the database:**
   Open `src/main/resources/application.properties` and update the database configuration with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tickskills
   spring.datasource.username=root
   spring.datasource.password=12345
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```
4. **Run the application:**
   ```bash
   ./gradlew bootRun
   ```
The application will start on `http://localhost:8080`.

## API Endpoints

The following are the available API endpoints:

| Method | Endpoint         | Description              | Request Body                               | Response                                     |
|--------|------------------|--------------------------|--------------------------------------------|----------------------------------------------|
| `POST` | `/addUser`       | Adds a single user.      | `UserDTO` object                           | A success message with the username.         |
| `POST` | `/addBulkUsers`  | Adds multiple users.     | A list of `UserDTO` objects                | A list of usernames that were added.         |
| `GET`  | `/getAllUsers`   | Retrieves all usernames. | -                                          | A list of all usernames in the database.     |

### Questions endpoints

The application exposes a set of endpoints to manage the question bank. All question endpoints are under the `/api/questions` base path.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/questions` | List questions (supports `categorySlug`, `difficulty`, `source`, `search`, `page`, `size`) |
| `GET` | `/api/questions/randomCount/{count}` | Get random questions (default 10 when not provided) |
| `GET` | `/api/questions/getSlug/{slug}` | Get question details by slug |
| `POST` | `/api/questions/createQuestion` | Create a new question (body: `QuestionRequestDTO`) |
| `PUT` | `/api/questions/updateSlug/{slug}` | Update question by slug (body: `QuestionRequestDTO`) |
| `DELETE` | `/api/questions/deleteSlug/{slug}` | Delete question by slug |
| `GET` | `/api/questions/getByTagSlug/{slug}` | Get questions by tag slug |
| `GET` | `/api/questions/getByCategorySlug/{slug}` | Get questions by category slug |
| `GET` | `/api/questions/listCategories` | List all categories |


### Example `UserDTO`

```json
{
    "name": "Basuki",
    "username": "basuki",
    "password": "password123",
    "email": "basuki@example.com",
    "phone": "1234567890",
    "userType": "ADMIN"
}
```

## Database Schema

The primary table in the database is the `Users` table, which has the following columns:

- `id` (Primary Key)
- `name`
- `username` (Unique)
- `password`
- `email`
- `phone`
- `userType`
- `createdOn`
- `createdBy`

## How to Contribute

Contributions are welcome! If you would like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.

