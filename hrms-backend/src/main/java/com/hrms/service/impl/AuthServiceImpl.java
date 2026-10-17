package com.hrms.service.impl;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RefreshTokenRequest;
import com.hrms.dto.request.RegisterEmployeeRequest;
import com.hrms.dto.response.AuthResponse;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.Employee;
import com.hrms.entity.RefreshToken;
import com.hrms.entity.User;
import com.hrms.entity.Department;
import com.hrms.entity.Designation;
import com.hrms.entity.enums.EmploymentStatus;
import com.hrms.entity.enums.UserRole;
import com.hrms.exception.BadRequestException;
import com.hrms.exception.DuplicateResourceException;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.DesignationRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.repository.RefreshTokenRepository;
import com.hrms.repository.UserRepository;
import com.hrms.security.JwtService;
import com.hrms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmployeeMapper employeeMapper;

    @Value("${app.jwt.access-token-expiry-ms}")
    private long accessTokenExpiryMs;

    @Value("${app.jwt.refresh-token-expiry-ms}")
    private long refreshTokenExpiryMs;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Delegates credential checking to Spring Security's DaoAuthenticationProvider,
        // which throws BadCredentialsException / LockedException / DisabledException as appropriate.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginCount(0);
        userRepository.save(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new BadRequestException("Refresh token expired or revoked. Please log in again.");
        }

        User user = storedToken.getUser();

        // Rotate: revoke the used token and issue a brand-new pair (prevents replay).
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public EmployeeResponse register(RegisterEmployeeRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("A user with email " + request.email() + " already exists");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid role. Must be one of ADMIN, HR, MANAGER, EMPLOYEE");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Department department = null;
        if (request.departmentId() != null) {
            department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Department", request.departmentId()));
        }

        Designation designation = null;
        if (request.designationId() != null) {
            designation = designationRepository.findById(request.designationId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Designation", request.designationId()));
        }

        Employee manager = null;
        if (request.managerId() != null) {
            manager = employeeRepository.findById(request.managerId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Manager (Employee)", request.managerId()));
        }

        Employee employee = Employee.builder()
                .user(user)
                .employeeCode(generateEmployeeCode())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .dateOfBirth(request.dateOfBirth())
                .gender(request.gender())
                .address(request.address())
                .dateOfJoining(request.dateOfJoining())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .department(department)
                .designation(designation)
                .manager(manager)
                .basicSalary(request.basicSalary())
                .build();
        employee = employeeRepository.save(employee);

        return employeeMapper.toResponse(employee);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user, user.getId(), user.getRole().name());
        String refreshTokenValue = generateSecureRandomToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenValue)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpiryMs * 1_000_000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .expiresInMs(accessTokenExpiryMs)
                .build();
    }

    private String generateSecureRandomToken() {
        byte[] bytes = new byte[64];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateEmployeeCode() {
        long count = employeeRepository.count() + 1;
        return String.format("EMP%05d", count);
    }
}
