package com.smartedu.learningpath.dto;

import com.fasterxml.jackson.annotation.JsonProperty; // ✅ IMPORT THIS
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CourseSummaryResponse {
    private Long id;
    private String title;
    private String description;
    private String thumbnailPath;
    private BigDecimal price;
    private BigDecimal discountPercentage;
    private String instructorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    private int moduleCount;
    private int enrollmentCount;


    @JsonProperty("isEnrolled")
    private boolean isEnrolled;
}
