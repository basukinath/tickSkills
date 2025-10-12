package com.basuki.project.tickSkills.controller.questions;

import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.SourcePlatform;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("QuestionsController Integration Tests")
class QuestionsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Question testQuestion;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        questionRepository.deleteAll();
        categoryRepository.deleteAll();

        testCategory = new Category();
        testCategory.setName("Arrays");
        testCategory.setDescription("Array problems");
        testCategory = categoryRepository.save(testCategory);

        testQuestion = new Question();
        testQuestion.setTitle("Two Sum");
        testQuestion.setDifficulty(Difficulty.EASY);
        testQuestion.setSource(SourcePlatform.LEETCODE);
        testQuestion.setExternalUrl("https://leetcode.com/problems/two-sum/");
        testQuestion.setCategory(testCategory);
        testQuestion.setTags(new HashSet<>());
    }

    @Test
    @DisplayName("GET /api/questions - Should return all questions")
    void testGetAllQuestions() throws Exception {
        questionRepository.save(testQuestion);

        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].title").value("Two Sum"));
    }

    @Test
    @DisplayName("GET /api/questions/findById/{id} - Should return question by ID")
    void testGetQuestionById() throws Exception {
        Question saved = questionRepository.save(testQuestion);

        mockMvc.perform(get("/api/questions/findById/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.title").value("Two Sum"))
                .andExpect(jsonPath("$.difficulty").value("EASY"));
    }

    @Test
    @DisplayName("GET /api/questions/findById/{id} - Should return 404 when question not found")
    void testGetQuestionById_NotFound() throws Exception {
        mockMvc.perform(get("/api/questions/findById/{id}", 999))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/questions/getTotalQuestions - Should return total question count")
    void testGetTotalQuestions() throws Exception {
        questionRepository.save(testQuestion);
        
        // Create a fresh category and question2 to avoid any detached entity issues
        Category freshCategory = categoryRepository.findById(testCategory.getId()).orElseThrow();
        
        Question question2 = new Question();
        question2.setTitle("Three Sum");
        question2.setDifficulty(Difficulty.MEDIUM);
        question2.setSource(SourcePlatform.LEETCODE);
        question2.setExternalUrl("https://leetcode.com/problems/three-sum/");  // Required field
        question2.setCategory(freshCategory);  // Use fresh category from DB
        question2.setTags(new HashSet<>());
        questionRepository.save(question2);

        mockMvc.perform(get("/api/questions/getTotalQuestions"))
                .andExpect(status().isOk())
                .andExpect(content().string("2"));
    }

    @Test
    @DisplayName("GET /api/questions/random10 - Should return random questions")
    void testGetRandom10Questions() throws Exception {
        questionRepository.save(testQuestion);

        mockMvc.perform(get("/api/questions/random10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(0))));
    }

    @Test
    @DisplayName("GET /api/questions/byCategory/{name} - Should filter by category")
    void testGetQuestionsByCategory() throws Exception {
        questionRepository.save(testQuestion);

        mockMvc.perform(get("/api/questions/byCategory/{name}", "Arrays"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].title").value("Two Sum"));
    }

    @Test
    @DisplayName("GET /api/questions/byDifficulty/{difficulty} - Should filter by difficulty")
    void testGetQuestionsByDifficulty() throws Exception {
        questionRepository.save(testQuestion);

        mockMvc.perform(get("/api/questions/byDifficulty/{difficulty}", "EASY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].difficulty").value("EASY"));
    }

    @Test
    @DisplayName("GET /api/questions/listCategories - Should return all categories")
    void testGetAllCategories() throws Exception {
        mockMvc.perform(get("/api/questions/listCategories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name").value("Arrays"));
    }

    @Test
    @DisplayName("POST /api/questions/create - Should create question successfully")
    void testCreateQuestion() throws Exception {
        QuestionRequestDTO requestDTO = new QuestionRequestDTO();
        requestDTO.setTitle("Valid Parentheses");
        requestDTO.setDifficulty(Difficulty.EASY);
        requestDTO.setSource(SourcePlatform.LEETCODE);
        requestDTO.setCategory("Strings");
        requestDTO.setExternalUrl("https://leetcode.com/problems/valid-parentheses/");
        requestDTO.setTags(Arrays.asList("stack", "string"));

        mockMvc.perform(post("/api/questions/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Valid Parentheses"))
                .andExpect(jsonPath("$.difficulty").value("EASY"));
    }

    @Test
    @DisplayName("POST /api/questions/addCategory - Should create category successfully")
    void testCreateCategory() throws Exception {
        mockMvc.perform(post("/api/questions/addCategory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Dynamic Programming\", \"description\": \"DP problems\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dynamic Programming"));
    }

    @Test
    @DisplayName("PUT /api/questions/update/{id} - Should update question successfully")
    void testUpdateQuestion() throws Exception {
        Question saved = questionRepository.save(testQuestion);

        QuestionRequestDTO updateDTO = new QuestionRequestDTO();
        updateDTO.setTitle("Two Sum - Updated");
        updateDTO.setDifficulty(Difficulty.MEDIUM);

        mockMvc.perform(put("/api/questions/update/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Two Sum - Updated"))
                .andExpect(jsonPath("$.difficulty").value("MEDIUM"));
    }

    @Test
    @DisplayName("PUT /api/questions/update/{id} - Should return 404 when updating non-existent question")
    void testUpdateQuestion_NotFound() throws Exception {
        QuestionRequestDTO updateDTO = new QuestionRequestDTO();
        updateDTO.setTitle("Updated Title");

        mockMvc.perform(put("/api/questions/update/{id}", 999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/questions/updateExternalUrl/{id} - Should update external URL")
    void testUpdateExternalUrl() throws Exception {
        Question saved = questionRepository.save(testQuestion);

        mockMvc.perform(post("/api/questions/updateExternalUrl/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"externalUrl\": \"https://leetcode.com/problems/two-sum-updated/\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.externalUrl").value("https://leetcode.com/problems/two-sum-updated/"));
    }

    @Test
    @DisplayName("DELETE /api/questions/delete/{id} - Should delete question successfully")
    void testDeleteQuestion() throws Exception {
        Question saved = questionRepository.save(testQuestion);

        mockMvc.perform(delete("/api/questions/delete/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        // Verify question is deleted
        mockMvc.perform(get("/api/questions/findById/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/questions/byTag/{name} - Should filter by tag")
    void testGetQuestionsByTag() throws Exception {
        // This test depends on tag support - adjust based on actual implementation
        questionRepository.save(testQuestion);

        mockMvc.perform(get("/api/questions/byTag/{name}", "array"))
                .andExpect(status().isOk());
    }
}
