package com.smartedu.learningpath.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileRequest {
    private String headline;
    private String biography;
    private String language;
    private String profileImage;
    private List<SocialLinkDto> socialLinks;

    private String firstName;
    private String lastName;
}
