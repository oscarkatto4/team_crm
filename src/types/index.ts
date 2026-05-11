// ============================================
// TEAM WORK RECAP SYSTEM - TYPE DEFINITIONS
// ============================================

export type UserRole = 'operator' | 'supervisor' | 'superadmin';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  shiftId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkEntry {
  id: string;
  date: string;
  operatorId: string;
  operatorName: string;
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  avatarId: string;
  proxyId: string;
  proxyLabel: string;
  rating: string;
  locationId: string;
  locationName: string;
  status: WorkStatus;
  description: string;
  issue: string;
  duplicateStatus: 'none' | 'internal' | 'external' | 'both';
  duplicateSources: DuplicateSource[];
  checkingStatus: CheckingStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkStatus = 'sukses' | 'gagal' | 'pending' | 'proses';
export type CheckingStatus = 'ok' | 'suspend' | 'logout' | 'belum_dicek';
export type GmailCondition = 'aktif' | 'suspend' | 'verifikasi_nomor' | 'tidak_bisa_login' | 'belum_dicek' | 'lainnya';
export type PickupStatus = 'belum_diambil' | 'sudah_diambil';

export interface DuplicateSource {
  source: string;
  operator: string;
  date: string;
  project: string;
  task: string;
}

export interface Project {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Proxy {
  id: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaType {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CheckingRecord {
  id: string;
  workEntryId: string;
  avatarId: string;
  operatorId: string;
  operatorName: string;
  socialChecks: Record<string, boolean>;
  checkingStatus: CheckingStatus;
  note: string;
  checkedBy: string;
  checkedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalSource {
  id: string;
  sourceName: string;
  webAppUrl: string;
  sheetName: string;
  type: 'export' | 'import' | 'both';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupLog {
  id: string;
  type: 'work_data' | 'gmail_inventory';
  destinationUrl: string;
  sheetName: string;
  totalRows: number;
  status: 'success' | 'failed';
  errorMessage?: string;
  backupBy: string;
  backupAt: string;
}

export interface EmailSource {
  id: string;
  name: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

export interface EmailInventory {
  id: string;
  email: string;
  encryptedPassword: string;
  sourceId: string;
  sourceName: string;
  pickupStatus: PickupStatus;
  gmailCondition: GmailCondition;
  note: string;
  lastEditedBy: string;
  lastEditedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  operatorIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'hadir' | 'terlambat' | 'pulang_cepat' | 'lewat_jam_kerja' | 'tidak_ada_logout' | 'pending_pulang';

export interface AttendanceRecord {
  id: string;
  date: string;
  operatorId: string;
  operatorName: string;
  shiftId: string;
  shiftName: string;
  firstLoginAt: string;
  lastLogoutAt?: string;
  finalCheckoutAt?: string;
  workDurationMinutes: number;
  status: AttendanceStatus;
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  id: string;
  appTitle: string;
  appSubtitle: string;
  logoUrl: string;
  activeVersionId: string;
  updatedBy: string;
  updatedAt: string;
}

export interface VersionUpdate {
  id: string;
  versionName: string;
  releaseDate: string;
  updateType: 'feature' | 'bugfix' | 'ui' | 'security' | 'database';
  updateDetails: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export type NotificationType = 'new_data' | 'gmail_added' | 'gmail_changed' | 'duplicate' | 'late_login' | 'overtime' | 'backup_success' | 'backup_failed' | 'export_success' | 'export_failed';

export interface Notification {
  id: string;
  targetRole: UserRole[];
  targetUserId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'backup' | 'checking' | 'gmail_status_change';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: AuditAction;
  module: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SheetConfig {
  webAppUrl: string;
  sheetName: string;
  sourceName?: string;
}
