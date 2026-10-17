package com.hrms.controller;

import com.hrms.dto.request.GeneratePayrollRequest;
import com.hrms.dto.response.PayrollResponse;
import com.hrms.service.PayrollService;
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
@RequestMapping("/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payslip generation and payroll history")
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Generate a payslip for an employee for a given month/year based on attendance")
    public ResponseEntity<ApiResponse<PayrollResponse>> generate(@Valid @RequestBody GeneratePayrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payroll generated", payrollService.generate(request)));
    }

    @PatchMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Mark a processed payroll as paid (post-disbursement)")
    public ResponseEntity<ApiResponse<PayrollResponse>> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payroll marked as paid", payrollService.markPaid(id)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my payslip history")
    public ResponseEntity<ApiResponse<PageResponse<PayrollResponse>>> myPayrolls(
            @AuthenticationPrincipal UserDetails principal, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(payrollService.getMyPayrolls(principal.getUsername(), pageable))));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "Get an employee's payslip history")
    public ResponseEntity<ApiResponse<PageResponse<PayrollResponse>>> employeePayrolls(
            @PathVariable Long employeeId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(payrollService.getEmployeePayrolls(employeeId, pageable))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    @Operation(summary = "List/search payroll records across all employees")
    public ResponseEntity<ApiResponse<PageResponse<PayrollResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) com.hrms.entity.enums.PayrollStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(payrollService.getAllPayrolls(search, month, year, status, pageable))));
    }
}
