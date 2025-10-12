package com.basuki.project.tickSkills.service.questions;

import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface QuestionsService {
    Question create(QuestionRequestDTO request);
    Question update(Long id, QuestionRequestDTO request);
    void delete(Long id);
    Question findById(Long id);
    Page<Question> list(String categoryName, String difficulty, String source, String search, Pageable pageable);
    List<Question> random(int count);
    // convenience to get 10 random questions
    default List<Question> random10() { return random(10); }
    List<Question> findByTagName(String tagName);
    List<Question> findByCategoryName(String categoryName);
    // new operations
    Category addCategory(String name, String description);
    Question updateExternalUrl(Long id, String externalUrl);
    List<Question> findByDifficulty(String difficulty);
}
