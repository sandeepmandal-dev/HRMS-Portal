package com.hrms.service;

import com.hrms.dto.request.DesignationRequest;
import com.hrms.dto.response.DesignationResponse;

import java.util.List;

public interface DesignationService {
    DesignationResponse create(DesignationRequest request);
    DesignationResponse update(Long id, DesignationRequest request);
    DesignationResponse getById(Long id);
    List<DesignationResponse> getAll();
    void delete(Long id);
}
