package com.hrms.repository;

import com.hrms.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    boolean existsByTitleIgnoreCase(String title);
}
