package com.smartedu.learningpath.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EnrollmentResponse {
    private Long enrollmentId;
    private Long courseId;
    private String courseTitle;
    private String message;
    private LocalDateTime enrollmentDate;
}
