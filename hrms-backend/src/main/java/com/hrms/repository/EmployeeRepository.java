package com.hrms.repository;

import com.hrms.entity.Employee;
import com.hrms.entity.enums.EmploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUserId(Long userId);

    Optional<Employee> findByUserEmail(String email);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCode(String employeeCode);

    Page<Employee> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<Employee> findByManagerId(Long managerId, Pageable pageable);

    Page<Employee> findByEmploymentStatus(EmploymentStatus status, Pageable pageable);

    @Query("""
            select e from Employee e
            where (:search is null or lower(e.firstName) like lower(concat('%', cast(:search as string), '%'))
                   or lower(e.lastName) like lower(concat('%', cast(:search as string), '%'))
                   or lower(e.employeeCode) like lower(concat('%', cast(:search as string), '%')))
            and (:departmentId is null or e.department.id = :departmentId)
            and (:status is null or e.employmentStatus = :status)
            """)
    Page<Employee> search(@Param("search") String search,
                           @Param("departmentId") Long departmentId,
                           @Param("status") EmploymentStatus status,
                           Pageable pageable);

    long countByEmploymentStatus(EmploymentStatus status);
}
