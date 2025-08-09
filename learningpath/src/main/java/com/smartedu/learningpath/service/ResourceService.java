package com.smartedu.learningpath.service;

import com.smartedu.learningpath.course.EnrollmentRepository;
import com.smartedu.learningpath.course.ResourceRepository;
import com.smartedu.learningpath.user.User;
import com.smartedu.learningpath.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
// No aliasing needed for this import
import org.springframework.core.io.Resource;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    public Resource loadFileForViewing(Long resourceId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // This refers to your own 'Resource' entity
        com.smartedu.learningpath.course.Resource resourceEntity = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        var course = resourceEntity.getModule().getCourse();


        boolean isEnrolled = enrollmentRepository.findByStudentAndCourse(student, course).isPresent();
        boolean isFirstModule = resourceEntity.getModule().getModuleOrder() == 1;

        // A student can view a resource if they are enrolled OR if it's part of the first module (the free preview).
        if (!isEnrolled && !isFirstModule) {
            throw new AccessDeniedException("You must enroll in this course to view this resource.");
        }

        try {
            Path filePath = Paths.get(resourceEntity.getFilePath()).normalize();
            // Here, we use the fully qualified name for Spring's Resource to avoid conflict.
            org.springframework.core.io.Resource urlResource = new UrlResource(filePath.toUri());
            if (urlResource.exists()) {
                return urlResource;
            } else {
                throw new RuntimeException("File not found: " + resourceEntity.getFilePath());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File path error: " + resourceEntity.getFilePath(), ex);
        }
    }

    public Resource loadFileAsResource(Long resourceId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail).orElseThrow();
        // This refers to your own 'Resource' entity
        com.smartedu.learningpath.course.Resource resource = resourceRepository.findById(resourceId).orElseThrow();
        var course = resource.getModule().getCourse();

        // Security Check: Student must be enrolled in the course this resource belongs to.
        enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new AccessDeniedException("You are not enrolled in the course to download this resource."));

        try {
            Path filePath = Paths.get(resource.getFilePath()).normalize();
            // Here, we use the fully qualified name for Spring's Resource.
            org.springframework.core.io.Resource urlResource = new UrlResource(filePath.toUri());
            if (urlResource.exists()) {
                return urlResource;
            } else {
                throw new RuntimeException("File not found " + resource.getFilePath());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File path error", ex);
        }
    }
}