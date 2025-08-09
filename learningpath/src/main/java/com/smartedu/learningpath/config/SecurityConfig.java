    package com.smartedu.learningpath.config;

    import lombok.RequiredArgsConstructor;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.authentication.AuthenticationProvider;
    import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
    import org.springframework.security.config.http.SessionCreationPolicy;
    import org.springframework.security.web.SecurityFilterChain;
    import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
    import org.springframework.web.cors.CorsConfigurationSource;

    @Configuration
    @EnableWebSecurity
    @RequiredArgsConstructor
    @EnableMethodSecurity
    public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;
        private final CustomAuthEntryPoint customAuthEntryPoint;
        private final CorsConfigurationSource corsConfigurationSource;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .cors(cors -> cors.configurationSource(corsConfigurationSource))
                    .csrf(csrf -> csrf.disable())
                    .headers(headers -> headers
                            .frameOptions(frameOptions -> frameOptions.sameOrigin())
                    )
                    .exceptionHandling(ex -> ex
                            .authenticationEntryPoint(customAuthEntryPoint)
                    )
                    .authorizeHttpRequests(auth -> auth
                            // 1. Define all publicly accessible endpoints first.
                            .requestMatchers(
                                    "/api/auth/**",
                                    "/uploads/**",
                                    "/favicon.ico"
                            ).permitAll()

                            // 2. ✅ DEFINITIVE FIX: Secure all other API endpoints.
                            // This single, clear rule states that any other request to a URL
                            // starting with "/api/" MUST be authenticated. This is more robust
                            // and less error-prone than listing each protected path individually.
                            // It automatically covers /api/courses, /api/resources, /api/enrollments, etc.
                            .requestMatchers("/api/**").authenticated()

                            // 3. (Optional but good practice) Deny any other requests not matching the above.
                            .anyRequest().denyAll()
                    )
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    )
                    .authenticationProvider(authenticationProvider)
                    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }
    }
