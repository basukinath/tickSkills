package com.basuki.project.tickSkills.service.questions.impl;

import com.basuki.project.tickSkills.dtos.QuestionRequestDTO;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.Tag;
// ...existing imports...
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.basuki.project.tickSkills.repository.questions.TagRepository;
import com.basuki.project.tickSkills.service.questions.QuestionsService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.Collections;

@Service
public class QuestionsServiceImpl implements QuestionsService {
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public QuestionsServiceImpl(QuestionRepository questionRepository, CategoryRepository categoryRepository, TagRepository tagRepository) {
        this.questionRepository = questionRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    public Question create(QuestionRequestDTO request) {
        Question q = new Question();
        q.setTitle(request.getTitle());
        q.setSlug(request.getTitle().toLowerCase().replaceAll("\\s+", "-"));
        if (request.getDifficulty() != null) q.setDifficulty(request.getDifficulty());
        if (request.getCategory() != null) {
            String slug = request.getCategory().trim().toLowerCase().replaceAll("\\s+", "-");
            Category c = categoryRepository.findBySlug(slug).orElseGet(() -> {
                Category nc = new Category(); nc.setName(request.getCategory()); nc.setSlug(slug); return categoryRepository.save(nc);
            });
            q.setCategory(c);
        }
        if (request.getSource() != null) q.setSource(request.getSource());
        q.setExternalUrl(request.getExternalUrl());
        q.setPremium(request.isPremium());

        Set<Tag> tags = new HashSet<>();
        if (request.getTags() != null) {
            for (String t : request.getTags()) {
                String slug = t.trim().toLowerCase().replaceAll("\\s+", "-");
                Tag tag = tagRepository.findBySlug(slug).orElseGet(() -> { Tag nt = new Tag(); nt.setName(t); nt.setSlug(slug); return tagRepository.save(nt); });
                tags.add(tag);
            }
        }
        q.setTags(tags);
        return questionRepository.save(q);
    }

    @Override
    public Question update(String slug, QuestionRequestDTO request) {
        Question existing = questionRepository.findBySlug(slug).orElse(null);
        if (existing == null) return null;
        existing.setTitle(request.getTitle());
        existing.setSlug(request.getTitle().toLowerCase().replaceAll("\\s+", "-"));
        if (request.getDifficulty() != null) existing.setDifficulty(request.getDifficulty());
        if (request.getCategory() != null) {
            String cslug = request.getCategory().trim().toLowerCase().replaceAll("\\s+", "-");
            Category c = categoryRepository.findBySlug(cslug).orElseGet(() -> { Category nc = new Category(); nc.setName(request.getCategory()); nc.setSlug(cslug); return categoryRepository.save(nc); });
            existing.setCategory(c);
        }
        existing.setExternalUrl(request.getExternalUrl());
        existing.setPremium(request.isPremium());
        return questionRepository.save(existing);
    }

    @Override
    public void delete(String slug) {
        questionRepository.findBySlug(slug).ifPresent(questionRepository::delete);
    }

    @Override
    public Question findBySlug(String slug) {
        return questionRepository.findBySlug(slug).orElse(null);
    }

    @Override
    public Page<Question> list(String categorySlug, String difficulty, String source, String search, Pageable pageable) {
        return questionRepository.findAll(pageable);
    }

    @Override
    public List<Question> random(int count) {
        List<Question> all = questionRepository.findAll();
        Collections.shuffle(all);
        return all.stream().limit(count).toList();
    }

    @Override
    public List<Question> findByTagSlug(String tagSlug) {
        return questionRepository.findAll().stream()
                .filter(q -> q.getTags().stream().anyMatch(t -> t.getSlug().equals(tagSlug)))
                .toList();
    }

    @Override
    public List<Question> findByCategorySlug(String categorySlug) {
        return questionRepository.findAll().stream()
                .filter(q -> q.getCategory() != null && categorySlug.equals(q.getCategory().getSlug()))
                .toList();
    }

    @Override
    public Category addCategory(String name, String description) {
        String slug = name.trim().toLowerCase().replaceAll("\\s+", "-");
        Category c = categoryRepository.findBySlug(slug).orElseGet(() -> {
            Category nc = new Category(); nc.setName(name); nc.setSlug(slug); nc.setDescription(description); return categoryRepository.save(nc);
        });
        return c;
    }

    @Override
    public Question addOrUpdateSlug(String existingSlug, String newSlug) {
        Question q = questionRepository.findBySlug(existingSlug).orElse(null);
        if (q == null) return null;
        q.setSlug(newSlug);
        return questionRepository.save(q);
    }

    @Override
    public Question updateExternalUrl(String slug, String externalUrl) {
        Question q = questionRepository.findBySlug(slug).orElse(null);
        if (q == null) return null;
        q.setExternalUrl(externalUrl);
        return questionRepository.save(q);
    }

    @Override
    public List<Question> findByDifficulty(String difficulty) {
        if (difficulty == null) return List.of();
        return questionRepository.findAll().stream()
                .filter(q -> q.getDifficulty() != null && difficulty.equalsIgnoreCase(q.getDifficulty().name()))
                .toList();
    }
}
