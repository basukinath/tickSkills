package com.basuki.project.tickSkills.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for bulk import results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkImportResultDTO {
    
    private int totalQuestions;
    private int successfulImports;
    private int skippedDuplicates;
    private int failedImports;
    private long durationMs;
    
    @Builder.Default
    private List<String> errorMessages = new ArrayList<>();
    
    @Builder.Default
    private List<String> skippedTitles = new ArrayList<>();
    
    /**
     * Generate summary message
     */
    public String getSummary() {
        return String.format(
            "Bulk Import Complete: %d/%d successful, %d duplicates skipped, %d failed (took %dms)",
            successfulImports, totalQuestions, skippedDuplicates, failedImports, durationMs
        );
    }
}
