package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DesignationRequest(
        @NotBlank String title,
        @Size(max = 500) String description
) {}
