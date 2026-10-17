package com.hrms.service;

import com.hrms.dto.request.DepartmentRequest;
import com.hrms.dto.response.DepartmentResponse;

import java.util.List;

public interface DepartmentService {
    DepartmentResponse create(DepartmentRequest request);
    DepartmentResponse update(Long id, DepartmentRequest request);
    DepartmentResponse getById(Long id);
    List<DepartmentResponse> getAll();
    void delete(Long id);
}
