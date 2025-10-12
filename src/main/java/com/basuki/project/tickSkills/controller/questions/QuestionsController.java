package com.basuki.project.tickSkills.controller.questions;

import com.basuki.project.tickSkills.dtos.BulkImportQuestionDTO;
import com.basuki.project.tickSkills.dtos.BulkImportResultDTO;
import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.Tag;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.questions.TagRepository;
import com.basuki.project.tickSkills.service.questions.QuestionsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/questions")
public class QuestionsController {
    private final QuestionsService questionsService;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public QuestionsController(QuestionsService questionsService, CategoryRepository categoryRepository, TagRepository tagRepository) {
        this.questionsService = questionsService;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Question>> list(
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String tagName,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        Page<Question> results = questionsService.list(categoryName, difficulty, source, tagName, search, PageRequest.of(page, size));
        return ResponseEntity.ok(results);
    }

    // View Random 10 questions
    @GetMapping("/random10")
    public ResponseEntity<List<Question>> random10() {
        return ResponseEntity.ok(questionsService.random10());
    }

    @GetMapping("/byTag/{name}")
    public ResponseEntity<List<Question>> byTag(@PathVariable String name) {
        return ResponseEntity.ok(questionsService.findByTagName(name));
    }

    // Find questions by Category
    @GetMapping("/byCategory/{name}")
    public ResponseEntity<List<Question>> byCategory(@PathVariable String name) {
        return ResponseEntity.ok(questionsService.findByCategoryName(name));
    }

    // List all categories (for UI dropdown)
    @GetMapping("/listCategories")
    public ResponseEntity<List<Category>> listCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
    
    // List all tags (for UI filtering)
    @GetMapping("/listTags")
    public ResponseEntity<List<Tag>> listTags() {
        return ResponseEntity.ok(tagRepository.findAll());
    }

    // Add category
    @PostMapping("/addCategory")
    public ResponseEntity<Category> addCategory(@RequestBody com.basuki.project.tickSkills.dtos.CategoryRequestDTO dto) {
        Category c = questionsService.addCategory(dto.getName(), dto.getDescription());
        return ResponseEntity.ok(c);
    }

    // Find question by ID
    @GetMapping("/findById/{id}")
    public ResponseEntity<Question> get(@PathVariable Long id) {
        Question q = questionsService.findById(id);
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(q);
    }

    // Create Question
    @PostMapping("/create")
    public ResponseEntity<Question> create(@RequestBody QuestionRequestDTO request) {
        Question saved = questionsService.create(request);
        return ResponseEntity.ok(saved);
    }

    // Update Question
    @PutMapping("/update/{id}")
    public ResponseEntity<Question> update(@PathVariable Long id, @RequestBody QuestionRequestDTO request) {
        Question updated = questionsService.update(id, request);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    // Delete question
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        questionsService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Update external URL
    @PostMapping("/updateExternalUrl/{id}")
    public ResponseEntity<Question> updateExternalUrl(@PathVariable Long id, @RequestBody com.basuki.project.tickSkills.dtos.ExternalUrlDTO dto) {
        Question q = questionsService.updateExternalUrl(id, dto.getExternalUrl());
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(q);
    }

    // Find by difficulty
    @GetMapping("/byDifficulty/{difficulty}")
    public ResponseEntity<List<Question>> byDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(questionsService.findByDifficulty(difficulty));
    }

    // Get total question count
    @GetMapping("/getTotalQuestions")
    public ResponseEntity<Long> getTotalQuestions() {
        return ResponseEntity.ok(questionsService.getTotalCount());
    }
    
    // Bulk import questions from JSON
    @PostMapping("/bulkImport")
    public ResponseEntity<BulkImportResultDTO> bulkImport(@RequestBody List<BulkImportQuestionDTO> questions) {
        BulkImportResultDTO result = questionsService.bulkImportQuestions(questions);
        return ResponseEntity.ok(result);
    }
}
