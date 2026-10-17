package com.hrms.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record GeneratePayrollRequest(
        @NotNull Long employeeId,
        @Min(1) @Max(12) int payPeriodMonth,
        @Min(2000) int payPeriodYear,
        @PositiveOrZero BigDecimal allowances,
        @PositiveOrZero BigDecimal deductions
) {}
