-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_software_license ON software(license);
CREATE INDEX IF NOT EXISTS idx_software_owner ON software(owner_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
