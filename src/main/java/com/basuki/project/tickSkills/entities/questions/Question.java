package com.basuki.project.tickSkills.entities.questions;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "question")
@Data
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourcePlatform source;

    @Column(name = "external_url", columnDefinition = "TEXT", nullable = false)
    private String externalUrl;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "is_premium")
    private boolean premium = false;

    @Column(name = "acceptance_rate")
    private BigDecimal acceptanceRate;

    @Column(name = "companies")
    private String companies;

    @ManyToMany
    @JoinTable(name = "question_tag",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    private Set<Tag> tags = new HashSet<>();
}
