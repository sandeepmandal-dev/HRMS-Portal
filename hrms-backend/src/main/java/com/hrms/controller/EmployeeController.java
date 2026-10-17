package com.hrms.controller;

import com.hrms.dto.request.RegisterEmployeeRequest;
import com.hrms.dto.request.UpdateEmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.enums.EmploymentStatus;
import com.hrms.service.EmployeeService;
import com.hrms.util.ApiResponse;
import com.hrms.util.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee directory, onboarding and profile management")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Onboard a new employee (creates login + HR profile)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(@Valid @RequestBody RegisterEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee onboarded successfully", employeeService.createEmployee(request)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user's own employee profile")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getMyProfile(principal.getUsername())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @Operation(summary = "Get an employee by internal id")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getById(id)));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @Operation(summary = "Get an employee by employee code (e.g. EMP00001)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getByEmployeeCode(code)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @Operation(summary = "Search/list employees with optional filters and pagination")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> search(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) EmploymentStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(employeeService.search(search, departmentId, status, pageable))));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Update an employee's profile/job details")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(@PathVariable Long id,
                                                                  @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", employeeService.update(id, request)));
    }

    @PutMapping("/me")
    @Operation(summary = "Update my own personal details (phone, address, etc.)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateMyProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Profile updated successfully", employeeService.updateMyProfile(principal.getUsername(), request)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Deactivate (offboard) an employee and disable their login")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        employeeService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated", null));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Reactivate a previously deactivated employee")
    public ResponseEntity<ApiResponse<Void>> reactivate(@PathVariable Long id) {
        employeeService.reactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Employee reactivated", null));
    }
}
