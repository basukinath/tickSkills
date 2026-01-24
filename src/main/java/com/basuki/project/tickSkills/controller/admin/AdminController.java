package com.basuki.project.tickSkills.controller.admin;

import com.basuki.project.tickSkills.service.admin.DataSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DataSyncService dataSyncService;

    public AdminController(DataSyncService dataSyncService) {
        this.dataSyncService = dataSyncService;
    }

    /**
     * Updates is_active status for all questions based on leetcode_dsa_questions.json
     * POST /api/admin/sync-active-status
     */
    @PostMapping("/sync-active-status")
    public ResponseEntity<DataSyncService.UpdateSummary> syncActiveStatus() {
        DataSyncService.UpdateSummary summary = dataSyncService.updateIsActiveFromJson();
        
        if (summary.isSuccess()) {
            return ResponseEntity.ok(summary);
        } else {
            return ResponseEntity.status(500).body(summary);
        }
    }
}
