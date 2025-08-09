package com.smartedu.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonProperty; // ✅ IMPORT THIS
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CourseDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String thumbnailPath;
    private BigDecimal price;
    private BigDecimal discountPercentage;
    private List<ModuleDetailResponse> modules;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    @JsonProperty("isEnrolled")
    private boolean isEnrolled;
}
