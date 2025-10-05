package com.basuki.project.tickSkills.service.questions;

import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface QuestionsService {
    Question create(QuestionRequestDTO request);
    Question update(String slug, QuestionRequestDTO request);
    void delete(String slug);
    Question findBySlug(String slug);
    Page<Question> list(String categorySlug, String difficulty, String source, String search, Pageable pageable);
    List<Question> random(int count);
    List<Question> findByTagSlug(String tagSlug);
    List<Question> findByCategorySlug(String categorySlug);
}
