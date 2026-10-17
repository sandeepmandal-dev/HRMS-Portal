package com.hrms.service;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RefreshTokenRequest;
import com.hrms.dto.request.RegisterEmployeeRequest;
import com.hrms.dto.response.AuthResponse;
import com.hrms.dto.response.EmployeeResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);
    EmployeeResponse register(RegisterEmployeeRequest request);
}
