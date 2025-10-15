package com.basuki.project.tickSkills.service.practice;

import com.basuki.project.tickSkills.dtos.practice.PracticeCategoryDTO;
import com.basuki.project.tickSkills.dtos.practice.PracticeQuestionDTO;
import com.basuki.project.tickSkills.dtos.practice.PracticeStatisticsDTO;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeNoteRequest;
import com.basuki.project.tickSkills.dtos.practice.UpdatePracticeStatusRequest;
import com.basuki.project.tickSkills.entities.practice.PracticeStatus;
import com.basuki.project.tickSkills.entities.practice.UserQuestionProgress;
import com.basuki.project.tickSkills.entities.questions.Category;
import com.basuki.project.tickSkills.entities.questions.Difficulty;
import com.basuki.project.tickSkills.entities.questions.Question;
import com.basuki.project.tickSkills.entities.questions.Tag;
import com.basuki.project.tickSkills.entities.users.Users;
import com.basuki.project.tickSkills.exceptions.TickSkillExceptions;
import com.basuki.project.tickSkills.repository.practice.UserQuestionProgressRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.basuki.project.tickSkills.repository.questions.QuestionSpecification;
import com.basuki.project.tickSkills.repository.questions.TagRepository;
import com.basuki.project.tickSkills.repository.questions.CategoryRepository;
import com.basuki.project.tickSkills.repository.users.UsersRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PracticeServiceImpl implements PracticeService {

    private final QuestionRepository questionRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;
    private final UsersRepository usersRepository;
    private final UserQuestionProgressRepository progressRepository;

    @Override
    public List<PracticeQuestionDTO> getPracticeQuestions(String username,
                                                          String difficulty,
                                                          String source,
                                                          String tag,
                                                          String status,
                                                          String search) {

        Users user = getActiveUser(username);

        // Fetch ACTIVE questions using QuestionSpecification (now filters for active=true automatically)
        Specification<Question> spec = QuestionSpecification.filterBy(null,
                normalize(difficulty),
                normalize(source),
                normalize(tag),
                normalize(search));

        List<Question> questions = questionRepository.findAll(spec);
        if (questions.isEmpty()) {
            return List.of();
        }

        List<Long> questionIds = questions.stream().map(Question::getId).collect(Collectors.toList());
        Map<Long, UserQuestionProgress> progressMap = progressRepository
                .findByUserIdAndQuestionIdIn(user.getId(), questionIds)
                .stream()
                .collect(Collectors.toMap(p -> p.getQuestion().getId(), Function.identity()));

        PracticeStatus statusFilter = parseStatus(status);

        return questions.stream()
                .filter(question -> includeQuestion(progressMap.get(question.getId()), statusFilter))
                .map(question -> toDto(question, progressMap.get(question.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PracticeQuestionDTO updateStatus(Long questionId, UpdatePracticeStatusRequest request) {
        Users user = getActiveUser(request.getUsername());
        Question question = questionRepository.findById(questionId)
                .filter(Question::isActive)  // CRITICAL: Only allow updates for ACTIVE questions
                .orElseThrow(() -> new TickSkillExceptions("Question not found: " + questionId));

        PracticeStatus newStatus = Objects.requireNonNull(request.getStatus(), "status must not be null");

        UserQuestionProgress progress = progressRepository.findByUserIdAndQuestionId(user.getId(), questionId)
                .orElseGet(() -> UserQuestionProgress.builder()
                        .user(user)
                        .question(question)
                        .status(newStatus)
                        .build());

        progress.setStatus(newStatus);
        UserQuestionProgress saved = progressRepository.save(progress);
        return toDto(question, saved);
    }

    @Override
    @Transactional
    public PracticeQuestionDTO updateNote(Long questionId, UpdatePracticeNoteRequest request) {
        Users user = getActiveUser(request.getUsername());
        Question question = questionRepository.findById(questionId)
                .filter(Question::isActive)  // CRITICAL: Only allow updates for ACTIVE questions
                .orElseThrow(() -> new TickSkillExceptions("Question not found: " + questionId));

        UserQuestionProgress progress = progressRepository.findByUserIdAndQuestionId(user.getId(), questionId)
                .orElseGet(() -> UserQuestionProgress.builder()
                        .user(user)
                        .question(question)
                        .status(PracticeStatus.UNSOLVED)
                        .build());

        progress.setNote(request.getNote());
        UserQuestionProgress saved = progressRepository.save(progress);
        return toDto(question, saved);
    }

    @Override
    public PracticeStatisticsDTO getStatistics(String username) {
        Users user = getActiveUser(username);

        // Count ALL questions, not just active ones
        long totalQuestions = questionRepository.count();
        long easyTotal = questionRepository.countByDifficulty(Difficulty.EASY);
        long mediumTotal = questionRepository.countByDifficulty(Difficulty.MEDIUM);
        long hardTotal = questionRepository.countByDifficulty(Difficulty.HARD);

        // Count solved questions by difficulty (without active filter)
        long easySolved = progressRepository
                .countByUserIdAndQuestion_DifficultyAndStatus(user.getId(), Difficulty.EASY, PracticeStatus.SOLVED);
        long mediumSolved = progressRepository
                .countByUserIdAndQuestion_DifficultyAndStatus(user.getId(), Difficulty.MEDIUM, PracticeStatus.SOLVED);
        long hardSolved = progressRepository
                .countByUserIdAndQuestion_DifficultyAndStatus(user.getId(), Difficulty.HARD, PracticeStatus.SOLVED);

        long solvedTotal = easySolved + mediumSolved + hardSolved;
        long unsolvedTotal = Math.max(totalQuestions - solvedTotal, 0);

        return PracticeStatisticsDTO.builder()
                .username(user.getUsername())
                .totalQuestions(totalQuestions)
                .solvedCount(solvedTotal)
                .unsolvedCount(unsolvedTotal)
                .easyTotal(easyTotal)
                .easySolved(easySolved)
                .mediumTotal(mediumTotal)
                .mediumSolved(mediumSolved)
                .hardTotal(hardTotal)
                .hardSolved(hardSolved)
                .build();
    }

    @Override
    public List<String> getAvailableTags() {
        return tagRepository.findAll().stream()
                .map(Tag::getName)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    @Override
    public List<PracticeCategoryDTO> getCategoriesWithQuestions(String username, boolean includeEmptyCategories) {
        Users user = getActiveUser(username);

        List<Category> categories = new ArrayList<>(categoryRepository.findAll());
        if (categories.isEmpty()) {
            return List.of();
        }

        categories.sort(Comparator
                .comparing((Category c) -> c.getSortOrder() == null ? Integer.MAX_VALUE : c.getSortOrder())
                .thenComparing(Category::getName, String.CASE_INSENSITIVE_ORDER));

        Map<Long, List<Question>> questionsByCategory = new LinkedHashMap<>();
        Set<Long> questionIds = new HashSet<>();

        for (Category category : categories) {
            // Get ALL questions for this category, not just active ones
            List<Question> questions = questionRepository.findByCategoryName(category.getName());

            if (!questions.isEmpty() || includeEmptyCategories) {
                questionsByCategory.put(category.getId(), questions);
                questions.forEach(question -> questionIds.add(question.getId()));
            }
        }

        if (questionsByCategory.isEmpty()) {
            return List.of();
        }

        Map<Long, UserQuestionProgress> progressMap = questionIds.isEmpty()
                ? Map.of()
                : progressRepository.findByUserIdAndQuestionIdIn(user.getId(), questionIds).stream()
                .collect(Collectors.toMap(p -> p.getQuestion().getId(), Function.identity()));

        List<PracticeCategoryDTO> result = new ArrayList<>(questionsByCategory.size());
        for (Category category : categories) {
            List<Question> questions = questionsByCategory.get(category.getId());
            if (questions == null) {
                continue;
            }

        List<PracticeQuestionDTO> questionDtos = questions.stream()
            .sorted(Comparator
                .comparing((Question q) -> q.getDifficulty() != null ? q.getDifficulty().ordinal() : Integer.MAX_VALUE)
                .thenComparing(Question::getTitle, String.CASE_INSENSITIVE_ORDER))
                    .map(question -> toDto(question, progressMap.get(question.getId())))
                    .collect(Collectors.toList());

            long solvedCount = questionDtos.stream()
                    .filter(dto -> dto.getStatus() == PracticeStatus.SOLVED)
                    .count();

            result.add(PracticeCategoryDTO.builder()
                    .name(category.getName())
                    .displayName(category.getName())
                    .description(category.getDescription())
                    .totalQuestions(questionDtos.size())
                    .solvedQuestions(solvedCount)
                    .questions(questionDtos)
                    .build());
        }

        return result;
    }

    private PracticeQuestionDTO toDto(Question question, UserQuestionProgress progress) {
        PracticeStatus status = progress != null ? progress.getStatus() : PracticeStatus.UNSOLVED;
        String note = progress != null ? progress.getNote() : null;

        return PracticeQuestionDTO.builder()
                .id(question.getId())
                .title(question.getTitle())
                .difficulty(question.getDifficulty().name())
                .category(question.getCategory() != null ? question.getCategory().getName() : null)
                .source(question.getSource().name())
                .externalUrl(question.getExternalUrl())
                .premium(question.isPremium())
                .active(question.isActive())
                .acceptanceRate(question.getAcceptanceRate())
                .companies(splitCompanies(question.getCompanies()))
                .tags(extractTagNames(question.getTags()))
                .status(status)
                .note(note)
                .lastUpdated(progress != null ? progress.getLastUpdated() : null)
                .build();
    }

    private List<String> extractTagNames(Set<Tag> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(Tag::getName)
                .filter(StringUtils::hasText)
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    private List<String> splitCompanies(String companies) {
        if (!StringUtils.hasText(companies)) {
            return List.of();
        }
        String[] parts = companies.split(",");
        List<String> cleaned = new ArrayList<>(parts.length);
        for (String part : parts) {
            if (StringUtils.hasText(part)) {
                cleaned.add(part.trim());
            }
        }
        cleaned.sort(String.CASE_INSENSITIVE_ORDER);
        return cleaned;
    }

    private boolean includeQuestion(UserQuestionProgress progress, PracticeStatus statusFilter) {
        if (statusFilter == null) {
            return true;
        }
        PracticeStatus currentStatus = progress != null ? progress.getStatus() : PracticeStatus.UNSOLVED;
        if (statusFilter == PracticeStatus.SOLVED) {
            return currentStatus == PracticeStatus.SOLVED;
        }
        // statusFilter == UNSOLVED
        return currentStatus != PracticeStatus.SOLVED;
    }

    private PracticeStatus parseStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        try {
            return PracticeStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            log.warn("Ignoring unsupported practice status filter: {}", status);
            return null;
        }
    }

    @Override
    public List<PracticeQuestionDTO> getRandomQuestions(String username, int count) {
        Users user = getActiveUser(username);

        // Get random ACTIVE questions using repository method (database-optimized)
        List<Question> randomQuestions = questionRepository.findRandomQuestions(Math.max(1, count));

        if (randomQuestions.isEmpty()) {
            return List.of();
        }

        Map<Long, UserQuestionProgress> progressMap = progressRepository
                .findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(
                        p -> p.getQuestion().getId(),
                        Function.identity(),
                        (p1, p2) -> p1
                ));

        return randomQuestions.stream()
                .map(question -> toDto(question, progressMap.get(question.getId())))
                .collect(Collectors.toList());
    }

    private Users getActiveUser(String username) {
        if (!StringUtils.hasText(username)) {
            throw new TickSkillExceptions("Username is required");
        }
        return usersRepository.findFirstByUsernameAndIsDeleted(username, false)
                .orElseThrow(() -> new TickSkillExceptions("User not found: " + username));
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value : null;
    }
}