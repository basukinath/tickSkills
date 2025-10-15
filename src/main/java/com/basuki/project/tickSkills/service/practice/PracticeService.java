package com.basuki.project.tickSkills.service.practice;

import com.basuki.project.tickSkills.dtos.practice.PracticeCategoryDTO;
import com.basuki.project.tickSkills.dtos.practice.PracticeQuestionDTO;
import com.basuki.project.tickSkills.dtos.practice.PracticeStatisticsDTO;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeNoteRequest;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeStatusRequest;

import java.util.List;

public interface PracticeService {

    List<PracticeQuestionDTO> getPracticeQuestions(String username,
                                                    String difficulty,
                                                    String source,
                                                    String tag,
                                                    String status,
                                                    String search);

    PracticeQuestionDTO updateStatus(Long questionId, UpdatePracticeStatusRequest request);

    PracticeQuestionDTO updateNote(Long questionId, UpdatePracticeNoteRequest request);

    PracticeStatisticsDTO getStatistics(String username);

    List<String> getAvailableTags();

    List<PracticeCategoryDTO> getCategoriesWithQuestions(String username, boolean includeEmptyCategories);

    List<PracticeQuestionDTO> getRandomQuestions(String username, int count);
}