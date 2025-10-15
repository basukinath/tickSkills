package com.basuki.project.tickSkills.entities.practice;

public enum PracticeStatus {
    UNSOLVED,
    SOLVED;

    public static PracticeStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return UNSOLVED;
        }
        try {
            return PracticeStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return UNSOLVED;
        }
    }
}