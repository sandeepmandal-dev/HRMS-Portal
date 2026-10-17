package com.hrms.service.impl;

import com.hrms.dto.request.LeaveDecisionRequest;
import com.hrms.dto.request.LeaveRequestCreateRequest;
import com.hrms.dto.response.LeaveBalanceResponse;
import com.hrms.dto.response.LeaveRequestResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.LeaveBalance;
import com.hrms.entity.LeaveRequest;
import com.hrms.entity.LeaveType;
import com.hrms.entity.enums.LeaveStatus;
import com.hrms.entity.enums.UserRole;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.InsufficientLeaveBalanceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.LeaveBalanceRepository;
import com.hrms.repository.LeaveRequestRepository;
import com.hrms.repository.LeaveTypeRepository;
import com.hrms.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public LeaveRequestResponse applyLeave(String currentUserEmail, LeaveRequestCreateRequest request) {
        Employee employee = findEmployeeByEmail(currentUserEmail);

        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
        if (request.startDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot apply for leave in the past");
        }

        LeaveType leaveType = leaveTypeRepository.findById(request.leaveTypeId())
                .orElseThrow(() -> ResourceNotFoundException.of("Leave type", request.leaveTypeId()));

        BigDecimal numberOfDays = BigDecimal.valueOf(
                ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1);

        // Prevent overlapping leave requests (any PENDING or APPROVED leave that intersects the requested range).
        boolean overlapping = leaveRequestRepository
                .existsByEmployeeIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        employee.getId(),
                        List.of(LeaveStatus.PENDING, LeaveStatus.APPROVED),
                        request.endDate(), request.startDate());
        if (overlapping) {
            throw new BadRequestException("You already have a pending or approved leave request overlapping these dates");
        }

        if (leaveType.isPaid()) {
            int year = request.startDate().getYear();
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveType.getId(), year)
                    .orElseGet(() -> createDefaultBalance(employee, leaveType, year));

            if (balance.getRemainingDays().compareTo(numberOfDays) < 0) {
                throw new InsufficientLeaveBalanceException(
                        "Insufficient leave balance. Available: " + balance.getRemainingDays()
                                + " day(s), requested: " + numberOfDays + " day(s)");
            }
        }

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .numberOfDays(numberOfDays)
                .reason(request.reason())
                .status(LeaveStatus.PENDING)
                .approver(employee.getManager())
                .appliedAt(LocalDateTime.now())
                .build();

        return toResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public LeaveRequestResponse decide(Long leaveRequestId, String approverEmail, LeaveDecisionRequest request) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> ResourceNotFoundException.of("Leave request", leaveRequestId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new BadRequestException("This leave request has already been " + leaveRequest.getStatus().name().toLowerCase());
        }

        LeaveStatus decision;
        try {
            decision = LeaveStatus.valueOf(request.decision().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }
        if (decision != LeaveStatus.APPROVED && decision != LeaveStatus.REJECTED) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        Employee approver = findEmployeeByEmail(approverEmail);

        leaveRequest.setStatus(decision);
        leaveRequest.setApprover(approver);
        leaveRequest.setApproverComment(request.comment());
        leaveRequest.setDecidedAt(LocalDateTime.now());

        if (decision == LeaveStatus.APPROVED && leaveRequest.getLeaveType().isPaid()) {
            int year = leaveRequest.getStartDate().getYear();
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(leaveRequest.getEmployee().getId(),
                            leaveRequest.getLeaveType().getId(), year)
                    .orElseGet(() -> createDefaultBalance(leaveRequest.getEmployee(), leaveRequest.getLeaveType(), year));

            balance.setUsedDays(balance.getUsedDays().add(leaveRequest.getNumberOfDays()));
            leaveBalanceRepository.save(balance);
        }

        return toResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional
    public LeaveRequestResponse cancel(Long leaveRequestId, String currentUserEmail) {
        Employee employee = findEmployeeByEmail(currentUserEmail);
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> ResourceNotFoundException.of("Leave request", leaveRequestId));

        if (!leaveRequest.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only cancel your own leave requests");
        }
        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new BadRequestException("This leave request is already cancelled");
        }

        // If it was already approved and consumed balance, credit the days back.
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED && leaveRequest.getLeaveType().isPaid()) {
            int year = leaveRequest.getStartDate().getYear();
            leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), leaveRequest.getLeaveType().getId(), year)
                    .ifPresent(balance -> {
                        balance.setUsedDays(balance.getUsedDays().subtract(leaveRequest.getNumberOfDays()));
                        leaveBalanceRepository.save(balance);
                    });
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequest.setDecidedAt(LocalDateTime.now());
        return toResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> getMyLeaveRequests(String currentUserEmail, Pageable pageable) {
        Employee employee = findEmployeeByEmail(currentUserEmail);
        return leaveRequestRepository.findByEmployeeId(employee.getId(), pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<LeaveRequestResponse> getPendingApprovals(String approverEmail, Pageable pageable) {
        Employee approver = findEmployeeByEmail(approverEmail);
        UserRole role = approver.getUser().getRole();

        if (role == UserRole.ADMIN || role == UserRole.HR) {
            // Staff roles see every pending request company-wide — including ones with
            // no manager assigned (e.g. a senior manager with nobody above them).
            return leaveRequestRepository.findByStatus(LeaveStatus.PENDING, pageable)
                    .map(this::toResponse);
        }

        // Managers only see requests specifically assigned to them (their direct reports).
        return leaveRequestRepository.findByApproverIdAndStatus(approver.getId(), LeaveStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> getMyLeaveBalance(String currentUserEmail, int year) {
        Employee employee = findEmployeeByEmail(currentUserEmail);

        // Ensure every active leave type has a visible (even if zeroed) balance row for the year.
        List<LeaveType> allTypes = leaveTypeRepository.findAll().stream().filter(LeaveType::isActive).toList();

        return allTypes.stream().map(type -> {
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(employee.getId(), type.getId(), year)
                    .orElseGet(() -> LeaveBalance.builder()
                            .employee(employee).leaveType(type).year(year)
                            .allocatedDays(BigDecimal.valueOf(type.getDefaultAnnualQuota()))
                            .usedDays(BigDecimal.ZERO)
                            .build());

            return LeaveBalanceResponse.builder()
                    .leaveTypeId(type.getId())
                    .leaveTypeName(type.getName())
                    .year(year)
                    .allocatedDays(balance.getAllocatedDays())
                    .usedDays(balance.getUsedDays())
                    .remainingDays(balance.getRemainingDays())
                    .build();
        }).toList();
    }

    private LeaveBalance createDefaultBalance(Employee employee, LeaveType leaveType, int year) {
        LeaveBalance balance = LeaveBalance.builder()
                .employee(employee)
                .leaveType(leaveType)
                .year(year)
                .allocatedDays(BigDecimal.valueOf(leaveType.getDefaultAnnualQuota()))
                .usedDays(BigDecimal.ZERO)
                .build();
        return leaveBalanceRepository.save(balance);
    }

    private Employee findEmployeeByEmail(String email) {
        return employeeRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
    }

    private LeaveRequestResponse toResponse(LeaveRequest lr) {
        return LeaveRequestResponse.builder()
                .id(lr.getId())
                .employeeId(lr.getEmployee().getId())
                .employeeName(lr.getEmployee().getFullName())
                .leaveTypeId(lr.getLeaveType().getId())
                .leaveTypeName(lr.getLeaveType().getName())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .numberOfDays(lr.getNumberOfDays())
                .reason(lr.getReason())
                .status(lr.getStatus())
                .approverId(lr.getApprover() != null ? lr.getApprover().getId() : null)
                .approverName(lr.getApprover() != null ? lr.getApprover().getFullName() : null)
                .approverComment(lr.getApproverComment())
                .appliedAt(lr.getAppliedAt())
                .decidedAt(lr.getDecidedAt())
                .build();
    }
}
