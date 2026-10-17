package com.hrms.controller;

import com.hrms.dto.request.LeaveDecisionRequest;
import com.hrms.dto.request.LeaveRequestCreateRequest;
import com.hrms.dto.response.LeaveBalanceResponse;
import com.hrms.dto.response.LeaveRequestResponse;
import com.hrms.service.LeaveService;
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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
@Tag(name = "Leave Management", description = "Apply, approve/reject, cancel, and track leave balances")
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    @Operation(summary = "Apply for leave")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> apply(@AuthenticationPrincipal UserDetails principal,
                                                                      @Valid @RequestBody LeaveRequestCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Leave request submitted", leaveService.applyLeave(principal.getUsername(), request)));
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @Operation(summary = "Approve or reject a pending leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> decide(@AuthenticationPrincipal UserDetails principal,
                                                                       @PathVariable Long id,
                                                                       @Valid @RequestBody LeaveDecisionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Decision recorded", leaveService.decide(id, principal.getUsername(), request)));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel my own leave request")
    public ResponseEntity<ApiResponse<LeaveRequestResponse>> cancel(@AuthenticationPrincipal UserDetails principal,
                                                                       @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Leave request cancelled", leaveService.cancel(id, principal.getUsername())));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my leave request history")
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> myLeaves(
            @AuthenticationPrincipal UserDetails principal, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(leaveService.getMyLeaveRequests(principal.getUsername(), pageable))));
    }

    @GetMapping("/pending-approvals")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @Operation(summary = "Get leave requests awaiting my approval (as manager)")
    public ResponseEntity<ApiResponse<PageResponse<LeaveRequestResponse>>> pendingApprovals(
            @AuthenticationPrincipal UserDetails principal, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(leaveService.getPendingApprovals(principal.getUsername(), pageable))));
    }

    @GetMapping("/balance")
    @Operation(summary = "Get my leave balance for a given year (defaults to current year)")
    public ResponseEntity<ApiResponse<List<LeaveBalanceResponse>>> myBalance(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) Integer year) {
        int effectiveYear = year != null ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.success(leaveService.getMyLeaveBalance(principal.getUsername(), effectiveYear)));
    }
}
