// ModuleDetailResponse.java
package com.smartedu.learningpath.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ModuleDetailResponse {
    private Long id;
    private String title;
    private int moduleOrder;
    private List<ResourceDetailResponse> resources;
}