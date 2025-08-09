
package com.smartedu.learningpath.dto;


public record ResourceCreateRequest(
        Long id,
        String title,
        String resourceType, // "PDF", "VIDEO", "LINK"
        String url, // Used for VIDEO and LINK
        Integer estimatedTimeToCompleteMinutes
) {}