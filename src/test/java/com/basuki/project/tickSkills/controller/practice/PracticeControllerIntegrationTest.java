package com.basuki.project.tickSkills.controller.practice;

import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeNoteRequest;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeStatusRequest;
import com.basuki.project.tickSkills.entities.practice.PracticeStatus;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.SourcePlatform;
import com.basuki.project.tickSkills.entities.questions.Tag;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.repository.practice.UserQuestionProgressRepository;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.basuki.project.tickSkills.repository.questions.TagRepository;
import com.basuki.project.tickSkills.repository.users.UsersRepository;
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

import java.math.BigDecimal;
import java.util.HashSet;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("PracticeController Integration Tests")
class PracticeControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserQuestionProgressRepository progressRepository;

    private Users testUser;
    private Question testQuestion;

    @BeforeEach
    void setUp() {
        progressRepository.deleteAll();
        questionRepository.deleteAll();
        tagRepository.deleteAll();
        categoryRepository.deleteAll();
        usersRepository.deleteAll();

        testUser = usersRepository.save(Users.builder()
                .name("Practice User")
                .username("practice_user")
                .email("practice@test.com")
                .password("password")
                .isDeleted(false)
                .build());

        Category category = new Category();
        category.setName("Arrays");
        category.setDescription("Array problems");
        category = categoryRepository.save(category);

        Tag tag = new Tag();
        tag.setName("Two Pointers");
        tag = tagRepository.save(tag);

        Question question = new Question();
        question.setTitle("Two Sum");
        question.setDifficulty(Difficulty.EASY);
        question.setCategory(category);
        question.setSource(SourcePlatform.LEETCODE);
        question.setExternalUrl("https://leetcode.com/problems/two-sum/");
        question.setActive(true);
        question.setPremium(false);
        question.setAcceptanceRate(new BigDecimal("48.3"));
        question.setTags(new HashSet<>());
        question.getTags().add(tag);

        testQuestion = questionRepository.save(question);
    }

    @Test
    @DisplayName("GET /api/practice/questions should return questions with default UNSOLVED status")
    void testGetPracticeQuestions() throws Exception {
        mockMvc.perform(get("/api/practice/questions")
                        .param("username", testUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(testQuestion.getId()))
                .andExpect(jsonPath("$[0].status").value("UNSOLVED"))
                .andExpect(jsonPath("$[0].tags", contains("Two Pointers")));
    }

    @Test
    @DisplayName("POST status update should mark question as solved and reflected in statistics")
    void testUpdateStatusAndStatistics() throws Exception {
        UpdatePracticeStatusRequest statusRequest = new UpdatePracticeStatusRequest();
        statusRequest.setUsername(testUser.getUsername());
        statusRequest.setStatus(PracticeStatus.SOLVED);

        mockMvc.perform(post("/api/practice/questions/{id}/status", testQuestion.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLVED"));

        mockMvc.perform(get("/api/practice/questions")
                        .param("username", testUser.getUsername())
                        .param("status", "SOLVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("SOLVED"));

        mockMvc.perform(get("/api/practice/statistics")
                        .param("username", testUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solvedCount").value(1))
                .andExpect(jsonPath("$.easySolved").value(1))
                .andExpect(jsonPath("$.easyTotal").value(1));
    }

    @Test
    @DisplayName("POST note update should persist note for user and question")
    void testUpdateNote() throws Exception {
        UpdatePracticeNoteRequest noteRequest = new UpdatePracticeNoteRequest();
        noteRequest.setUsername(testUser.getUsername());
        noteRequest.setNote("Remember to use hashmap");

        mockMvc.perform(post("/api/practice/questions/{id}/note", testQuestion.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value("Remember to use hashmap"));

        mockMvc.perform(get("/api/practice/questions")
                        .param("username", testUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].note").value("Remember to use hashmap"));
    }

    @Test
    @DisplayName("Practice progress and notes remain isolated per user")
    void testUserIsolationAcrossPracticeState() throws Exception {
        Users secondUser = usersRepository.save(Users.builder()
                .name("Second User")
                .username("practice_user_two")
                .email("practice-two@test.com")
                .password("password")
                .isDeleted(false)
                .build());

        UpdatePracticeStatusRequest firstUserStatus = new UpdatePracticeStatusRequest();
        firstUserStatus.setUsername(testUser.getUsername());
        firstUserStatus.setStatus(PracticeStatus.SOLVED);

        mockMvc.perform(post("/api/practice/questions/{id}/status", testQuestion.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstUserStatus)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLVED"));

        mockMvc.perform(get("/api/practice/statistics")
                        .param("username", testUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solvedCount").value(1));

        mockMvc.perform(get("/api/practice/statistics")
                        .param("username", secondUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.solvedCount").value(0));

        mockMvc.perform(get("/api/practice/questions")
                        .param("username", secondUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("UNSOLVED"))
                .andExpect(jsonPath("$[0].note").value(nullValue()));

        UpdatePracticeNoteRequest secondUserNote = new UpdatePracticeNoteRequest();
        secondUserNote.setUsername(secondUser.getUsername());
        secondUserNote.setNote("Track sliding window approach");

        mockMvc.perform(post("/api/practice/questions/{id}/note", testQuestion.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondUserNote)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value("Track sliding window approach"));

        mockMvc.perform(get("/api/practice/questions")
                        .param("username", testUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("SOLVED"))
                .andExpect(jsonPath("$[0].note").value(nullValue()));

        mockMvc.perform(get("/api/practice/questions")
                        .param("username", secondUser.getUsername()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("UNSOLVED"))
                .andExpect(jsonPath("$[0].note").value("Track sliding window approach"));
    }

        @Test
        @DisplayName("GET /api/practice/categories should include questions grouped by category")
        void testGetPracticeCategories() throws Exception {
                Category dpCategory = new Category();
                dpCategory.setName("Dynamic Programming");
                dpCategory.setDescription("DP problems");
                dpCategory = categoryRepository.save(dpCategory);

                Question dpQuestion = new Question();
                dpQuestion.setTitle("Climbing Stairs");
                dpQuestion.setDifficulty(Difficulty.EASY);
                dpQuestion.setCategory(dpCategory);
                dpQuestion.setSource(SourcePlatform.LEETCODE);
                dpQuestion.setExternalUrl("https://leetcode.com/problems/climbing-stairs/");
                dpQuestion.setActive(true);
                dpQuestion.setPremium(false);
                dpQuestion.setAcceptanceRate(new BigDecimal("43.0"));
                dpQuestion.setTags(new HashSet<>());
                questionRepository.save(dpQuestion);

                mockMvc.perform(get("/api/practice/categories")
                                                .param("username", testUser.getUsername()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                                .andExpect(jsonPath("$[0].name").value("Arrays"))
                                .andExpect(jsonPath("$[0].questions", hasSize(1)))
                                .andExpect(jsonPath("$[0].questions[0].title").value("Two Sum"))
                                .andExpect(jsonPath("$[1].name").value("Dynamic Programming"))
                                .andExpect(jsonPath("$[1].questions", hasSize(1)))
                                .andExpect(jsonPath("$[1].questions[0].title").value("Climbing Stairs"));
        }
}