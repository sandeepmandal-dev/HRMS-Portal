package com.hrms.repository;

import com.hrms.entity.Payroll;
import com.hrms.entity.enums.PayrollStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Page<Payroll> findByEmployeeId(Long employeeId, Pageable pageable);
    Optional<Payroll> findByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(Long employeeId, int month, int year);
    Page<Payroll> findByPayPeriodMonthAndPayPeriodYear(int month, int year, Pageable pageable);
    boolean existsByEmployeeIdAndPayPeriodMonthAndPayPeriodYear(Long employeeId, int month, int year);

    @Query("""
        select p from Payroll p
        join p.employee e
        where (:search is null or lower(e.firstName) like lower(concat('%', cast(:search as string), '%'))
               or lower(e.lastName) like lower(concat('%', cast(:search as string), '%'))
               or lower(e.employeeCode) like lower(concat('%', cast(:search as string), '%')))
        and (:month is null or p.payPeriodMonth = :month)
        and (:year is null or p.payPeriodYear = :year)
        and (:status is null or p.status = :status)
        """)
    Page<Payroll> searchAll(@Param("search") String search,
                            @Param("month") Integer month,
                            @Param("year") Integer year,
                            @Param("status") PayrollStatus status,
                            Pageable pageable);
}
