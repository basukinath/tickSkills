package com.basuki.project.tickSkills.repository.questions;

import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.SourcePlatform;
import com.basuki.project.tickSkills.entities.questions.Tag;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class QuestionSpecification {

    public static Specification<Question> filterBy(
            String categoryName,
            String difficulty,
            String source,
            String tagName,
            String search
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ALWAYS filter for active questions only
            predicates.add(criteriaBuilder.equal(root.get("active"), true));

            // Filter by category name
            if (categoryName != null && !categoryName.trim().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        root.get("category").get("name"), categoryName
                ));
            }

            // Filter by difficulty
            if (difficulty != null && !difficulty.trim().isEmpty()) {
                try {
                    Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("difficulty"), diff));
                } catch (IllegalArgumentException e) {
                    // Invalid difficulty, ignore filter
                }
            }

            // Filter by source platform
            if (source != null && !source.trim().isEmpty()) {
                try {
                    SourcePlatform src = SourcePlatform.valueOf(source.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("source"), src));
                } catch (IllegalArgumentException e) {
                    // Invalid source, ignore filter
                }
            }

            // Filter by tag name
            if (tagName != null && !tagName.trim().isEmpty()) {
                Join<Question, Tag> tagJoin = root.join("tags", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(tagJoin.get("name"), tagName));
                
                // Ensure distinct results when filtering by tags
                if (query != null) {
                    query.distinct(true);
                }
            }

            // Search in title
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                predicates.add(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("title")),
                                searchPattern
                        )
                );
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
