package com.hrms.service;

import com.hrms.dto.request.LeaveDecisionRequest;
import com.hrms.dto.request.LeaveRequestCreateRequest;
import com.hrms.dto.response.LeaveBalanceResponse;
import com.hrms.dto.response.LeaveRequestResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LeaveService {
    LeaveRequestResponse applyLeave(String currentUserEmail, LeaveRequestCreateRequest request);
    LeaveRequestResponse decide(Long leaveRequestId, String approverEmail, LeaveDecisionRequest request);
    LeaveRequestResponse cancel(Long leaveRequestId, String currentUserEmail);
    Page<LeaveRequestResponse> getMyLeaveRequests(String currentUserEmail, Pageable pageable);
    Page<LeaveRequestResponse> getPendingApprovals(String approverEmail, Pageable pageable);
    List<LeaveBalanceResponse> getMyLeaveBalance(String currentUserEmail, int year);
}
