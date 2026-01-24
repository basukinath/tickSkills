package com.basuki.project.tickSkills.dtos.practice;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class PracticeCategoryDTO {
    String name;
    String displayName;
    String description;
    long totalQuestions;
    long solvedQuestions;
    List<PracticeQuestionDTO> questions;
}
