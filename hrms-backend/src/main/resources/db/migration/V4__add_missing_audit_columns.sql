ALTER TABLE users            ADD COLUMN created_by VARCHAR(100);
ALTER TABLE users            ADD COLUMN updated_by VARCHAR(100);

ALTER TABLE attendance       ADD COLUMN created_by VARCHAR(100);
ALTER TABLE attendance       ADD COLUMN updated_by VARCHAR(100);

ALTER TABLE leave_balances   ADD COLUMN created_by VARCHAR(100);
ALTER TABLE leave_balances   ADD COLUMN updated_by VARCHAR(100);

ALTER TABLE leave_requests   ADD COLUMN created_by VARCHAR(100);
ALTER TABLE leave_requests   ADD COLUMN updated_by VARCHAR(100);

ALTER TABLE payrolls         ADD COLUMN created_by VARCHAR(100);
ALTER TABLE payrolls         ADD COLUMN updated_by VARCHAR(100);