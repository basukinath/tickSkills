package com.basuki.project.tickSkills.controller.practice;

import com.basuki.project.tickSkills.dtos.practice.PracticeCategoryDTO;
import com.basuki.project.tickSkills.dtos.practice.PracticeQuestionDTO;
import com.basuki.project.tickSkills.dtos.practice.PracticeStatisticsDTO;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeNoteRequest;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeStatusRequest;
import com.basuki.project.tickSkills.service.practice.PracticeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/practice")
@RequiredArgsConstructor
@Validated
public class PracticeController {

    private final PracticeService practiceService;

    @GetMapping("/questions")
    public ResponseEntity<List<PracticeQuestionDTO>> getPracticeQuestions(
            @RequestParam @NotBlank String username,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        List<PracticeQuestionDTO> questions = practiceService.getPracticeQuestions(username, difficulty, source, tag, status, search);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/questions/{questionId}/status")
    public ResponseEntity<PracticeQuestionDTO> updateStatus(@PathVariable Long questionId,
                                                            @Valid @RequestBody UpdatePracticeStatusRequest request) {
        PracticeQuestionDTO dto = practiceService.updateStatus(questionId, request);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/questions/{questionId}/note")
    public ResponseEntity<PracticeQuestionDTO> updateNote(@PathVariable Long questionId,
                                                          @Valid @RequestBody UpdatePracticeNoteRequest request) {
        PracticeQuestionDTO dto = practiceService.updateNote(questionId, request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/statistics")
    public ResponseEntity<PracticeStatisticsDTO> getStatistics(@RequestParam @NotBlank String username) {
        PracticeStatisticsDTO statistics = practiceService.getStatistics(username);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> listTags() {
        return ResponseEntity.ok(practiceService.getAvailableTags());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<PracticeCategoryDTO>> listCategories(
            @RequestParam @NotBlank String username,
            @RequestParam(name = "includeEmpty", defaultValue = "false") boolean includeEmpty) {

        return ResponseEntity.ok(practiceService.getCategoriesWithQuestions(username, includeEmpty));
    }

    @GetMapping("/random")
    public ResponseEntity<List<PracticeQuestionDTO>> getRandomQuestions(
            @RequestParam @NotBlank String username,
            @RequestParam(name = "count", defaultValue = "10") int count) {

        return ResponseEntity.ok(practiceService.getRandomQuestions(username, count));
    }
}