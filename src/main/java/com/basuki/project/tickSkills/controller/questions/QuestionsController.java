package com.basuki.project.tickSkills.controller.questions;

import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.service.questions.QuestionsService;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.entities.questions.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/questions")
public class QuestionsController {
    private final QuestionsService questionsService;
    private final CategoryRepository categoryRepository;

    public QuestionsController(QuestionsService questionsService, CategoryRepository categoryRepository) {
        this.questionsService = questionsService;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Question>> list(
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        Page<Question> results = questionsService.list(categorySlug, difficulty, source, search, PageRequest.of(page, size));
        return ResponseEntity.ok(results);
    }

    // View Random 10 questions
    @GetMapping("/random10")
    public ResponseEntity<List<Question>> random10() {
        return ResponseEntity.ok(questionsService.random10());
    }

    @GetMapping("/byTag/{slug}")
    public ResponseEntity<List<Question>> byTag(@PathVariable String slug) {
        return ResponseEntity.ok(questionsService.findByTagSlug(slug));
    }

    // Find questions by Category
    @GetMapping("/byCategory/{slug}")
    public ResponseEntity<List<Question>> byCategory(@PathVariable String slug) {
        return ResponseEntity.ok(questionsService.findByCategorySlug(slug));
    }

    // Add category
    @PostMapping("/addCategory")
    public ResponseEntity<Category> addCategory(@RequestBody com.basuki.project.tickSkills.dtos.CategoryRequestDTO dto) {
        Category c = questionsService.addCategory(dto.getName(), dto.getDescription());
        return ResponseEntity.ok(c);
    }

    // Find question by Slug
    @GetMapping("/findBySlug/{slug}")
    public ResponseEntity<Question> get(@PathVariable String slug) {
        Question q = questionsService.findBySlug(slug);
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
    @PutMapping("/update/{slug}")
    public ResponseEntity<Question> update(@PathVariable String slug, @RequestBody QuestionRequestDTO request) {
        Question updated = questionsService.update(slug, request);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    // Delete question
    @DeleteMapping("/delete/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        questionsService.delete(slug);
        return ResponseEntity.noContent().build();
    }

    // Add or update slug
    @PostMapping("/addSlug/{existingSlug}")
    public ResponseEntity<Question> addSlug(@PathVariable String existingSlug, @RequestBody com.basuki.project.tickSkills.dtos.SlugUpdateDTO dto) {
        Question q = questionsService.addOrUpdateSlug(existingSlug, dto.getSlug());
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(q);
    }

    // Update external URL
    @PostMapping("/updateExternalUrl/{slug}")
    public ResponseEntity<Question> updateExternalUrl(@PathVariable String slug, @RequestBody com.basuki.project.tickSkills.dtos.ExternalUrlDTO dto) {
        Question q = questionsService.updateExternalUrl(slug, dto.getExternalUrl());
        if (q == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(q);
    }

    // Find by difficulty
    @GetMapping("/byDifficulty/{difficulty}")
    public ResponseEntity<List<Question>> byDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(questionsService.findByDifficulty(difficulty));
    }
}
