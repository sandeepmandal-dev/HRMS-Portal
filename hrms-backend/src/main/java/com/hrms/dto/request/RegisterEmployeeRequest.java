package com.hrms.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Used by Admin/HR to onboard a new employee - creates both the User (login) and Employee profile. */
public record RegisterEmployeeRequest(
        @NotBlank @Email
        String email,

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank
        String role, // ADMIN, HR, MANAGER, EMPLOYEE

        @NotBlank
        String firstName,

        @NotBlank
        String lastName,

        String phone,

        LocalDate dateOfBirth,

        String gender,

        String address,

        @NotNull
        LocalDate dateOfJoining,

        Long departmentId,

        Long designationId,

        Long managerId,

        @PositiveOrZero
        BigDecimal basicSalary
) {}
