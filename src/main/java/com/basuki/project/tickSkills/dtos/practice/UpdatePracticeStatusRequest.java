package com.basuki.project.tickSkills.dtos.practice;

import com.basuki.project.tickSkills.entities.practice.PracticeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePracticeStatusRequest {

    @NotBlank
    private String username;

    @NotNull
    private PracticeStatus status;
}