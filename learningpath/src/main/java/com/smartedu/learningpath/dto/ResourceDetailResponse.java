package com.smartedu.learningpath.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResourceDetailResponse {
    private Long id;
    private String title;
    private String resourceType;
    private String url;
    private String filePath;
    private Integer estimatedTimeToCompleteMinutes;
}