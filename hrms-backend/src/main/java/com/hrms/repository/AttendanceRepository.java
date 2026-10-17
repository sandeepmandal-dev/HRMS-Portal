package com.hrms.repository;

import com.hrms.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    Page<Attendance> findByEmployeeIdAndAttendanceDateBetween(Long employeeId, LocalDate from, LocalDate to, Pageable pageable);

    List<Attendance> findByAttendanceDateAndEmployeeDepartmentId(LocalDate date, Long departmentId);

    boolean existsByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);
}
