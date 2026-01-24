package com.basuki.project.tickSkills.dtos.practice;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePracticeNoteRequest {

    @NotBlank
    private String username;

    private String note;
}