package com.hrms.service.impl;

import com.hrms.dto.response.AttendanceResponse;
import com.hrms.entity.Attendance;
import com.hrms.entity.Employee;
import com.hrms.entity.enums.AttendanceStatus;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public AttendanceResponse checkIn(String currentUserEmail, String remarks) {
        Employee employee = findEmployeeByEmail(currentUserEmail);
        LocalDate today = LocalDate.now();

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(employee.getId(), today)) {
            throw new BadRequestException("You have already checked in today");
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .attendanceDate(today)
                .checkInTime(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .remarks(remarks)
                .build();

        return toResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional
    public AttendanceResponse checkOut(String currentUserEmail, String remarks) {
        Employee employee = findEmployeeByEmail(currentUserEmail);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElseThrow(() -> new BadRequestException("You must check in before checking out"));

        if (attendance.getCheckOutTime() != null) {
            throw new BadRequestException("You have already checked out today");
        }

        LocalDateTime checkOutTime = LocalDateTime.now();
        attendance.setCheckOutTime(checkOutTime);

        BigDecimal hours = BigDecimal.valueOf(
                        Duration.between(attendance.getCheckInTime(), checkOutTime).toMinutes())
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        attendance.setWorkHours(hours);

        // Under 4 hours logged is treated as a half day for payroll/attendance reporting purposes.
        if (hours.compareTo(BigDecimal.valueOf(4)) < 0) {
            attendance.setStatus(AttendanceStatus.HALF_DAY);
        }

        if (remarks != null && !remarks.isBlank()) {
            attendance.setRemarks(remarks);
        }

        return toResponse(attendanceRepository.save(attendance));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getMyAttendance(String currentUserEmail, LocalDate from, LocalDate to, Pageable pageable) {
        Employee employee = findEmployeeByEmail(currentUserEmail);
        return getEmployeeAttendance(employee.getId(), from, to, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceResponse> getEmployeeAttendance(Long employeeId, LocalDate from, LocalDate to, Pageable pageable) {
        LocalDate effectiveFrom = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate effectiveTo = to != null ? to : LocalDate.now();

        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new BadRequestException("'from' date must not be after 'to' date");
        }

        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(employeeId, effectiveFrom, effectiveTo, pageable)
                .map(this::toResponse);
    }

    private Employee findEmployeeByEmail(String email) {
        return employeeRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
    }

    private AttendanceResponse toResponse(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .employeeId(a.getEmployee().getId())
                .employeeName(a.getEmployee().getFullName())
                .attendanceDate(a.getAttendanceDate())
                .checkInTime(a.getCheckInTime())
                .checkOutTime(a.getCheckOutTime())
                .status(a.getStatus())
                .workHours(a.getWorkHours())
                .remarks(a.getRemarks())
                .build();
    }
}
