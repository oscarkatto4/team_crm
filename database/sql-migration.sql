-- ============================================
-- TEAM WORK RECAP SYSTEM - SQL MIGRATION
-- ============================================
-- Database: MySQL / PostgreSQL
-- Timezone: Asia/Jakarta (WIB)
-- ============================================

-- Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    role ENUM('operator', 'supervisor', 'superadmin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    shift_id VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Projects Table
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE locations (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id)
);

-- Proxies Table
CREATE TABLE proxies (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Social Media Types Table
CREATE TABLE social_media_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Work Entries Table
CREATE TABLE work_entries (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    operator_id VARCHAR(50) NOT NULL,
    operator_name VARCHAR(200) NOT NULL,
    task_id VARCHAR(50),
    task_name VARCHAR(200),
    project_id VARCHAR(50),
    project_name VARCHAR(200),
    avatar_id VARCHAR(100) NOT NULL,
    proxy_id VARCHAR(50),
    proxy_label VARCHAR(100),
    rating VARCHAR(50),
    location_id VARCHAR(50),
    location_name VARCHAR(200),
    status ENUM('sukses', 'gagal', 'pending', 'proses') NOT NULL,
    description TEXT,
    issue TEXT,
    duplicate_status ENUM('none', 'internal', 'external', 'both') DEFAULT 'none',
    duplicate_sources JSON,
    checking_status ENUM('ok', 'suspend', 'logout', 'belum_dicek') DEFAULT 'belum_dicek',
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (proxy_id) REFERENCES proxies(id),
    INDEX idx_avatar_id (avatar_id),
    INDEX idx_operator_id (operator_id),
    INDEX idx_date (date),
    INDEX idx_project_id (project_id),
    INDEX idx_checking_status (checking_status)
);

-- Checking Records Table
CREATE TABLE checking_records (
    id VARCHAR(50) PRIMARY KEY,
    work_entry_id VARCHAR(50) NOT NULL,
    avatar_id VARCHAR(100) NOT NULL,
    operator_id VARCHAR(50),
    operator_name VARCHAR(200),
    social_checks JSON,
    checking_status ENUM('ok', 'suspend', 'logout', 'belum_dicek') DEFAULT 'belum_dicek',
    note TEXT,
    checked_by VARCHAR(200),
    checked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (work_entry_id) REFERENCES work_entries(id) ON DELETE CASCADE,
    INDEX idx_work_entry_id (work_entry_id),
    INDEX idx_avatar_id (avatar_id)
);

-- External Sources Table
CREATE TABLE external_sources (
    id VARCHAR(50) PRIMARY KEY,
    source_name VARCHAR(200) NOT NULL,
    web_app_url TEXT NOT NULL,
    sheet_name VARCHAR(100) DEFAULT 'Data',
    type ENUM('export', 'import', 'both') DEFAULT 'both',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Backup Logs Table
CREATE TABLE backup_logs (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('work_data', 'gmail_inventory') NOT NULL,
    destination_url TEXT,
    sheet_name VARCHAR(100),
    total_rows INT,
    status ENUM('success', 'failed') NOT NULL,
    error_message TEXT,
    backup_by VARCHAR(100),
    backup_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Sources Table
CREATE TABLE email_sources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Inventory Table
CREATE TABLE email_inventory (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    encrypted_password TEXT NOT NULL,
    source_id VARCHAR(50),
    source_name VARCHAR(100),
    pickup_status ENUM('belum_diambil', 'sudah_diambil') DEFAULT 'belum_diambil',
    gmail_condition ENUM('aktif', 'suspend', 'verifikasi_nomor', 'tidak_bisa_login', 'belum_dicek', 'lainnya') DEFAULT 'belum_dicek',
    note TEXT,
    last_edited_by VARCHAR(200),
    last_edited_at TIMESTAMP NULL,
    created_by VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES email_sources(id),
    INDEX idx_email (email),
    INDEX idx_source_id (source_id)
);

-- Attendance Shifts Table
CREATE TABLE attendance_shifts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance Shift Users Table (Many-to-Many)
CREATE TABLE attendance_shift_users (
    shift_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (shift_id, user_id),
    FOREIGN KEY (shift_id) REFERENCES attendance_shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attendance Records Table
CREATE TABLE attendance_records (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    operator_id VARCHAR(50) NOT NULL,
    operator_name VARCHAR(200),
    shift_id VARCHAR(50),
    shift_name VARCHAR(100),
    first_login_at TIME,
    last_logout_at TIME,
    final_checkout_at TIME,
    work_duration_minutes INT DEFAULT 0,
    status ENUM('hadir', 'terlambat', 'pulang_cepat', 'lewat_jam_kerja', 'tidak_ada_logout', 'pending_pulang') DEFAULT 'hadir',
    warnings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES attendance_shifts(id),
    INDEX idx_date_operator (date, operator_id)
);

-- App Settings Table (Singleton)
CREATE TABLE app_settings (
    id VARCHAR(50) PRIMARY KEY,
    app_title VARCHAR(200) DEFAULT 'Team Work Recap System',
    app_subtitle VARCHAR(200) DEFAULT 'Rekap Kerja Tim',
    logo_url TEXT,
    active_version_id VARCHAR(50),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Version Updates Table
CREATE TABLE version_updates (
    id VARCHAR(50) PRIMARY KEY,
    version_name VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    update_type ENUM('feature', 'bugfix', 'ui', 'security', 'database') NOT NULL,
    update_details JSON,
    is_active BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    target_role JSON,
    target_user_id VARCHAR(50),
    title VARCHAR(200) NOT NULL,
    message TEXT,
    type ENUM('new_data', 'gmail_added', 'gmail_changed', 'duplicate', 'late_login', 'overtime', 'backup_success', 'backup_failed', 'export_success', 'export_failed') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(id)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    username VARCHAR(100),
    action ENUM('login', 'logout', 'create', 'update', 'delete', 'export', 'backup', 'checking', 'gmail_status_change') NOT NULL,
    module VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default superadmin
INSERT INTO users (id, username, password_hash, display_name, role, is_active)
VALUES ('superadmin-001', 'superadmin', 'SHA256_HASH_HERE', 'Super Administrator', 'superadmin', TRUE);

-- Insert default social media types
INSERT INTO social_media_types (id, name, is_default, is_active) VALUES
('sm-x', 'X', TRUE, TRUE),
('sm-fb', 'FB', TRUE, TRUE),
('sm-ig', 'IG', TRUE, TRUE),
('sm-gmail', 'Gmail', TRUE, TRUE);

-- Insert default email sources
INSERT INTO email_sources (id, name, is_default, created_by) VALUES
('src-dv', 'DV', TRUE, 'system'),
('src-nr', 'NR', TRUE, 'system');

-- Insert default app settings
INSERT INTO app_settings (id, app_title, app_subtitle, active_version_id, updated_by)
VALUES ('app-settings', 'Team Work Recap System', 'Rekap Kerja Tim', 'v1', 'system');

-- Insert default version
INSERT INTO version_updates (id, version_name, release_date, update_type, update_details, is_active, created_by)
VALUES ('v1', 'Alpha 1.0', CURRENT_DATE, 'feature', '["Initial release"]', TRUE, 'system');

-- Insert default shifts
INSERT INTO attendance_shifts (id, name, start_time, end_time, is_active) VALUES
('shift-pagi', 'Shift Pagi', '08:00:00', '16:00:00', TRUE),
('shift-siang', 'Shift Siang', '14:00:00', '22:00:00', TRUE),
('shift-malam', 'Shift Malam', '22:00:00', '06:00:00', TRUE);
