package com.smartedu.learningpath.service;

import com.smartedu.learningpath.course.*;
import com.smartedu.learningpath.course.Module;
import com.smartedu.learningpath.dto.*;
import com.smartedu.learningpath.user.Role;
import com.smartedu.learningpath.user.User;
import com.smartedu.learningpath.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final EnrollmentRepository enrollmentRepository;

    @Transactional
    public Course createCourse(
            CourseCreateRequest request,
            MultipartFile thumbnail,
            List<MultipartFile> resourceFiles,
            String instructorEmail
    ) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        // Backend validation for discount
        if (request.discountPercentage() != null &&
                (request.discountPercentage().compareTo(BigDecimal.ZERO) < 0 ||
                        request.discountPercentage().compareTo(new BigDecimal("100")) > 0)) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100.");
        }

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .discountPercentage(request.discountPercentage())
                .instructor(instructor)
                .build();

        Course savedCourse = courseRepository.save(course);
        Long courseId = savedCourse.getId();

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailPath = fileStorageService.save(thumbnail, courseId, "thumbnail");
            savedCourse.setThumbnailPath(thumbnailPath);
        }

        List<Module> modules = new ArrayList<>();
        int resourceFileIndex = 0;

        for (int i = 0; i < request.modules().size(); i++) {
            var moduleRequest = request.modules().get(i);
            Module module = Module.builder()
                    .title(moduleRequest.title())
                    .moduleOrder(i + 1)
                    .course(savedCourse)
                    .build();

            List<Resource> resources = new ArrayList<>();
            for (var resourceRequest : moduleRequest.resources()) {
                Resource.ResourceType type = Resource.ResourceType.valueOf(resourceRequest.resourceType());
                String filePath = null;

                if (type == Resource.ResourceType.PDF) {
                    if (resourceFiles != null && resourceFileIndex < resourceFiles.size()) {
                        filePath = fileStorageService.save(resourceFiles.get(resourceFileIndex++), courseId, "resources");
                    }
                }

                Resource resource = Resource.builder()
                        .title(resourceRequest.title())
                        .resourceType(type)
                        .url(resourceRequest.url())
                        .filePath(filePath)
                        .estimatedTimeToCompleteMinutes(resourceRequest.estimatedTimeToCompleteMinutes())
                        .module(module)
                        .build();
                resources.add(resource);
            }
            module.setResources(resources);
            modules.add(module);
        }

        savedCourse.setModules(modules);
        return courseRepository.save(savedCourse);
    }



    public CourseAnalyticsResponse getCourseAnalytics(Long courseId, String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Security Check: Ensure the user requesting analytics is the course owner.
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new AccessDeniedException("You are not authorized to view analytics for this course.");
        }

        // Fetch all enrollments for this course.
        List<Enrollment> enrollments = enrollmentRepository.findAllByCourse(course);

        // Process data for the enrollment graph (group by date).
        Map<LocalDate, Long> dailyCounts = enrollments.stream()
                .collect(Collectors.groupingBy(
                        enrollment -> enrollment.getEnrollmentDate().toLocalDate(),
                        Collectors.counting()
                ));

        List<EnrollmentStatDTO> dailyStats = dailyCounts.entrySet().stream()
                .map(entry -> new EnrollmentStatDTO(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(EnrollmentStatDTO::getDate))
                .collect(Collectors.toList());

        // Process data for the student list.
        List<EnrolledStudentDTO> enrolledStudents = enrollments.stream()
                .map(enrollment -> EnrolledStudentDTO.builder()
                        .userId(enrollment.getStudent().getId())
                        .fullName(enrollment.getStudent().getFullName())
                        .email(enrollment.getStudent().getEmail())
                        .enrollmentDate(enrollment.getEnrollmentDate())
                        .build())
                .sorted(Comparator.comparing(EnrolledStudentDTO::getEnrollmentDate).reversed())
                .collect(Collectors.toList());

        // Build the final response object.
        return CourseAnalyticsResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalEnrollments(enrollments.size())
                .coursePrice(course.getPrice()) // ✅ DEFINITIVE FIX
                .courseDiscount(course.getDiscountPercentage()) // ✅ DEFINITIVE FIX
                .dailyEnrollments(dailyStats)
                .students(enrolledStudents)
                .build();
    }

    //Search ka logic after putting the method in repo
    public Page<CourseSummaryResponse> searchCourses(String query, int page, int size, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);

        if (user.getRole() == Role.INSTRUCTOR) {
            // ✅ DEFINITIVE FIX: Pass the Pageable object to the repository method.
            Page<Course> coursesPage = courseRepository.searchByInstructor(user, query, pageable);

            // Use the built-in .map() function of the Page object to convert the content.
            return coursesPage.map(course -> {
                int enrollmentCount = enrollmentRepository.countByCourse(course);
                return CourseSummaryResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .thumbnailPath(course.getThumbnailPath())
                        .price(course.getPrice())
                        .discountPercentage(course.getDiscountPercentage())
                        .instructorName(course.getInstructor().getFullName())
                        .createdAt(course.getCreatedAt())
                        .updatedAt(course.getUpdatedAt())
                        .moduleCount(course.getModules().size())
                        .enrollmentCount(enrollmentCount)
                        .isEnrolled(false)
                        .build();
            });

        } else { // User is a STUDENT
            Set<Long> enrolledCourseIds = enrollmentRepository.findAllByStudent(user).stream()
                    .map(enrollment -> enrollment.getCourse().getId())
                    .collect(Collectors.toSet());

            // ✅ DEFINITIVE FIX: Pass the Pageable object to the repository method.
            Page<Course> coursesPage = courseRepository.searchAllCourses(query, pageable);

            return coursesPage.map(course -> {
                int enrollmentCount = enrollmentRepository.countByCourse(course);
                return CourseSummaryResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .thumbnailPath(course.getThumbnailPath())
                        .price(course.getPrice())
                        .discountPercentage(course.getDiscountPercentage())
                        .instructorName(course.getInstructor().getFullName())
                        .createdAt(course.getCreatedAt())
                        .updatedAt(course.getUpdatedAt())
                        .moduleCount(course.getModules().size())
                        .enrollmentCount(enrollmentCount)
                        .isEnrolled(enrolledCourseIds.contains(course.getId()))
                        .build();
            });
        }
    }






    public Page<CourseSummaryResponse> findCoursesByInstructor(String instructorEmail, int page, int size) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Pageable pageable = PageRequest.of(page, size);


        Page<Course> coursesPage = courseRepository.findByInstructor(instructor, pageable);


        return coursesPage.map(course -> convertToSummaryDTO(course, false));
    }

    public List<CourseSummaryResponse> findAllCourses() {
        return courseRepository.findAll().stream()
                .map(course -> {

                    int enrollmentCount = enrollmentRepository.countByCourse(course);
                    return CourseSummaryResponse.builder()
                            .id(course.getId())
                            .title(course.getTitle())
                            .description(course.getDescription())
                            .thumbnailPath(course.getThumbnailPath())
                            .price(course.getPrice())
                            .discountPercentage(course.getDiscountPercentage())
                            .instructorName(course.getInstructor().getFullName())
                            .createdAt(course.getCreatedAt())
                            .updatedAt(course.getUpdatedAt())
                            .moduleCount(course.getModules().size())
                            .enrollmentCount(enrollmentCount)
                            // isEnrolled is context-dependent, so it's omitted here or defaulted
                            .isEnrolled(false)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public CourseDetailResponse findCourseDetailsById(Long courseId, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        boolean isEnrolled = enrollmentRepository.findByStudentAndCourse(user, course).isPresent();

        if (user.getRole() == Role.INSTRUCTOR && !course.getInstructor().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to view this course.");
        }

        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailPath(course.getThumbnailPath())
                .price(course.getPrice())
                .discountPercentage(course.getDiscountPercentage())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .isEnrolled(isEnrolled)
                .modules(course.getModules().stream()
                        .sorted(Comparator.comparing(Module::getModuleOrder))
                        .map(module -> {
                            boolean shouldShowContent = isEnrolled || user.getRole() == Role.INSTRUCTOR || module.getModuleOrder() == 1;
                            return ModuleDetailResponse.builder()
                                    .id(module.getId())
                                    .title(module.getTitle())
                                    .moduleOrder(module.getModuleOrder())
                                    .resources(shouldShowContent ? module.getResources().stream()
                                            .map(resource -> ResourceDetailResponse.builder()
                                                    .id(resource.getId())
                                                    .title(resource.getTitle())
                                                    .resourceType(resource.getResourceType().name())
                                                    .url(resource.getUrl())
                                                    .filePath(resource.getFilePath())
                                                    .estimatedTimeToCompleteMinutes(resource.getEstimatedTimeToCompleteMinutes())
                                                    .build())
                                            .collect(Collectors.toList()) : Collections.emptyList())
                                    .build();
                        })
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public EnrollmentResponse enrollStudentInCourse(Long courseId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (enrollmentRepository.findByStudentAndCourse(student, course).isPresent()) {
            throw new IllegalStateException("Student is already enrolled in this course.");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        return EnrollmentResponse.builder()
                .enrollmentId(savedEnrollment.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .enrollmentDate(savedEnrollment.getEnrollmentDate())
                .message("Successfully enrolled in course.")
                .build();
    }

    public List<CourseSummaryResponse> findEnrolledCoursesByStudent(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Enrollment> enrollments = enrollmentRepository.findAllByStudent(student);

        return enrollments.stream()
                .map(Enrollment::getCourse)
                .map(course -> CourseSummaryResponse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .description(course.getDescription())
                        .thumbnailPath(course.getThumbnailPath())
                        .price(course.getPrice())
                        .discountPercentage(course.getDiscountPercentage())
                        .instructorName(course.getInstructor().getFullName())
                        .createdAt(course.getCreatedAt())
                        .updatedAt(course.getUpdatedAt())
                        .isEnrolled(true)
                        .build())
                .collect(Collectors.toList());
    }

    public Page<CourseSummaryResponse> findAllCoursesForStudent(String studentEmail, int page, int size) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Pageable pageable = PageRequest.of(page, size);

        Set<Long> enrolledCourseIds = enrollmentRepository.findAllByStudent(student).stream()
                .map(enrollment -> enrollment.getCourse().getId())
                .collect(Collectors.toSet());

        // ✅ DEFINITIVE FIX: This now correctly fetches a paginated list from the repository.
        Page<Course> coursesPage = courseRepository.findAll(pageable);

        // Use the new helper method to convert the page content.
        return coursesPage.map(course -> convertToSummaryDTO(course, enrolledCourseIds.contains(course.getId())));
    }

    /**
     * A private helper method to convert a Course entity to a CourseSummaryResponse DTO.
     * This reduces code duplication and ensures all summary views are consistent.
     */
    private CourseSummaryResponse convertToSummaryDTO(Course course, boolean isEnrolled) {
        int enrollmentCount = enrollmentRepository.countByCourse(course);
        return CourseSummaryResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailPath(course.getThumbnailPath())
                .price(course.getPrice())
                .discountPercentage(course.getDiscountPercentage())
                .instructorName(course.getInstructor().getFullName())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .moduleCount(course.getModules().size())
                .enrollmentCount(enrollmentCount)
                .isEnrolled(isEnrolled)
                .build();
    }

    @Transactional
    public Course updateCourse(
            Long courseId,
            CourseCreateRequest request,
            MultipartFile thumbnail,
            List<MultipartFile> resourceFiles,
            String instructorEmail
    ) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new AccessDeniedException("You are not authorized to update this course.");
        }

        if (request.discountPercentage() != null &&
                (request.discountPercentage().compareTo(BigDecimal.ZERO) < 0 ||
                        request.discountPercentage().compareTo(new BigDecimal("100")) > 0)) {
            throw new IllegalArgumentException("Discount percentage must be between 0 and 100.");
        }

        Map<Long, String> existingFilePaths = course.getModules().stream()
                .flatMap(module -> module.getResources().stream())
                .filter(resource -> resource.getFilePath() != null)
                .collect(Collectors.toMap(Resource::getId, Resource::getFilePath));

        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setPrice(request.price());
        course.setDiscountPercentage(request.discountPercentage());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String newThumbnailPath = fileStorageService.save(thumbnail, courseId, "thumbnail");
            course.setThumbnailPath(newThumbnailPath);
        }

        course.getModules().clear();
        courseRepository.flush();

        List<Module> updatedModules = new ArrayList<>();
        int newFileIndex = 0;
        for (int i = 0; i < request.modules().size(); i++) {
            var moduleRequest = request.modules().get(i);
            Module module = new Module();
            module.setTitle(moduleRequest.title());
            module.setModuleOrder(i + 1);
            module.setCourse(course);

            List<Resource> updatedResources = new ArrayList<>();
            for (var resourceRequest : moduleRequest.resources()) {
                Resource resource = new Resource();
                resource.setTitle(resourceRequest.title());
                resource.setResourceType(Resource.ResourceType.valueOf(resourceRequest.resourceType()));
                resource.setUrl(resourceRequest.url());
                resource.setEstimatedTimeToCompleteMinutes(resourceRequest.estimatedTimeToCompleteMinutes());
                resource.setModule(module);

                if (resourceRequest.id() != null && existingFilePaths.containsKey(resourceRequest.id())) {
                    resource.setFilePath(existingFilePaths.get(resourceRequest.id()));
                } else if (resourceRequest.resourceType().equals("PDF")) {
                    if (resourceFiles != null && newFileIndex < resourceFiles.size()) {
                        String filePath = fileStorageService.save(resourceFiles.get(newFileIndex++), courseId, "resources");
                        resource.setFilePath(filePath);
                    }
                }
                updatedResources.add(resource);
            }
            module.setResources(updatedResources);
            updatedModules.add(module);
        }

        course.getModules().addAll(updatedModules);
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId, String instructorEmail) {
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this course.");
        }

        enrollmentRepository.deleteAllByCourse(course);
        fileStorageService.deleteCourseDirectory(courseId);
        courseRepository.delete(course);
    }
}