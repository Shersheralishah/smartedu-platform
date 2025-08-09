package com.smartedu.learningpath.controller;

import com.smartedu.learningpath.service.ProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/proxy")
@RequiredArgsConstructor
public class ProxyController {

    private final ProxyService proxyService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> proxyRequest(@RequestParam String url) {
        String content = proxyService.getExternalContent(url);
        // Return the fetched content as raw HTML.
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(content);
    }
}
