package com.basuki.project.tickSkills.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for bulk importing questions from JSON file.
 * Matches the structure of leetcode_dsa_questions.json
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkImportQuestionDTO {
    
    private Integer id;  // Optional - can be null
    private String title;
    private String slug;
    private String difficulty;  // Easy, Medium, Hard
    private String category;
    private String source;  // LEETCODE, HACKERRANK, GFG
    private String external_url;
    private Boolean is_active;
    private Boolean is_premium;
    private String acceptance_rate;
    private String companies;
    private List<String> tags;
    
    /**
     * Convert to QuestionRequestDTO for processing
     */
    public QuestionRequestDTO toQuestionRequestDTO() {
        QuestionRequestDTO dto = new QuestionRequestDTO();
        dto.setTitle(this.title);
        dto.setDifficulty(mapDifficulty(this.difficulty));
        dto.setCategory(this.category);
        dto.setSource(mapSource(this.source));
        dto.setExternalUrl(this.external_url);
        dto.setTags(this.tags);
        return dto;
    }
    
    /**
     * Map string difficulty to enum
     */
    private com.basuki.project.tickSkills.entities.questions.Difficulty mapDifficulty(String difficulty) {
        if (difficulty == null) return com.basuki.project.tickSkills.entities.questions.Difficulty.MEDIUM;
        
        return switch (difficulty.toUpperCase()) {
            case "EASY" -> com.basuki.project.tickSkills.entities.questions.Difficulty.EASY;
            case "MEDIUM" -> com.basuki.project.tickSkills.entities.questions.Difficulty.MEDIUM;
            case "HARD" -> com.basuki.project.tickSkills.entities.questions.Difficulty.HARD;
            default -> com.basuki.project.tickSkills.entities.questions.Difficulty.MEDIUM;
        };
    }
    
    /**
     * Map string source to enum
     */
    private com.basuki.project.tickSkills.entities.questions.SourcePlatform mapSource(String source) {
        if (source == null) return com.basuki.project.tickSkills.entities.questions.SourcePlatform.LEETCODE;
        
        return switch (source.toUpperCase()) {
            case "LEETCODE" -> com.basuki.project.tickSkills.entities.questions.SourcePlatform.LEETCODE;
            case "HACKERRANK" -> com.basuki.project.tickSkills.entities.questions.SourcePlatform.HACKERRANK;
            case "GFG", "GEEKSFORGEEKS" -> com.basuki.project.tickSkills.entities.questions.SourcePlatform.GFG;
            default -> com.basuki.project.tickSkills.entities.questions.SourcePlatform.LEETCODE;
        };
    }
}
