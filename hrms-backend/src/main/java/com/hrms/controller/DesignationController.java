package com.hrms.controller;

import com.hrms.dto.request.DesignationRequest;
import com.hrms.dto.response.DesignationResponse;
import com.hrms.service.DesignationService;
import com.hrms.util.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/designations")
@RequiredArgsConstructor
@Tag(name = "Designations")
public class DesignationController {

    private final DesignationService designationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<ApiResponse<DesignationResponse>> create(@Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(designationService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<ApiResponse<DesignationResponse>> update(@PathVariable Long id, @Valid @RequestBody DesignationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(designationService.update(id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DesignationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(designationService.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<DesignationResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(designationService.getAll()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        designationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Designation deactivated", null));
    }
}
