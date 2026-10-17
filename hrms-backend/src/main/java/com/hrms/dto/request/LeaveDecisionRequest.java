package com.hrms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LeaveDecisionRequest(
        @NotBlank(message = "Decision must be APPROVED or REJECTED")
        String decision,

        @Size(max = 500)
        String comment
) {}
