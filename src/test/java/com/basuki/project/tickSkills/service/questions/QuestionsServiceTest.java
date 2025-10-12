package com.basuki.project.tickSkills.service.questions;

import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.SourcePlatform;
import com.basuki.project.tickSkills.entities.questions.Tag;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.basuki.project.tickSkills.repository.questions.TagRepository;
import com.basuki.project.tickSkills.service.questions.impl.QuestionsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionsService Unit Tests")
class QuestionsServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private QuestionsServiceImpl questionsService;

    private Question testQuestion;
    private Category testCategory;
    private Tag testTag;
    private QuestionRequestDTO testRequestDTO;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Arrays");
        testCategory.setDescription("Array problems");

        testTag = new Tag();
        testTag.setId(1L);
        testTag.setName("hash-table");

        testQuestion = new Question();
        testQuestion.setId(1L);
        testQuestion.setTitle("Two Sum");
        testQuestion.setDifficulty(Difficulty.EASY);
        testQuestion.setSource(SourcePlatform.LEETCODE);
        testQuestion.setExternalUrl("https://leetcode.com/problems/two-sum/");
        testQuestion.setCategory(testCategory);
        testQuestion.setTags(new HashSet<>(Collections.singletonList(testTag)));

        testRequestDTO = new QuestionRequestDTO();
        testRequestDTO.setTitle("Two Sum");
        testRequestDTO.setDifficulty(Difficulty.EASY);
        testRequestDTO.setSource(SourcePlatform.LEETCODE);
        testRequestDTO.setCategory("Arrays");
        testRequestDTO.setExternalUrl("https://leetcode.com/problems/two-sum/");
        testRequestDTO.setTags(Arrays.asList("hash-table", "array"));
    }

    @Test
    @DisplayName("Should create question successfully")
    void testCreate_Success() {
        // Given
        when(categoryRepository.findByName("Arrays")).thenReturn(Optional.of(testCategory));
        when(tagRepository.findByName(anyString())).thenReturn(Optional.of(testTag));
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        // When
        Question result = questionsService.create(testRequestDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Two Sum");
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should create question with new category when category doesn't exist")
    void testCreate_WithNewCategory() {
        // Given
        when(categoryRepository.findByName("Arrays")).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(tagRepository.findByName(anyString())).thenReturn(Optional.of(testTag));
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        // When
        Question result = questionsService.create(testRequestDTO);

        // Then
        assertThat(result).isNotNull();
        verify(categoryRepository).save(any(Category.class));
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should create question with new tags when tags don't exist")
    void testCreate_WithNewTags() {
        // Given
        when(categoryRepository.findByName("Arrays")).thenReturn(Optional.of(testCategory));
        when(tagRepository.findByName(anyString())).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenReturn(testTag);
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        // When
        Question result = questionsService.create(testRequestDTO);

        // Then
        assertThat(result).isNotNull();
        verify(tagRepository, times(2)).save(any(Tag.class));
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should update question successfully")
    void testUpdate_Success() {
        // Given
        when(questionRepository.findById(1L)).thenReturn(Optional.of(testQuestion));
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        QuestionRequestDTO updateDTO = new QuestionRequestDTO();
        updateDTO.setTitle("Two Sum - Updated");
        updateDTO.setDifficulty(Difficulty.MEDIUM);

        // When
        Question result = questionsService.update(1L, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(questionRepository).findById(1L);
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should return null when updating non-existent question")
    void testUpdate_NotFound() {
        // Given
        when(questionRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Question result = questionsService.update(999L, testRequestDTO);

        // Then
        assertThat(result).isNull();
        verify(questionRepository).findById(999L);
        verify(questionRepository, never()).save(any(Question.class));
    }

    @Test
    @DisplayName("Should update external URL successfully")
    void testUpdateExternalUrl_Success() {
        // Given
        when(questionRepository.findById(1L)).thenReturn(Optional.of(testQuestion));
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        String newUrl = "https://leetcode.com/problems/two-sum-updated/";

        // When
        Question result = questionsService.updateExternalUrl(1L, newUrl);

        // Then
        assertThat(result).isNotNull();
        verify(questionRepository).findById(1L);
        verify(questionRepository).save(any(Question.class));
    }

    @Test
    @DisplayName("Should delete question successfully")
    void testDelete_Success() {
        // Given
        doNothing().when(questionRepository).deleteById(1L);

        // When
        questionsService.delete(1L);

        // Then
        verify(questionRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should find question by ID")
    void testFindById_Success() {
        // Given
        when(questionRepository.findById(1L)).thenReturn(Optional.of(testQuestion));

        // When
        Question result = questionsService.findById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Two Sum");
        verify(questionRepository).findById(1L);
    }

    @Test
    @DisplayName("Should return null when finding non-existent question by ID")
    void testFindById_NotFound() {
        // Given
        when(questionRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Question result = questionsService.findById(999L);

        // Then
        assertThat(result).isNull();
        verify(questionRepository).findById(999L);
    }

    @Test
    @DisplayName("Should find questions by category name")
    void testFindByCategoryName() {
        // Given
        List<Question> questions = Arrays.asList(testQuestion);
        when(questionRepository.findByCategoryName("Arrays")).thenReturn(questions);

        // When
        List<Question> result = questionsService.findByCategoryName("Arrays");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Two Sum");
        verify(questionRepository).findByCategoryName("Arrays");
    }

    @Test
    @DisplayName("Should find questions by difficulty")
    void testFindByDifficulty() {
        // Given
        List<Question> questions = Arrays.asList(testQuestion);
        when(questionRepository.findAll(any(Specification.class))).thenReturn(questions);

        // When
        List<Question> result = questionsService.findByDifficulty("EASY");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDifficulty()).isEqualTo(Difficulty.EASY);
        verify(questionRepository).findAll(any(Specification.class));
    }

    @Test
    @DisplayName("Should find questions by tag name")
    void testFindByTagName() {
        // Given
        List<Question> questions = Arrays.asList(testQuestion);
        when(questionRepository.findByTagName("hash-table")).thenReturn(questions);

        // When
        List<Question> result = questionsService.findByTagName("hash-table");

        // Then
        assertThat(result).hasSize(1);
        verify(questionRepository).findByTagName("hash-table");
    }

    @Test
    @DisplayName("Should get random questions")
    void testRandom() {
        // Given
        List<Question> questions = Arrays.asList(testQuestion);
        when(questionRepository.findRandomQuestions(10)).thenReturn(questions);

        // When
        List<Question> result = questionsService.random(10);

        // Then
        assertThat(result).hasSize(1);
        verify(questionRepository).findRandomQuestions(10);
    }

    @Test
    @DisplayName("Should get 10 random questions using default method")
    void testRandom10() {
        // Given
        List<Question> questions = Arrays.asList(testQuestion);
        when(questionRepository.findRandomQuestions(10)).thenReturn(questions);

        // When
        List<Question> result = questionsService.random10();

        // Then
        assertThat(result).hasSize(1);
        verify(questionRepository).findRandomQuestions(10);
    }

    @Test
    @DisplayName("Should get total question count")
    void testGetTotalCount() {
        // Given
        when(questionRepository.count()).thenReturn(42L);

        // When
        long result = questionsService.getTotalCount();

        // Then
        assertThat(result).isEqualTo(42L);
        verify(questionRepository).count();
    }

    @Test
    @DisplayName("Should list questions with pagination")
    void testList() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        List<Question> questions = Arrays.asList(testQuestion);
        Page<Question> page = new PageImpl<>(questions, pageable, 1);
        
        when(questionRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        // When
        Page<Question> result = questionsService.list(null, null, null, null, null, pageable);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(questionRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("Should add new category")
    void testAddCategory() {
        // Given
        Category newCategory = new Category();
        newCategory.setName("Dynamic Programming");
        newCategory.setDescription("DP problems");

        when(categoryRepository.save(any(Category.class))).thenReturn(newCategory);

        // When
        Category result = questionsService.addCategory("Dynamic Programming", "DP problems");

        // Then
        assertThat(result).isNotNull();
        verify(categoryRepository).save(any(Category.class));
    }
}
