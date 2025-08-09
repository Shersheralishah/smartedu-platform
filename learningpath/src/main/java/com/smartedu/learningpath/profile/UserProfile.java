package com.smartedu.learningpath.profile;

import com.smartedu.learningpath.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bio;
    private String location;
    private String profileImage;
    private String headline;
    private String language;
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
