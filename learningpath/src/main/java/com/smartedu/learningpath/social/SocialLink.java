    package com.smartedu.learningpath.social;

    import com.smartedu.learningpath.user.User;
    import jakarta.persistence.*;
    import lombok.*;

    @Entity
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class SocialLink {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String platform; // e.g., "LinkedIn", "GitHub" etc
        private String url;

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;
    }
