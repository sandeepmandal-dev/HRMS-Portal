package com.hrms.dto.response;

import com.hrms.entity.enums.PayrollStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private int payPeriodMonth;
    private int payPeriodYear;
    private BigDecimal basicSalary;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal grossPay;
    private BigDecimal netPay;
    private BigDecimal payableDays;
    private PayrollStatus status;
    private LocalDateTime generatedAt;
    private LocalDateTime paidAt;
}
