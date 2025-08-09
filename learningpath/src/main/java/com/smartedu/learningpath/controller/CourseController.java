package com.smartedu.learningpath.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartedu.learningpath.dto.*;
import com.smartedu.learningpath.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> createCourse(
            @RequestPart("courseData") String courseDataJson,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Principal principal
    ) throws IOException {
        CourseCreateRequest request = objectMapper.readValue(courseDataJson, CourseCreateRequest.class);
        courseService.createCourse(request, thumbnail, files, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Course created successfully"));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestPart("courseData") String courseDataJson,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Principal principal
    ) throws IOException {
        CourseCreateRequest request = objectMapper.readValue(courseDataJson, CourseCreateRequest.class);
        courseService.updateCourse(id, request, thumbnail, files, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Course updated successfully"));
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Page<CourseSummaryResponse>> getMyCourses(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Page<CourseSummaryResponse> courses = courseService.findCoursesByInstructor(principal.getName(), page, size);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/all-for-student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<CourseSummaryResponse>> getAllCoursesForStudent(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        Page<CourseSummaryResponse> courses = courseService.findAllCoursesForStudent(principal.getName(), page, size);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR')")
    public ResponseEntity<CourseDetailResponse> getCourseById(@PathVariable Long id, Principal principal) {
        CourseDetailResponse course = courseService.findCourseDetailsById(id, principal);
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id, Principal principal) {
        courseService.deleteCourse(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully."));
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> enrollInCourse(
            @PathVariable Long courseId,
            Principal principal
    ) {
        EnrollmentResponse response = courseService.enrollStudentInCourse(courseId, principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'STUDENT')")
    public ResponseEntity<Page<CourseSummaryResponse>> searchCourses(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            Principal principal
    ) {
        Page<CourseSummaryResponse> courses = courseService.searchCourses(query, page, size, principal);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}/analytics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseAnalyticsResponse> getCourseAnalytics(
            @PathVariable Long courseId,
            Principal principal
    ) {
        CourseAnalyticsResponse analytics = courseService.getCourseAnalytics(courseId, principal.getName());
        return ResponseEntity.ok(analytics);
    }
}
