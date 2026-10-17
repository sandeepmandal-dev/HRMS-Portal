package com.hrms.service;

import com.hrms.dto.request.GeneratePayrollRequest;
import com.hrms.dto.response.PayrollResponse;
import com.hrms.entity.enums.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PayrollService {
    PayrollResponse generate(GeneratePayrollRequest request);
    PayrollResponse markPaid(Long payrollId);
    Page<PayrollResponse> getMyPayrolls(String currentUserEmail, Pageable pageable);
    Page<PayrollResponse> getEmployeePayrolls(Long employeeId, Pageable pageable);
    Page<PayrollResponse> getAllPayrolls(String search, Integer month, Integer year, PayrollStatus status, Pageable pageable);
}
