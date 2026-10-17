-- =========================================================
-- V2: Attendance & Leave management
-- =========================================================

CREATE TABLE attendance (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time   TIMESTAMP,
    check_out_time  TIMESTAMP,
    status          VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    work_hours      NUMERIC(5,2),
    remarks         VARCHAR(255),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_attendance_employee_date UNIQUE (employee_id, attendance_date),
    CONSTRAINT chk_attendance_status CHECK (status IN ('PRESENT','ABSENT','HALF_DAY','ON_LEAVE','HOLIDAY','WEEKEND'))
);

CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);

CREATE TABLE leave_types (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(60) NOT NULL UNIQUE,
    description             VARCHAR(255),
    default_annual_quota    INTEGER NOT NULL DEFAULT 0,
    is_paid                 BOOLEAN NOT NULL DEFAULT TRUE,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE leave_balances (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id   BIGINT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year            INTEGER NOT NULL,
    allocated_days  NUMERIC(5,1) NOT NULL DEFAULT 0,
    used_days       NUMERIC(5,1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id       BIGINT NOT NULL REFERENCES leave_types(id),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    number_of_days      NUMERIC(5,1) NOT NULL,
    reason              VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approver_id         BIGINT REFERENCES employees(id),
    approver_comment    VARCHAR(500),
    applied_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at          TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id, year);

-- Seed common leave types
INSERT INTO leave_types (name, description, default_annual_quota, is_paid, is_active) VALUES
    ('Casual Leave', 'Short-notice personal leave', 12, TRUE, TRUE),
    ('Sick Leave', 'Medical/health-related leave', 10, TRUE, TRUE),
    ('Earned Leave', 'Accrued/annual vacation leave', 15, TRUE, TRUE),
    ('Unpaid Leave', 'Leave without pay', 0, FALSE, TRUE);
