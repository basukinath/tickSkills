Backend-only API for a categorized question bank referencing external practice sites (LeetCode, HackerRank, etc.), organized by difficulty and topic. No integrated coding environment required.

Technology Stack
Spring Boot (Java)

MySQL (local instance)

Core Domain Model
Entities
Category: Arrays, Strings, Bit Manipulation, etc.

Question: title, difficulty, source, externalUrl, category, tags

Tag: graph, dp, binary search, etc. (many-to-many)

Enums
Difficulty: EASY, MEDIUM, HARD

SourcePlatform: LEETCODE, HACKERRANK, CODEFORCES, ATCODER, GFG, CUSTOM

MySQL Schema
sql
CREATE TABLE category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE question (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(260) NOT NULL UNIQUE,
    difficulty ENUM('EASY','MEDIUM','HARD') NOT NULL,
    category_id BIGINT,
    source ENUM('LEETCODE','HACKERRANK','CODEFORCES','ATCODER','GFG','CUSTOM') NOT NULL,
    external_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    acceptance_rate DECIMAL(5,2),
    companies TEXT,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE question_tag (
    question_id BIGINT,
    tag_id BIGINT,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
);
Spring Boot Project Structure
text
src/main/java/com/example/dsa
├── controller/
│   └── QuestionController.java
│   └── CategoryController.java
│   └── TagController.java
├── dto/
│   └── QuestionRequest.java
│   └── QuestionResponse.java
├── entity/
│   └── Question.java
│   └── Category.java
│   └── Tag.java
│   └── enums/Difficulty.java, SourcePlatform.java
├── repository/
│   └── QuestionRepository.java
│   └── CategoryRepository.java
│   └── TagRepository.java
├── service/
│   └── QuestionService.java
│   └── CategoryService.java
│   └── TagService.java
└── util/
    └── SlugUtil.java
Entity Example
java
@Entity
@Table(name = "question")
public class Question {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false) private String title;
  @Column(nullable = false, unique = true) private String slug;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private Difficulty difficulty;
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "category_id") private Category category;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private SourcePlatform source;
  @Column(name="external_url", nullable = false) private String externalUrl;
  @Column(name="is_active") private boolean active = true;
  @Column(name="is_premium") private boolean premium = false;
  @Column(name="acceptance_rate") private BigDecimal acceptanceRate;
  @Column(name="companies") private String companies; // comma-separated
  @ManyToMany @JoinTable(name = "question_tag", joinColumns = @JoinColumn(name = "question_id"), inverseJoinColumns = @JoinColumn(name = "tag_id")) private Set<Tag> tags = new HashSet<>();
}
REST API Endpoints
text
GET  /api/questions                # Filter by category, difficulty, source, search by title
GET  /api/questions/{slug}         # Get single question details
POST /api/questions                # Add new question
PUT  /api/questions/{slug}         # Update question
DELETE /api/questions/{slug}       # Remove question
GET  /api/categories
GET  /api/categories/{slug}
GET  /api/tags
Example Question JSON
json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "difficulty": "EASY",
  "categorySlug": "arrays",
  "source": "LEETCODE",
  "externalUrl": "https://leetcode.com/problems/two-sum/",
  "isPremium": false,
  "tags": ["hashing", "two-pointers"]
}
Filtering and Pagination
Add query parameters to /api/questions endpoint:

categorySlug=arrays

difficulty=EASY

source=LEETCODE

search=two sum

page=0&size=30

Recommended Practices
Use Spring Data JPA for ORM

Lombok for boilerplate

@Valid for request validation

Slugify titles for unique question slugs

Seed categories and tags table on startup

Restrict POST/PUT/DELETE to admin only if needed

Deployment
MySQL should run locally, point Spring Boot to local instance in application.properties:

text
spring.datasource.url=jdbc:mysql://localhost:3306/dsa
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
Getting Started
Generate Spring Boot project with needed dependencies using Spring Initializr

Create tables as given above in your MySQL

Implement entities, repositories, services, DTOs, and controllers

Test CRUD endpoints with Postman/cURL

This backend scaffold is ready to be pasted into Copilot as a starter for a question catalog API. No Docker or IDE required.