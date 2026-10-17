package com.hrms.service.impl;

import com.hrms.dto.request.RegisterEmployeeRequest;
import com.hrms.dto.request.UpdateEmployeeRequest;
import com.hrms.dto.response.EmployeeResponse;
import com.hrms.entity.Department;
import com.hrms.entity.Designation;
import com.hrms.entity.Employee;
import com.hrms.entity.enums.EmploymentStatus;
import com.hrms.exception.ResourceNotFoundException;
import com.hrms.repository.DepartmentRepository;
import com.hrms.repository.DesignationRepository;
import com.hrms.repository.EmployeeRepository;
import com.hrms.service.AuthService;
import com.hrms.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final EmployeeMapper employeeMapper;
    private final AuthService authService;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(RegisterEmployeeRequest request) {
        // Onboarding creates both the login (User) and the HR profile (Employee) atomically.
        return authService.register(request);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return employeeMapper.toResponse(findEmployeeOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getByEmployeeCode(String code) {
        Employee employee = employeeRepository.findByEmployeeCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with code: " + code));
        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getMyProfile(String currentUserEmail) {
        Employee employee = employeeRepository.findByUserEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for current user"));
        return employeeMapper.toResponse(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeResponse> search(String search, Long departmentId, EmploymentStatus status, Pageable pageable) {
        return employeeRepository.search(search, departmentId, status, pageable)
                .map(employeeMapper::toResponse);
    }

    @Override
    @Transactional
    public EmployeeResponse update(Long id, UpdateEmployeeRequest request) {
        Employee employee = findEmployeeOrThrow(id);

        if (request.firstName() != null) employee.setFirstName(request.firstName());
        if (request.lastName() != null) employee.setLastName(request.lastName());
        if (request.phone() != null) employee.setPhone(request.phone());
        if (request.dateOfBirth() != null) employee.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null) employee.setGender(request.gender());
        if (request.address() != null) employee.setAddress(request.address());
        if (request.basicSalary() != null) employee.setBasicSalary(request.basicSalary());
        if (request.profileImageUrl() != null) employee.setProfileImageUrl(request.profileImageUrl());

        if (request.departmentId() != null) {
            Department department = departmentRepository.findById(request.departmentId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Department", request.departmentId()));
            employee.setDepartment(department);
        }

        if (request.designationId() != null) {
            Designation designation = designationRepository.findById(request.designationId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Designation", request.designationId()));
            employee.setDesignation(designation);
        }

        if (request.managerId() != null) {
            if (request.managerId().equals(id)) {
                throw new IllegalArgumentException("An employee cannot be their own manager");
            }
            Employee manager = employeeRepository.findById(request.managerId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Manager (Employee)", request.managerId()));
            employee.setManager(manager);
        }

        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Transactional
    public EmployeeResponse updateMyProfile(String currentUserEmail, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findByUserEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found"));

        if (request.firstName() != null) employee.setFirstName(request.firstName());
        if (request.lastName() != null) employee.setLastName(request.lastName());
        if (request.phone() != null) employee.setPhone(request.phone());
        if (request.dateOfBirth() != null) employee.setDateOfBirth(request.dateOfBirth());
        if (request.gender() != null) employee.setGender(request.gender());
        if (request.address() != null) employee.setAddress(request.address());
        // Deliberately NOT touching department, designation, manager, or basicSalary here —
        // those stay admin/HR-only via the existing PUT /employees/{id} endpoint.

        return employeeMapper.toResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        employee.setEmploymentStatus(EmploymentStatus.TERMINATED);
        employee.setDateOfExit(LocalDate.now());
        employee.getUser().setEnabled(false);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    public void reactivate(Long id) {
        Employee employee = findEmployeeOrThrow(id);
        employee.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee.setDateOfExit(null);
        employee.getUser().setEnabled(true);
        employeeRepository.save(employee);
    }

    private Employee findEmployeeOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Employee", id));
    }
}
