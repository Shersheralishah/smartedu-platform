// --- CourseAnalyticsResponse.java ---
// This is the main container that will be sent as the final JSON response.
package com.smartedu.learningpath.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CourseAnalyticsResponse {
    private Long courseId;
    private String courseTitle;
    private int totalEnrollments;
    private BigDecimal coursePrice;
    private BigDecimal courseDiscount;
    private List<EnrollmentStatDTO> dailyEnrollments;
    private List<EnrolledStudentDTO> students;
}