package com.hrms.service;

import com.hrms.dto.response.AttendanceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AttendanceService {
    AttendanceResponse checkIn(String currentUserEmail, String remarks);
    AttendanceResponse checkOut(String currentUserEmail, String remarks);
    Page<AttendanceResponse> getMyAttendance(String currentUserEmail, LocalDate from, LocalDate to, Pageable pageable);
    Page<AttendanceResponse> getEmployeeAttendance(Long employeeId, LocalDate from, LocalDate to, Pageable pageable);
}
