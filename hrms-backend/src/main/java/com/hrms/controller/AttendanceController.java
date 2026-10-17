package com.hrms.controller;

import com.hrms.dto.request.CheckInOutRequest;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.service.AttendanceService;
import com.hrms.util.ApiResponse;
import com.hrms.util.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Daily check-in/check-out and attendance history")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    @Operation(summary = "Check in for today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@AuthenticationPrincipal UserDetails principal,
                                                                      @RequestBody(required = false) CheckInOutRequest request) {
        String remarks = request != null ? request.remarks() : null;
        return ResponseEntity.ok(
                ApiResponse.success("Checked in successfully", attendanceService.checkIn(principal.getUsername(), remarks)));
    }

    @PostMapping("/check-out")
    @Operation(summary = "Check out for today")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@AuthenticationPrincipal UserDetails principal,
                                                                       @RequestBody(required = false) CheckInOutRequest request) {
        String remarks = request != null ? request.remarks() : null;
        return ResponseEntity.ok(
                ApiResponse.success("Checked out successfully", attendanceService.checkOut(principal.getUsername(), remarks)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my attendance history within a date range")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceResponse>>> myAttendance(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(attendanceService.getMyAttendance(principal.getUsername(), from, to, pageable))));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR','MANAGER')")
    @Operation(summary = "Get an employee's attendance history (HR/Manager/Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceResponse>>> employeeAttendance(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.from(attendanceService.getEmployeeAttendance(employeeId, from, to, pageable))));
    }
}
