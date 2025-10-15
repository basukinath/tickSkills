package com.basuki.project.tickSkills.service.admin;

import com.basuki.project.tickSkills.repository.questions.QuestionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.List;
import java.util.Map;

@Service
public class DataSyncService {

    private final QuestionRepository questionRepository;

    public DataSyncService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    /**
     * Updates is_active status for all questions based on leetcode_dsa_questions.json
     * @return Summary of the update operation
     */
    @Transactional
    public UpdateSummary updateIsActiveFromJson() {
        try {
            // Read JSON file
            File file = new File("etc/leetcode_dsa_questions.json");
            if (!file.exists()) {
                return new UpdateSummary(false, "File not found: " + file.getAbsolutePath(), 0, 0, 0);
            }

            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> items = mapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {});

            int activeCount = 0;
            int inactiveCount = 0;
            int notFoundCount = 0;

            for (Map<String, Object> item : items) {
                String title = (String) item.get("title");
                Boolean isActive = item.get("is_active") != null ? (Boolean) item.get("is_active") : true;

                if (title != null) {
                    int updated = questionRepository.updateIsActiveByTitle(title, isActive);
                    if (updated > 0) {
                        if (isActive) {
                            activeCount++;
                        } else {
                            inactiveCount++;
                        }
                    } else {
                        notFoundCount++;
                    }
                }
            }

            return new UpdateSummary(
                    true,
                    "Successfully updated questions",
                    activeCount,
                    inactiveCount,
                    notFoundCount
            );

        } catch (Exception e) {
            return new UpdateSummary(false, "Error: " + e.getMessage(), 0, 0, 0);
        }
    }

    public static class UpdateSummary {
        private final boolean success;
        private final String message;
        private final int activeCount;
        private final int inactiveCount;
        private final int notFoundCount;

        public UpdateSummary(boolean success, String message, int activeCount, int inactiveCount, int notFoundCount) {
            this.success = success;
            this.message = message;
            this.activeCount = activeCount;
            this.inactiveCount = inactiveCount;
            this.notFoundCount = notFoundCount;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public int getActiveCount() { return activeCount; }
        public int getInactiveCount() { return inactiveCount; }
        public int getNotFoundCount() { return notFoundCount; }

        @Override
        public String toString() {
            return String.format("UpdateSummary{success=%s, message='%s', active=%d, inactive=%d, notFound=%d}",
                    success, message, activeCount, inactiveCount, notFoundCount);
        }
    }
}
