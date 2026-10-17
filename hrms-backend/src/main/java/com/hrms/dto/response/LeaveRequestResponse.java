package com.hrms.dto.response;

import com.hrms.entity.enums.LeaveStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long leaveTypeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal numberOfDays;
    private String reason;
    private LeaveStatus status;
    private Long approverId;
    private String approverName;
    private String approverComment;
    private LocalDateTime appliedAt;
    private LocalDateTime decidedAt;
}
