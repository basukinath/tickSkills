package com.basuki.project.tickSkills.repository.practice;

import com.basuki.project.tickSkills.entities.practice.PracticeStatus;
import com.basuki.project.tickSkills.entities.practice.UserQuestionProgress;
import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.users.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserQuestionProgressRepository extends JpaRepository<UserQuestionProgress, Long> {

    Optional<UserQuestionProgress> findByUserIdAndQuestionId(Long userId, Long questionId);

    List<UserQuestionProgress> findByUserIdAndQuestionIdIn(Long userId, Collection<Long> questionIds);

    List<UserQuestionProgress> findByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, PracticeStatus status);

    long countByUserIdAndQuestion_ActiveIsTrueAndQuestion_DifficultyAndStatus(Long userId, Difficulty difficulty, PracticeStatus status);
    
    // Count methods without active filter
    long countByUserIdAndQuestion_DifficultyAndStatus(Long userId, Difficulty difficulty, PracticeStatus status);
}