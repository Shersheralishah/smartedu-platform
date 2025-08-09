
package com.smartedu.learningpath.dto;

import java.math.BigDecimal;
import java.util.List;


public record CourseCreateRequest(
        String title,
        String description,
        BigDecimal price,
        BigDecimal discountPercentage,

        List<ModuleCreateRequest> modules
) {}

