package com.hrms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "leave_types")
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "default_annual_quota", nullable = false)
    private int defaultAnnualQuota;

    @Column(name = "is_paid", nullable = false)
    @Builder.Default
    private boolean paid = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
