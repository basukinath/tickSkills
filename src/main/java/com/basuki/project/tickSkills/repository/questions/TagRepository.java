package com.basuki.project.tickSkills.repository.questions;

import com.basuki.project.tickSkills.entities.questions.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findBySlug(String slug);
}
