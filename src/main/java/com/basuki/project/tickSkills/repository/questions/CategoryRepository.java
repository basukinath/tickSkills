package com.basuki.project.tickSkills.repository.questions;

import com.basuki.project.tickSkills.entities.questions.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
}
