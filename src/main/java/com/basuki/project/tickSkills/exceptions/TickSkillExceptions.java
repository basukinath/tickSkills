package com.basuki.project.tickSkills.exceptions;

public class TickSkillExceptions extends RuntimeException {
    public TickSkillExceptions() {
        super("Exception occured in the app");
    }

    public TickSkillExceptions(String errorMessage) {
        super(errorMessage);
    }
}
