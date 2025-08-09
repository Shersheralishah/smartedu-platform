package com.smartedu.learningpath.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    /**
     * This bean provides a central, detailed CORS configuration for the entire application.
     * It explicitly allows the frontend origin (http://localhost:5173) to make requests.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // IMPORTANT: Specify the exact origin of your frontend application.
        // Do not use "*" in a production environment for security reasons.
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        // Specify the allowed HTTP methods.
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Specify the allowed headers. "Authorization" is crucial for your JWT tokens.
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));

        // This is necessary to handle credentials like cookies or auth tokens.
        configuration.setAllowCredentials(true);

        // Set a max age for the preflight request to be cached by the browser.
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths in your API.
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
