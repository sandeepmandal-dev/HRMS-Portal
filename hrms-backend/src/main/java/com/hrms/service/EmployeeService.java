package com.hrms.service;

import com.hrms.dto.request.RegisterEmployeeRequest;
import com.hrms.dto.request.UpdateEmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.enums.EmploymentStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    EmployeeResponse createEmployee(RegisterEmployeeRequest request);
    EmployeeResponse getById(Long id);
    EmployeeResponse getByEmployeeCode(String code);
    EmployeeResponse getMyProfile(String currentUserEmail);
    Page<EmployeeResponse> search(String search, Long departmentId, EmploymentStatus status, Pageable pageable);
    EmployeeResponse update(Long id, UpdateEmployeeRequest request);
    void deactivate(Long id);
    void reactivate(Long id);

    EmployeeResponse updateMyProfile(String username, @Valid UpdateEmployeeRequest request);
}
