package com.smartedu.learningpath.auth;

import com.smartedu.learningpath.user.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private Role role; // STUDENT or INSTRUCTOR
}
