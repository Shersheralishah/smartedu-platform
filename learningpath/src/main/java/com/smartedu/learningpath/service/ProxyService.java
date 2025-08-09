package com.smartedu.learningpath.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ProxyService {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Fetches the raw HTML content from a given URL.
     * @param url The URL of the external website to fetch.
     * @return The HTML content as a String.
     */
    public String getExternalContent(String url) {
        try {
            // Make a GET request to the external URL and return the body as a string.
            return restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            // In case of an error, return a user-friendly error message to be displayed in the iframe.
            return "<html><body><h2>Could not load content</h2><p>The requested URL could not be reached or does not allow proxying.</p></body></html>";
        }
    }
}
