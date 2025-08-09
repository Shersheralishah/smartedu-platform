// --- EnrolledStudentDTO.java ---
// This class holds the information for a single student in the enrollment list.
package com.smartedu.learningpath.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EnrolledStudentDTO {
    private Long userId;
    private String fullName;
    private String email;
    private LocalDateTime enrollmentDate;
}