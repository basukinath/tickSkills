package com.basuki.project.tickSkills.repository.questions;

import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    Optional<Question> findByTitle(String title);
    
    // Find ACTIVE questions by tag name
    @Query("SELECT DISTINCT q FROM Question q JOIN q.tags t WHERE t.name = :tagName AND q.active = true")
    List<Question> findByTagName(@Param("tagName") String tagName);
    
    // Find ACTIVE questions by category name
    @Query("SELECT q FROM Question q WHERE q.category.name = :categoryName AND q.active = true")
    List<Question> findByCategoryName(@Param("categoryName") String categoryName);
    
    // Get random ACTIVE questions using native query (database-level random selection)
    @Query(value = "SELECT * FROM question WHERE is_active = true ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("count") int count);
    
    // Check if title exists (memory efficient)
    boolean existsByTitle(String title);

    // Update is_active status by title (for bulk updates)
    @Modifying
    @Query("UPDATE Question q SET q.active = :isActive WHERE q.title = :title")
    int updateIsActiveByTitle(@Param("title") String title, @Param("isActive") boolean isActive);

    long countByActiveTrue();

    long countByActiveTrueAndDifficulty(Difficulty difficulty);
    
    // Count methods without active filter
    @Query("SELECT COUNT(q) FROM Question q WHERE q.difficulty = :difficulty")
    long countByDifficulty(@Param("difficulty") Difficulty difficulty);
}
