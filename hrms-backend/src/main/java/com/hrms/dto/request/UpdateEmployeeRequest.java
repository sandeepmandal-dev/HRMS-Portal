package com.hrms.dto.request;

import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateEmployeeRequest(
        String firstName,
        String lastName,
        String phone,
        LocalDate dateOfBirth,
        String gender,
        String address,
        Long departmentId,
        Long designationId,
        Long managerId,
        @PositiveOrZero BigDecimal basicSalary,
        String profileImageUrl
) {}
