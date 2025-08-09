
package com.smartedu.learningpath.service;

import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public FileStorageService() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectory(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize root upload folder!", e);
        }
    }

    /**
     * Saves a file to a specific subfolder within a course's directory.
     * @param file The file to save.
     * @param courseId The ID of the course to create a folder for.
     * @param subfolder The name of the subfolder (e.g., "thumbnail", "resources").
     * @return The relative path to the saved file.
     */
    public String save(MultipartFile file, Long courseId, String subfolder) {
        try {
            // Create the main course directory (e.g., "uploads/1")
            Path courseDirectory = root.resolve(String.valueOf(courseId));
            if (!Files.exists(courseDirectory)) {
                Files.createDirectory(courseDirectory);
            }


            Path subDirectory = courseDirectory.resolve(subfolder);
            if (!Files.exists(subDirectory)) {
                Files.createDirectory(subDirectory);
            }

            // Generate a unique filename to prevent conflicts
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            // Resolve the final path and save the file
            Path destinationPath = subDirectory.resolve(filename);
            Files.copy(file.getInputStream(), destinationPath);

            // Return the relative path to be stored in the database
            return destinationPath.toString().replace("\\", "/");

        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }


    public void deleteCourseDirectory(Long courseId) {
        try {
            Path courseDirectory = root.resolve(String.valueOf(courseId));
            if (Files.exists(courseDirectory)) {
                // Use Spring's FileSystemUtils for a robust recursive delete.
                // This is safer and simpler than manual recursion.
                FileSystemUtils.deleteRecursively(courseDirectory);
            }
        } catch (IOException e) {

            System.err.println("Error deleting directory for course " + courseId + ": " + e.getMessage());
        }
    }
}