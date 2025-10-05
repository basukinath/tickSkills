package com.basuki.project.tickSkills.util;

import java.text.Normalizer;

public class SlugUtil {
    public static String toSlug(String input) {
        if (input == null) return null;
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\p{Alnum}-]", "").toLowerCase();
        slug = slug.replaceAll("^-+|-+$", "");
        return slug;
    }
}
