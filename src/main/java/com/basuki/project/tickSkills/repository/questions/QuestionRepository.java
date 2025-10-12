package com.basuki.project.tickSkills.repository.questions;

import com.basuki.project.tickSkills.entities.questions.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long>, JpaSpecificationExecutor<Question> {
    Optional<Question> findByTitle(String title);
    
    // Find questions by tag name
    @Query("SELECT DISTINCT q FROM Question q JOIN q.tags t WHERE t.name = :tagName")
    List<Question> findByTagName(@Param("tagName") String tagName);
    
    // Find questions by category name
    @Query("SELECT q FROM Question q WHERE q.category.name = :categoryName")
    List<Question> findByCategoryName(@Param("categoryName") String categoryName);
    
    // Get random questions using native query (database-level random selection)
    @Query(value = "SELECT * FROM question ORDER BY RAND() LIMIT :count", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("count") int count);
    
    // Check if title exists (memory efficient)
    boolean existsByTitle(String title);
}
