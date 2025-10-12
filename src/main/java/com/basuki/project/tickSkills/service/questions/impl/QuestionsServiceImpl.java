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
        if (request.getDifficulty() != null) q.setDifficulty(request.getDifficulty());
        if (request.getCategory() != null) {
            Category c = categoryRepository.findByName(request.getCategory())
                .orElseGet(() -> {
                    Category nc = new Category(); 
                    nc.setName(request.getCategory()); 
                    return categoryRepository.save(nc);
                });
            q.setCategory(c);
        }
        if (request.getSource() != null) q.setSource(request.getSource());
        q.setExternalUrl(request.getExternalUrl());

        Set<Tag> tags = new HashSet<>();
        if (request.getTags() != null) {
            for (String t : request.getTags()) {
                Tag tag = tagRepository.findByName(t)
                    .orElseGet(() -> { 
                        Tag nt = new Tag(); 
                        nt.setName(t); 
                        return tagRepository.save(nt); 
                    });
                tags.add(tag);
            }
        }
        q.setTags(tags);
        return questionRepository.save(q);
    }

    @Override
    public Question update(Long id, QuestionRequestDTO request) {
        Question existing = questionRepository.findById(id).orElse(null);
        if (existing == null) return null;
        
        // Only update fields that are provided (not null)
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            existing.setTitle(request.getTitle());
        }
        if (request.getDifficulty() != null) {
            existing.setDifficulty(request.getDifficulty());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            Category c = categoryRepository.findByName(request.getCategory())
                .orElseGet(() -> { 
                    Category nc = new Category(); 
                    nc.setName(request.getCategory()); 
                    return categoryRepository.save(nc); 
                });
            existing.setCategory(c);
        }
        if (request.getSource() != null) {
            existing.setSource(request.getSource());
        }
        if (request.getExternalUrl() != null && !request.getExternalUrl().trim().isEmpty()) {
            existing.setExternalUrl(request.getExternalUrl());
        }
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String t : request.getTags()) {
                Tag tag = tagRepository.findByName(t)
                    .orElseGet(() -> { 
                        Tag nt = new Tag(); 
                        nt.setName(t); 
                        return tagRepository.save(nt); 
                    });
                tags.add(tag);
            }
            existing.setTags(tags);
        }
        return questionRepository.save(existing);
    }

    @Override
    public void delete(Long id) {
        questionRepository.deleteById(id);
    }

    @Override
    public Question findById(Long id) {
        return questionRepository.findById(id).orElse(null);
    }

    @Override
    public Page<Question> list(String categoryName, String difficulty, String source, String search, Pageable pageable) {
        return questionRepository.findAll(pageable);
    }

    @Override
    public List<Question> random(int count) {
        List<Question> all = questionRepository.findAll();
        Collections.shuffle(all);
        return all.stream().limit(count).toList();
    }

    @Override
    public List<Question> findByTagName(String tagName) {
        return questionRepository.findAll().stream()
                .filter(q -> q.getTags().stream().anyMatch(t -> t.getName().equals(tagName)))
                .toList();
    }

    @Override
    public List<Question> findByCategoryName(String categoryName) {
        return questionRepository.findAll().stream()
                .filter(q -> q.getCategory() != null && categoryName.equals(q.getCategory().getName()))
                .toList();
    }

    @Override
    public Category addCategory(String name, String description) {
        Category c = categoryRepository.findByName(name).orElseGet(() -> {
            Category nc = new Category(); 
            nc.setName(name); 
            nc.setDescription(description); 
            return categoryRepository.save(nc);
        });
        return c;
    }

    @Override
    public Question updateExternalUrl(Long id, String externalUrl) {
        Question q = questionRepository.findById(id).orElse(null);
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
