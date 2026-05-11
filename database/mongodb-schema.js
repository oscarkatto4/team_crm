// ============================================
// TEAM WORK RECAP SYSTEM - MONGODB SCHEMA
// ============================================
// File: database/mongodb-schema.js
// Database: MongoDB
// Timezone: Asia/Jakarta (WIB)
// ============================================

// Users Collection
const usersSchema = {
  _id: "ObjectId",
  username: "String (unique, required)",
  passwordHash: "String (required)",
  displayName: "String (required)",
  role: "String (enum: operator, supervisor, superadmin)",
  isActive: "Boolean (default: true)",
  shiftId: "ObjectId (ref: attendance_shifts, optional)",
  createdAt: "Date",
  updatedAt: "Date"
};

// Work Entries Collection
const workEntriesSchema = {
  _id: "ObjectId",
  date: "String (YYYY-MM-DD)",
  operatorId: "ObjectId (ref: users)",
  operatorName: "String",
  taskId: "ObjectId (ref: tasks)",
  taskName: "String",
  projectId: "ObjectId (ref: projects)",
  projectName: "String",
  avatarId: "String (required, indexed)",
  proxyId: "ObjectId (ref: proxies)",
  proxyLabel: "String",
  rating: "String",
  locationId: "ObjectId (ref: locations)",
  locationName: "String",
  status: "String (enum: sukses, gagal, pending, proses)",
  description: "String",
  issue: "String",
  duplicateStatus: "String (enum: none, internal, external, both)",
  duplicateSources: [{
    source: "String",
    operator: "String",
    date: "String",
    project: "String",
    task: "String"
  }],
  checkingStatus: "String (enum: ok, suspend, logout, belum_dicek)",
  createdBy: "String",
  updatedBy: "String",
  createdAt: "Date",
  updatedAt: "Date"
};

// Projects Collection
const projectsSchema = {
  _id: "ObjectId",
  name: "String (required)",
  isActive: "Boolean (default: true)",
  createdAt: "Date",
  updatedAt: "Date"
};

// Tasks Collection
const tasksSchema = {
  _id: "ObjectId",
  name: "String (required)",
  isActive: "Boolean (default: true)",
  createdAt: "Date",
  updatedAt: "Date"
};

// Locations Collection
const locationsSchema = {
  _id: "ObjectId",
  projectId: "ObjectId (ref: projects, required, indexed)",
  name: "String (required)",
  isActive: "Boolean (default: true)",
  createdAt: "Date",
  updatedAt: "Date"
};

// Proxies Collection
const proxiesSchema = {
  _id: "ObjectId",
  label: "String (required)",
  isActive: "Boolean (default: true)",
  createdAt: "Date",
  updatedAt: "Date"
};

// Social Media Types Collection
const socialMediaTypesSchema = {
  _id: "ObjectId",
  name: "String (required)",
  isDefault: "Boolean (default: false)",
  isActive: "Boolean (default: true)"
};

// Checking Records Collection
const checkingRecordsSchema = {
  _id: "ObjectId",
  workEntryId: "ObjectId (ref: work_entries, indexed)",
  avatarId: "String (indexed)",
  operatorId: "ObjectId (ref: users)",
  operatorName: "String",
  socialChecks: "Object (key: socialMediaId, value: boolean)",
  checkingStatus: "String (enum: ok, suspend, logout, belum_dicek)",
  note: "String",
  checkedBy: "String",
  checkedAt: "Date",
  createdAt: "Date",
  updatedAt: "Date"
};

// External Sources Collection
const externalSourcesSchema = {
  _id: "ObjectId",
  sourceName: "String (required)",
  webAppUrl: "String (required)",
  sheetName: "String (default: Data)",
  type: "String (enum: export, import, both)",
  isActive: "Boolean (default: true)",
  createdBy: "String",
  createdAt: "Date",
  updatedAt: "Date"
};

// Backup Logs Collection
const backupLogsSchema = {
  _id: "ObjectId",
  type: "String (enum: work_data, gmail_inventory)",
  destinationUrl: "String",
  sheetName: "String",
  totalRows: "Number",
  status: "String (enum: success, failed)",
  errorMessage: "String (optional)",
  backupBy: "String",
  backupAt: "Date"
};

// Email Sources Collection
const emailSourcesSchema = {
  _id: "ObjectId",
  name: "String (required)",
  isDefault: "Boolean (default: false)",
  createdBy: "String",
  createdAt: "Date"
};

// Email Inventory Collection
const emailInventorySchema = {
  _id: "ObjectId",
  email: "String (required, indexed)",
  encryptedPassword: "String (required)",
  sourceId: "ObjectId (ref: email_sources, indexed)",
  sourceName: "String",
  pickupStatus: "String (enum: belum_diambil, sudah_diambil)",
  gmailCondition: "String (enum: aktif, suspend, verifikasi_nomor, tidak_bisa_login, belum_dicek, lainnya)",
  note: "String",
  lastEditedBy: "String",
  lastEditedAt: "Date",
  createdBy: "String",
  createdAt: "Date",
  updatedAt: "Date"
};

// Attendance Shifts Collection
const attendanceShiftsSchema = {
  _id: "ObjectId",
  name: "String (required)",
  startTime: "String (HH:mm)",
  endTime: "String (HH:mm)",
  operatorIds: ["ObjectId (ref: users)"],
  isActive: "Boolean (default: true)",
  createdAt: "Date",
  updatedAt: "Date"
};

// Attendance Records Collection
const attendanceRecordsSchema = {
  _id: "ObjectId",
  date: "String (YYYY-MM-DD, indexed)",
  operatorId: "ObjectId (ref: users, indexed)",
  operatorName: "String",
  shiftId: "ObjectId (ref: attendance_shifts)",
  shiftName: "String",
  firstLoginAt: "String (HH:mm)",
  lastLogoutAt: "String (HH:mm, optional)",
  finalCheckoutAt: "String (HH:mm, optional)",
  workDurationMinutes: "Number",
  status: "String (enum: hadir, terlambat, pulang_cepat, lewat_jam_kerja, tidak_ada_logout, pending_pulang)",
  warnings: ["String"],
  createdAt: "Date",
  updatedAt: "Date"
};

// App Settings Collection (singleton)
const appSettingsSchema = {
  _id: "ObjectId",
  appTitle: "String",
  appSubtitle: "String",
  logoUrl: "String",
  activeVersionId: "ObjectId (ref: version_updates)",
  updatedBy: "String",
  updatedAt: "Date"
};

// Version Updates Collection
const versionUpdatesSchema = {
  _id: "ObjectId",
  versionName: "String (required)",
  releaseDate: "Date",
  updateType: "String (enum: feature, bugfix, ui, security, database)",
  updateDetails: ["String"],
  isActive: "Boolean (default: false)",
  createdBy: "String",
  createdAt: "Date"
};

// Notifications Collection
const notificationsSchema = {
  _id: "ObjectId",
  targetRole: ["String (enum: operator, supervisor, superadmin)"],
  targetUserId: "ObjectId (ref: users, optional)",
  title: "String",
  message: "String",
  type: "String (enum: new_data, gmail_added, gmail_changed, duplicate, late_login, overtime, backup_success, backup_failed, export_success, export_failed)",
  isRead: "Boolean (default: false)",
  createdAt: "Date"
};

// Audit Logs Collection
const auditLogsSchema = {
  _id: "ObjectId",
  userId: "ObjectId (ref: users)",
  username: "String",
  action: "String (enum: login, logout, create, update, delete, export, backup, checking, gmail_status_change)",
  module: "String",
  details: "String",
  ipAddress: "String",
  createdAt: "Date (indexed)"
};

// ============================================
// INDEXES
// ============================================
/*
db.work_entries.createIndex({ avatarId: 1 });
db.work_entries.createIndex({ operatorId: 1 });
db.work_entries.createIndex({ date: -1 });
db.work_entries.createIndex({ projectId: 1 });
db.work_entries.createIndex({ checkingStatus: 1 });

db.checking_records.createIndex({ workEntryId: 1 });
db.checking_records.createIndex({ avatarId: 1 });

db.email_inventory.createIndex({ email: 1 });
db.email_inventory.createIndex({ sourceId: 1 });

db.attendance_records.createIndex({ date: 1, operatorId: 1 });

db.locations.createIndex({ projectId: 1 });

db.audit_logs.createIndex({ createdAt: -1 });
db.audit_logs.createIndex({ userId: 1 });
*/

module.exports = {
  usersSchema,
  workEntriesSchema,
  projectsSchema,
  tasksSchema,
  locationsSchema,
  proxiesSchema,
  socialMediaTypesSchema,
  checkingRecordsSchema,
  externalSourcesSchema,
  backupLogsSchema,
  emailSourcesSchema,
  emailInventorySchema,
  attendanceShiftsSchema,
  attendanceRecordsSchema,
  appSettingsSchema,
  versionUpdatesSchema,
  notificationsSchema,
  auditLogsSchema
};
