package com.smartedu.learningpath.config;

import com.smartedu.learningpath.course.*;
import com.smartedu.learningpath.course.Module;
import com.smartedu.learningpath.user.Role;
import com.smartedu.learningpath.user.User;
import com.smartedu.learningpath.user.UserRepository;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class DataSeeder /*implements CommandLineRunner*/ {

//    private final UserRepository userRepository;
//    private final CourseRepository courseRepository;
//    private final EnrollmentRepository enrollmentRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    @Transactional
//    public void run(String... args) throws Exception {
//        enrollmentRepository.deleteAll();
//        courseRepository.deleteAll();
//        userRepository.deleteAll();
//        System.out.println("Cleared existing data. Seeding new initial data...");
//
//        Faker faker = new Faker(new Locale("en-IN"));
//
//        // ✅ DEFINITIVE FIX: These methods are now resilient and will not crash the application.
//        String placeholderThumbnailPath = createPlaceholderImage(faker);
//        String placeholderPdfPath = createPlaceholderPdf();
//
//        List<User> instructors = new ArrayList<>();
//        List<User> students = new ArrayList<>();
//
//        // --- Generate 10 Students ---
//        for (int i = 1; i <= 10; i++) {
//            String fullName = faker.name().fullName();
//            String email = "student." + fullName.toLowerCase().replaceAll("[^a-z0-9]", "") + i + "@example.com";
//            students.add(User.builder()
//                    .fullName(fullName)
//                    .email(email)
//                    .password(passwordEncoder.encode("password123"))
//                    .role(Role.STUDENT)
//                    .build());
//        }
//
//        // --- Generate 10 Instructors ---
//        for (int i = 1; i <= 10; i++) {
//            String fullName = faker.name().fullName();
//            String email = "instructor." + fullName.toLowerCase().replaceAll("[^a-z0-9]", "") + i + "@example.com";
//            User instructor = User.builder()
//                    .fullName(fullName)
//                    .email(email)
//                    .password(passwordEncoder.encode("password123"))
//                    .role(Role.INSTRUCTOR)
//                    .build();
//            instructors.add(instructor);
//        }
//
//        userRepository.saveAll(students);
//        userRepository.saveAll(instructors);
//        System.out.println("Successfully seeded " + (students.size() + instructors.size()) + " users.");
//
//        // --- Generate Fake Courses for each Instructor ---
//        List<Course> coursesToSave = new ArrayList<>();
//        for (User instructor : instructors) {
//            int numCourses = faker.number().numberBetween(1, 3);
//            for (int i = 0; i < numCourses; i++) {
//                String courseTitle = faker.educator().course();
//                Course course = Course.builder()
//                        .title(courseTitle)
//                        .description(faker.lorem().paragraphs(3).stream().collect(Collectors.joining("\n\n")))
//                        .price(new BigDecimal(faker.commerce().price(1000.00, 5000.00)))
//                        .discountPercentage(new BigDecimal(faker.number().numberBetween(10, 50)))
//                        .thumbnailPath(placeholderThumbnailPath.replace("{title}", java.net.URLEncoder.encode(courseTitle, "UTF-8"))) // Use the resilient path
//                        .instructor(instructor)
//                        .build();
//
//                List<Module> modules = new ArrayList<>();
//                int numModules = faker.number().numberBetween(3, 5);
//                for (int j = 1; j <= numModules; j++) {
//                    Module module = Module.builder()
//                            .title("Module " + j + ": " + faker.lorem().sentence(3))
//                            .moduleOrder(j)
//                            .course(course)
//                            .build();
//
//                    List<Resource> resources = new ArrayList<>();
//                    int numResources = faker.number().numberBetween(2, 4);
//                    for (int k = 1; k <= numResources; k++) {
//                        Resource.ResourceType type = Resource.ResourceType.values()[faker.number().numberBetween(1, 3)]; // Start from 1 to avoid PDF if placeholder is missing
//
//                        // ✅ DEFINITIVE FIX: Only create a PDF resource if the placeholder file was successfully created.
//                        if (type == Resource.ResourceType.PDF && placeholderPdfPath == null) {
//                            type = Resource.ResourceType.LINK; // Fallback to a LINK if PDF placeholder is missing
//                        }
//
//                        Resource resource = Resource.builder()
//                                .title(faker.lorem().sentence(4))
//                                .resourceType(type)
//                                .url(generateResourceUrl(type, faker))
//                                .filePath(type == Resource.ResourceType.PDF ? placeholderPdfPath : null)
//                                .estimatedTimeToCompleteMinutes(faker.number().numberBetween(5, 45))
//                                .module(module)
//                                .build();
//                        resources.add(resource);
//                    }
//                    module.setResources(resources);
//                    modules.add(module);
//                }
//                course.setModules(modules);
//                coursesToSave.add(course);
//            }
//        }
//
//        courseRepository.saveAll(coursesToSave);
//        System.out.println("Successfully seeded " + coursesToSave.size() + " fake courses.");
//    }
//
//    private String generateResourceUrl(Resource.ResourceType type, Faker faker) {
//        if (type == Resource.ResourceType.VIDEO) {
//            return "https://www.youtube.com/watch?v=" + faker.regexify("[a-zA-Z0-9_-]{11}");
//        }
//        if (type == Resource.ResourceType.LINK) {
//            return faker.internet().url();
//        }
//        return null;
//    }
//
//    // ✅ DEFINITIVE FIX: This method is now resilient and will not crash the application.
//    private String createPlaceholderImage(Faker faker) {
//        try {
//            Path uploadsDir = Paths.get("uploads");
//            Path imagePath = uploadsDir.resolve("placeholder.png");
//            if (!Files.exists(imagePath)) {
//                if (!Files.exists(uploadsDir)) {
//                    Files.createDirectories(uploadsDir);
//                }
//                try (InputStream in = getClass().getResourceAsStream("/placeholders/placeholder.png")) {
//                    if (in == null) throw new IOException("Placeholder image not found in resources. Will use online fallback.");
//                    Files.copy(in, imagePath, StandardCopyOption.REPLACE_EXISTING);
//                    System.out.println("Created placeholder image at: " + imagePath);
//                }
//            }
//            return imagePath.toString().replace("\\", "/");
//        } catch (IOException e) {
//            System.err.println("WARNING: " + e.getMessage());
//            System.err.println("Falling back to online placeholder images.");
//            // Return a URL from a placeholder service instead of a local path
//            return "https://placehold.co/600x400/1e293b/e2e8f0?text={title}";
//        }
//    }
//
//    // ✅ DEFINITIVE FIX: This method is now resilient and will not crash the application.
//    private String createPlaceholderPdf() {
//        try {
//            Path uploadsDir = Paths.get("uploads");
//            Path pdfPath = uploadsDir.resolve("placeholder.pdf");
//            if (!Files.exists(pdfPath)) {
//                if (!Files.exists(uploadsDir)) {
//                    Files.createDirectories(uploadsDir);
//                }
//                try (InputStream in = getClass().getResourceAsStream("/placeholders/placeholder.pdf")) {
//                    if (in == null) throw new IOException("Placeholder PDF not found in resources. PDF resources will not be seeded.");
//                    Files.copy(in, pdfPath, StandardCopyOption.REPLACE_EXISTING);
//                    System.out.println("Created placeholder PDF at: " + pdfPath);
//                }
//            }
//            return pdfPath.toString().replace("\\", "/");
//        } catch (IOException e) {
//            System.err.println("WARNING: " + e.getMessage());
//            return null; // Return null if the file cannot be created
//        }
//    }
}