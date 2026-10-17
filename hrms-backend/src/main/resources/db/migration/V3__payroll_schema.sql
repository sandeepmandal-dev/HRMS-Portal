-- =========================================================
-- V3: Payroll
-- =========================================================

CREATE TABLE payrolls (
    id                  BIGSERIAL PRIMARY KEY,
    employee_id         BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_month    INTEGER NOT NULL,
    pay_period_year     INTEGER NOT NULL,
    basic_salary        NUMERIC(14,2) NOT NULL,
    allowances           NUMERIC(14,2) NOT NULL DEFAULT 0,
    deductions          NUMERIC(14,2) NOT NULL DEFAULT 0,
    gross_pay           NUMERIC(14,2) NOT NULL,
    net_pay             NUMERIC(14,2) NOT NULL,
    payable_days        NUMERIC(5,1) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    generated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at             TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_payroll_employee_period UNIQUE (employee_id, pay_period_month, pay_period_year),
    CONSTRAINT chk_payroll_status CHECK (status IN ('DRAFT','PROCESSED','PAID','CANCELLED')),
    CONSTRAINT chk_payroll_month CHECK (pay_period_month BETWEEN 1 AND 12)
);

CREATE INDEX idx_payrolls_employee ON payrolls(employee_id);
CREATE INDEX idx_payrolls_period ON payrolls(pay_period_year, pay_period_month);
