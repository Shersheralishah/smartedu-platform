package com.smartedu.learningpath.controller;

import com.smartedu.learningpath.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType; // ✅ IMPORT MediaType
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/{resourceId}/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> downloadResource(@PathVariable Long resourceId, Principal principal) {
        Resource file = resourceService.loadFileAsResource(resourceId, principal.getName());

        String headerValue = "attachment; filename=\"" + file.getFilename() + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .contentType(MediaType.APPLICATION_OCTET_STREAM) // Use a generic type for downloads
                .body(file);
    }

    /**
     * Serves a resource file for inline viewing (e.g., in an iframe).
     */
    @GetMapping("/{resourceId}/view")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> viewResource(@PathVariable Long resourceId, Principal principal) {
        Resource file = resourceService.loadFileForViewing(resourceId, principal.getName());

        String headerValue = "inline; filename=\"" + file.getFilename() + "\"";

        // ✅ DEFINITIVE FIX: Explicitly set the Content-Type to application/pdf
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}
