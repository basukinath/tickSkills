package com.basuki.project.tickSkills.dtos;

import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.SourcePlatform;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequestDTO {
    private String title;
    private Difficulty difficulty;
    private String category;
    private SourcePlatform source;
    private String externalUrl;
    private boolean isPremium;
    private List<String> tags;
}
