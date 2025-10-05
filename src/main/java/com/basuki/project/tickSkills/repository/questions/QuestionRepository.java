package com.basuki.project.tickSkills.repository.questions;

import com.basuki.project.tickSkills.entities.questions.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    Optional<Question> findBySlug(String slug);
}
