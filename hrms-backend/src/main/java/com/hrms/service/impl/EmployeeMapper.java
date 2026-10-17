package com.hrms.service.impl;

import com.hrms.dto.response.DepartmentResponse;
import com.hrms.dto.response.DesignationResponse;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.Department;
import com.hrms.entity.Designation;
import com.hrms.entity.Employee;
import org.springframework.stereotype.Component;

/** Centralizes Employee -> EmployeeResponse mapping so every service produces an identical shape. */
@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee e) {
        Department dept = e.getDepartment();
        Designation desig = e.getDesignation();

        return EmployeeResponse.builder()
                .id(e.getId())
                .employeeCode(e.getEmployeeCode())
                .firstName(e.getFirstName())
                .lastName(e.getLastName())
                .email(e.getUser().getEmail())
                .phone(e.getPhone())
                .dateOfBirth(e.getDateOfBirth())
                .gender(e.getGender())
                .address(e.getAddress())
                .dateOfJoining(e.getDateOfJoining())
                .dateOfExit(e.getDateOfExit())
                .employmentStatus(e.getEmploymentStatus())
                .department(dept != null ? DepartmentResponse.builder()
                        .id(dept.getId()).name(dept.getName())
                        .description(dept.getDescription()).active(dept.isActive()).build() : null)
                .designation(desig != null ? DesignationResponse.builder()
                        .id(desig.getId()).title(desig.getTitle())
                        .description(desig.getDescription()).active(desig.isActive()).build() : null)
                .managerId(e.getManager() != null ? e.getManager().getId() : null)
                .managerName(e.getManager() != null ? e.getManager().getFullName() : null)
                .basicSalary(e.getBasicSalary())
                .profileImageUrl(e.getProfileImageUrl())
                .build();
    }
}
