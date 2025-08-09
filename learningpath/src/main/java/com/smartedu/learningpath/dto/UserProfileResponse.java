package com.smartedu.learningpath.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String role;
    private String headline;
    private String biography;
    private String language;
    private String profileImage;
    private List<SocialLinkDto> socialLinks;
}
