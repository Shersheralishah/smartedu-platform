package com.smartedu.learningpath.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SocialLinkDto {
    private String platform;
    private String url;
}
