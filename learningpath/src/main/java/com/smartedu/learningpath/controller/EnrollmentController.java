package com.smartedu.learningpath.controller;

import com.smartedu.learningpath.dto.CourseSummaryResponse;
import com.smartedu.learningpath.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final CourseService courseService;

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseSummaryResponse>> getMyEnrolledCourses(Principal principal) {
        List<CourseSummaryResponse> courses = courseService.findEnrolledCoursesByStudent(principal.getName());
        return ResponseEntity.ok(courses);
    }
}
