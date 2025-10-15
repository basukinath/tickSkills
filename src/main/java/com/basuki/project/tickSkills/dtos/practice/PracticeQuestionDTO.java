package com.basuki.project.tickSkills.dtos.practice;

import com.basuki.project.tickSkills.entities.practice.PracticeStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class PracticeQuestionDTO {
    Long id;
    String title;
    String difficulty;
    String category;
    String source;
    String externalUrl;
    boolean premium;
    boolean active;
    BigDecimal acceptanceRate;
    List<String> companies;
    List<String> tags;
    PracticeStatus status;
    String note;
    LocalDateTime lastUpdated;
}