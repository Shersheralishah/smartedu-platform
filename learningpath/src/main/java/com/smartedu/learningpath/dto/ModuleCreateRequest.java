// ModuleCreateRequest.java
package com.smartedu.learningpath.dto;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

// Represents a module within the course creation request
public record ModuleCreateRequest(
        Long id,
        String title,
        List<ResourceCreateRequest> resources
) {}