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

// ...existing imports...

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

    @GetMapping("/random")
    public ResponseEntity<List<Question>> random(@RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(questionsService.random(count));
    }

    @GetMapping("/tag/{slug}")
    public ResponseEntity<List<Question>> byTag(@PathVariable String slug) {
        return ResponseEntity.ok(questionsService.findByTagSlug(slug));
    }

    @GetMapping("/category/{slug}")
    public ResponseEntity<List<Question>> byCategory(@PathVariable String slug) {
        return ResponseEntity.ok(questionsService.findByCategorySlug(slug));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> categories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Question> get(@PathVariable String slug) {
    Question q = questionsService.findBySlug(slug);
    if (q == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(q);
    }

    @PostMapping
    public ResponseEntity<Question> create(@RequestBody QuestionRequestDTO request) {
        Question saved = questionsService.create(request);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{slug}")
    public ResponseEntity<Question> update(@PathVariable String slug, @RequestBody QuestionRequestDTO request) {
        Question updated = questionsService.update(slug, request);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        questionsService.delete(slug);
        return ResponseEntity.noContent().build();
    }
}
