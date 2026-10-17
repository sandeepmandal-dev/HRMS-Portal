package com.hrms.dto.response;

import com.hrms.entity.enums.EmploymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Long id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private LocalDate dateOfJoining;
    private LocalDate dateOfExit;
    private EmploymentStatus employmentStatus;
    private DepartmentResponse department;
    private DesignationResponse designation;
    private Long managerId;
    private String managerName;
    private BigDecimal basicSalary;
    private String profileImageUrl;
}
