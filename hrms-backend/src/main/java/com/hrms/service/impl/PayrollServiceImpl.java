package com.hrms.service.impl;

import com.hrms.dto.request.GeneratePayrollRequest;
import com.hrms.dto.response.PayrollResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.Payroll;
import com.hrms.entity.enums.AttendanceStatus;
import com.hrms.entity.enums.PayrollStatus;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.PayrollRepository;
import com.hrms.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    @Override
    @Transactional
    public PayrollResponse generate(GeneratePayrollRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", request.employeeId()));

        if (employee.getBasicSalary() == null) {
            throw new BadRequestException("Employee does not have a basic salary configured");
        }

        if (payrollRepository.existsByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(
                employee.getId(), request.payPeriodMonth(), request.payPeriodYear())) {
            throw new DuplicateResourceException(
                    "Payroll already generated for this employee for " + request.payPeriodMonth() + "/" + request.payPeriodYear());
        }

        YearMonth period = YearMonth.of(request.payPeriodYear(), request.payPeriodMonth());
        int totalDaysInMonth = period.lengthOfMonth();

        long presentDays = attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(
                        employee.getId(), period.atDay(1), period.atEndOfMonth(),
                        org.springframework.data.domain.Pageable.unpaged())
                .getContent()
                .stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.HALF_DAY)
                .count();

        // Pro-rate basic salary by attendance ratio; a real system would also factor in approved paid leave.
        BigDecimal payableDays = BigDecimal.valueOf(presentDays);
        BigDecimal proratedBasic = employee.getBasicSalary()
                .multiply(payableDays)
                .divide(BigDecimal.valueOf(totalDaysInMonth), 2, RoundingMode.HALF_UP);

        BigDecimal allowances = request.allowances() != null ? request.allowances() : BigDecimal.ZERO;
        BigDecimal deductions = request.deductions() != null ? request.deductions() : BigDecimal.ZERO;

        BigDecimal grossPay = proratedBasic.add(allowances);
        BigDecimal netPay = grossPay.subtract(deductions);

        if (netPay.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Deductions exceed gross pay; net pay cannot be negative");
        }

        Payroll payroll = Payroll.builder()
                .employee(employee)
                .payPeriodMonth(request.payPeriodMonth())
                .payPeriodYear(request.payPeriodYear())
                .basicSalary(proratedBasic)
                .allowances(allowances)
                .deductions(deductions)
                .grossPay(grossPay)
                .netPay(netPay)
                .payableDays(payableDays)
                .status(PayrollStatus.PROCESSED)
                .generatedAt(LocalDateTime.now())
                .build();

        return toResponse(payrollRepository.save(payroll));
    }

    @Override
    @Transactional
    public PayrollResponse markPaid(Long payrollId) {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payroll", payrollId));

        if (payroll.getStatus() == PayrollStatus.PAID) {
            throw new BadRequestException("This payroll has already been marked as paid");
        }
        if (payroll.getStatus() == PayrollStatus.CANCELLED) {
            throw new BadRequestException("Cannot mark a cancelled payroll as paid");
        }

        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaidAt(LocalDateTime.now());
        return toResponse(payrollRepository.save(payroll));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollResponse> getMyPayrolls(String currentUserEmail, Pageable pageable) {
        Employee employee = employeeRepository.findByUserEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
        return payrollRepository.findByEmployeeId(employee.getId(), pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollResponse> getEmployeePayrolls(Long employeeId, Pageable pageable) {
        return payrollRepository.findByEmployeeId(employeeId, pageable).map(this::toResponse);
    }

    private PayrollResponse toResponse(Payroll p) {
        return PayrollResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFullName())
                .payPeriodMonth(p.getPayPeriodMonth())
                .payPeriodYear(p.getPayPeriodYear())
                .basicSalary(p.getBasicSalary())
                .allowances(p.getAllowances())
                .deductions(p.getDeductions())
                .grossPay(p.getGrossPay())
                .netPay(p.getNetPay())
                .payableDays(p.getPayableDays())
                .status(p.getStatus())
                .generatedAt(p.getGeneratedAt())
                .paidAt(p.getPaidAt())
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public Page<PayrollResponse> getAllPayrolls(String search, Integer month, Integer year, PayrollStatus status, Pageable pageable) {
        return payrollRepository.searchAll(search, month, year, status, pageable).map(this::toResponse);
    }
}
