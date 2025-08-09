// --- EnrollmentStatDTO.java ---
// This class represents a single data point for the enrollment graph (e.g., "5 enrollments on July 23rd").
package com.smartedu.learningpath.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EnrollmentStatDTO {
    private LocalDate date;
    private long enrollmentCount;
}