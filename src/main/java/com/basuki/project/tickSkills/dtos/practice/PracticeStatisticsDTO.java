package com.basuki.project.tickSkills.dtos.practice;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PracticeStatisticsDTO {
    String username;
    long totalQuestions;
    long solvedCount;
    long unsolvedCount;
    long easyTotal;
    long easySolved;
    long mediumTotal;
    long mediumSolved;
    long hardTotal;
    long hardSolved;
}