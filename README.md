<div align="center">

# 🎯 TickSkills

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" alt="Spring Boot Logo" width="100" height="100"/>

### 🚀 A Modern Spring Boot Application for Skills & User Management

[![Java](https://img.shields.io/badge/Java-17+-orange?style=for-the-badge&logo=java&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-brightgreen?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Gradle](https://img.shields.io/badge/Gradle-7.0+-lightgrey?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

*A robust and scalable REST API solution for managing users and their skills with enterprise-grade features*

</div>

## ✨ Features

<table>
<tr>
<td>

### 👥 User Management
- ✅ Single & bulk user registration
- 🔍 Advanced user retrieval
- 🛡️ Role-based access control
- 📊 User analytics dashboard

</td>
<td>

### 🔧 Technical Excellence
- 🌐 RESTful API architecture
- ✅ Comprehensive input validation
- 🚨 Centralized exception handling
- 📱 API documentation with Postman

</td>
</tr>
</table>

## 🛠️ Tech Stack

<div align="center">

| Technology | Version | Purpose |
|------------|---------|---------|
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg" width="20"/> **Java** | 17+ | Core Language |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/spring/spring-original.svg" width="20"/> **Spring Boot** | 3.0+ | Framework |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg" width="20"/> **MySQL** | 8.0+ | Database |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/gradle/gradle-plain.svg" width="20"/> **Gradle** | 7.0+ | Build Tool |
| **Lombok** | Latest | Code Simplification |
| **Spring Data JPA** | Latest | Data Persistence |

</div>

## ⚡ Quick Start

### 📋 Prerequisites

<div align="center">

| Requirement | Version | Download |
|-------------|---------|----------|
| ☕ **Java** | 17+ | [Download JDK](https://adoptium.net/) |
| 🐘 **MySQL** | 8.0+ | [Download MySQL](https://dev.mysql.com/downloads/) |
| 🔧 **Gradle** | 7.0+ | [Download Gradle](https://gradle.org/install/) |

</div>

### 🚀 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/basukinath/tickSkills.git

# 2️⃣ Navigate to project directory
cd tickSkillsGradle

# 3️⃣ Configure database (see configuration below)

# 4️⃣ Run the application
./gradlew bootRun
```

### ⚙️ Database Configuration

Update `src/main/resources/application.properties`:

```properties
# 🗄️ Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/tickskills
spring.datasource.username=your_username
spring.datasource.password=your_password

# 🔧 JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

> 🌐 **Application URL:** `http://localhost:8080`

## 🔌 API Endpoints

<div align="center">

### 📡 Available REST APIs

</div>

| 🎯 Method | 🛣️ Endpoint | 📝 Description | 📤 Request Body | 📥 Response |
|-----------|-------------|----------------|-----------------|-------------|
| `🟢 POST` | `/addUser` | Add a single user | `UserDTO` object | Success message with username |
| `🟢 POST` | `/addBulkUsers` | Add multiple users | List of `UserDTO` objects | List of added usernames |
| `🔵 GET` | `/getAllUsers` | Get all usernames | - | List of all usernames |

### 📋 UserDTO Example

```json
{
    "name": "Basuki Nath",
    "username": "basuki",
    "password": "securePassword123",
    "email": "basuki@example.com",
    "phone": "+91-9876543210",
    "userType": "ADMIN"
}
```

> 📚 **Postman Collection:** Import `tickskills.postman_collection.json` for easy API testing

## 🗄️ Database Schema

<div align="center">

### 👤 Users Table Structure

</div>

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| 🆔 `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| 👤 `name` | VARCHAR(255) | NOT NULL | Full name of user |
| 🏷️ `username` | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| 🔒 `password` | VARCHAR(255) | NOT NULL | Encrypted password |
| 📧 `email` | VARCHAR(255) | NOT NULL | Email address |
| 📱 `phone` | VARCHAR(20) | - | Contact number |
| 🎭 `userType` | ENUM | NOT NULL | User role (ADMIN/USER) |
| 📅 `createdOn` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation date |
| 👨‍💻 `createdBy` | VARCHAR(50) | - | Creator username |

## 🤝 Contributing

<div align="center">

### 🎉 We Welcome Contributions!

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](code_of_conduct.md)

</div>

```bash
# 🍴 Fork the repository
# 🌿 Create your feature branch
git checkout -b feature/amazing-feature

# 💾 Commit your changes
git commit -m 'Add some amazing feature'

# 📤 Push to the branch
git push origin feature/amazing-feature

# 🔀 Open a Pull Request
```

### 📝 Contribution Guidelines

1. 🔍 **Code Review:** All submissions require review
2. ✅ **Tests:** Ensure your code is well-tested
3. 📚 **Documentation:** Update docs for new features
4. 🎨 **Style:** Follow existing code conventions

---

<div align="center">

### 🌟 Show Your Support

Give a ⭐ if this project helped you!

**Made with ❤️ by [Basuki Nath](https://github.com/basukinath)**

[![GitHub followers](https://img.shields.io/github/followers/basukinath?style=social)](https://github.com/basukinath)
[![GitHub stars](https://img.shields.io/github/stars/basukinath/tickSkills?style=social)](https://github.com/basukinath/tickSkills)

</div>

