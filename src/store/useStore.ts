import { useState, useCallback, useEffect } from 'react';
import type {
  User, WorkEntry, Project, Task, Location, Proxy, SocialMediaType,
  CheckingRecord, ExternalSource, BackupLog, EmailSource, EmailInventory,
  AttendanceShift, AttendanceRecord, AppSettings, VersionUpdate,
  Notification, AuditLog, UserRole, CheckingStatus,
  GmailCondition, AuditAction, NotificationType, DuplicateSource
} from '../types';
import { generateId, getWIBDate, getWIBDateTime, getWIBTime, hashPassword, verifyPassword, encryptPassword } from '../utils/helpers';

// ============================================
// DEFAULT DATA
// ============================================

const defaultAppSettings: AppSettings = {
  id: 'app-settings',
  appTitle: 'Team Work Recap System',
  appSubtitle: 'Rekap Kerja Tim',
  logoUrl: '',
  activeVersionId: 'v1',
  updatedBy: 'system',
  updatedAt: new Date().toISOString(),
};

const defaultVersion: VersionUpdate = {
  id: 'v1',
  versionName: 'Alpha 1.0',
  releaseDate: new Date().toISOString(),
  updateType: 'feature',
  updateDetails: [
    'Initial release',
    'Login system dengan role-based access',
    'Input data kerja dengan batch Avatar ID',
    'Rekap data dengan filter dan search',
    'Duplicate checking internal & external',
    'Checking sosmed per Avatar ID',
    'Inventory Gmail/Email',
    'Absensi otomatis berbasis login',
    'Export Excel & Google Spreadsheet',
    'Notification system',
    'Audit log',
  ],
  isActive: true,
  createdBy: 'system',
  createdAt: new Date().toISOString(),
};

const defaultUsers: User[] = [
  {
    id: 'superadmin-001',
    username: 'superadmin',
    passwordHash: hashPassword('superadmin123'),
    displayName: 'Super Administrator',
    role: 'superadmin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'spv-001',
    username: 'spv-rina',
    passwordHash: hashPassword('spv123'),
    displayName: 'Rina Supervisor',
    role: 'supervisor',
    isActive: true,
    shiftId: 'shift-pagi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'op-001',
    username: 'op-gunawan',
    passwordHash: hashPassword('op123'),
    displayName: 'Gunawan',
    role: 'operator',
    isActive: true,
    shiftId: 'shift-pagi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'op-002',
    username: 'op-sandi',
    passwordHash: hashPassword('op123'),
    displayName: 'Sandi',
    role: 'operator',
    isActive: true,
    shiftId: 'shift-pagi',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'op-003',
    username: 'op-wow',
    passwordHash: hashPassword('op123'),
    displayName: 'Wow',
    role: 'operator',
    isActive: true,
    shiftId: 'shift-siang',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultProjects: Project[] = [
  { id: 'proj-arab', name: 'Arab Saudi', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'proj-german', name: 'German', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'proj-usa', name: 'USA', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const defaultTasks: Task[] = [
  { id: 'task-create', name: 'Create Avatar', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'task-warming', name: 'Warming', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'task-posting', name: 'Posting', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'task-engage', name: 'Engagement', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const defaultLocations: Location[] = [
  { id: 'loc-dubai', projectId: 'proj-arab', name: 'Dubai', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'loc-sharjah', projectId: 'proj-arab', name: 'Sharjah', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'loc-ajman', projectId: 'proj-arab', name: 'Ajman', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'loc-berlin', projectId: 'proj-german', name: 'Berlin', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'loc-hamburg', projectId: 'proj-german', name: 'Hamburg', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'loc-newyork', projectId: 'proj-usa', name: 'New York', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'loc-la', projectId: 'proj-usa', name: 'Los Angeles', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const defaultProxies: Proxy[] = [
  { id: 'proxy-1', label: 'Proxy A', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'proxy-2', label: 'Proxy B', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'proxy-3', label: 'Proxy C', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const defaultSocialMediaTypes: SocialMediaType[] = [
  { id: 'sm-x', name: 'X', isDefault: true, isActive: true },
  { id: 'sm-fb', name: 'FB', isDefault: true, isActive: true },
  { id: 'sm-ig', name: 'IG', isDefault: true, isActive: true },
  { id: 'sm-gmail', name: 'Gmail', isDefault: true, isActive: true },
];

const defaultEmailSources: EmailSource[] = [
  { id: 'src-dv', name: 'DV', isDefault: true, createdBy: 'system', createdAt: new Date().toISOString() },
  { id: 'src-nr', name: 'NR', isDefault: true, createdBy: 'system', createdAt: new Date().toISOString() },
];

const defaultShifts: AttendanceShift[] = [
  { id: 'shift-pagi', name: 'Shift Pagi', startTime: '08:00', endTime: '16:00', operatorIds: ['op-001', 'op-002', 'spv-001'], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'shift-siang', name: 'Shift Siang', startTime: '14:00', endTime: '22:00', operatorIds: ['op-003'], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'shift-malam', name: 'Shift Malam', startTime: '22:00', endTime: '06:00', operatorIds: [], isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// ============================================
// STORAGE HELPERS
// ============================================

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* empty */ }
  return defaultValue;
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================
// MAIN STORE
// ============================================

export function useStore() {
  // State
  const [appSettings, setAppSettings] = useState<AppSettings>(() => loadFromStorage('twrs_app_settings', defaultAppSettings));
  const [versions, setVersions] = useState<VersionUpdate[]>(() => loadFromStorage('twrs_versions', [defaultVersion]));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('twrs_users', defaultUsers));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('twrs_current_user', null));
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(() => loadFromStorage('twrs_work_entries', []));
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('twrs_projects', defaultProjects));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('twrs_tasks', defaultTasks));
  const [locations, setLocations] = useState<Location[]>(() => loadFromStorage('twrs_locations', defaultLocations));
  const [proxies, setProxies] = useState<Proxy[]>(() => loadFromStorage('twrs_proxies', defaultProxies));
  const [socialMediaTypes, setSocialMediaTypes] = useState<SocialMediaType[]>(() => loadFromStorage('twrs_social_media', defaultSocialMediaTypes));
  const [checkingRecords, setCheckingRecords] = useState<CheckingRecord[]>(() => loadFromStorage('twrs_checking', []));
  const [externalSources, setExternalSources] = useState<ExternalSource[]>(() => loadFromStorage('twrs_external_sources', []));
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>(() => loadFromStorage('twrs_backup_logs', []));
  const [emailSources, setEmailSources] = useState<EmailSource[]>(() => loadFromStorage('twrs_email_sources', defaultEmailSources));
  const [emailInventory, setEmailInventory] = useState<EmailInventory[]>(() => loadFromStorage('twrs_email_inventory', []));
  const [shifts, setShifts] = useState<AttendanceShift[]>(() => loadFromStorage('twrs_shifts', defaultShifts));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadFromStorage('twrs_attendance', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('twrs_notifications', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('twrs_audit_logs', []));

  // Persist to localStorage
  useEffect(() => { saveToStorage('twrs_app_settings', appSettings); }, [appSettings]);
  useEffect(() => { saveToStorage('twrs_versions', versions); }, [versions]);
  useEffect(() => { saveToStorage('twrs_users', users); }, [users]);
  useEffect(() => { saveToStorage('twrs_current_user', currentUser); }, [currentUser]);
  useEffect(() => { saveToStorage('twrs_work_entries', workEntries); }, [workEntries]);
  useEffect(() => { saveToStorage('twrs_projects', projects); }, [projects]);
  useEffect(() => { saveToStorage('twrs_tasks', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('twrs_locations', locations); }, [locations]);
  useEffect(() => { saveToStorage('twrs_proxies', proxies); }, [proxies]);
  useEffect(() => { saveToStorage('twrs_social_media', socialMediaTypes); }, [socialMediaTypes]);
  useEffect(() => { saveToStorage('twrs_checking', checkingRecords); }, [checkingRecords]);
  useEffect(() => { saveToStorage('twrs_external_sources', externalSources); }, [externalSources]);
  useEffect(() => { saveToStorage('twrs_backup_logs', backupLogs); }, [backupLogs]);
  useEffect(() => { saveToStorage('twrs_email_sources', emailSources); }, [emailSources]);
  useEffect(() => { saveToStorage('twrs_email_inventory', emailInventory); }, [emailInventory]);
  useEffect(() => { saveToStorage('twrs_shifts', shifts); }, [shifts]);
  useEffect(() => { saveToStorage('twrs_attendance', attendanceRecords); }, [attendanceRecords]);
  useEffect(() => { saveToStorage('twrs_notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('twrs_audit_logs', auditLogs); }, [auditLogs]);

  // ============================================
  // AUDIT LOG
  // ============================================
  const addAuditLog = useCallback((action: AuditAction, module: string, details: string) => {
    if (!currentUser) return;
    const log: AuditLog = {
      id: generateId(),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      module,
      details,
      ipAddress: 'localhost',
      createdAt: getWIBDateTime(),
    };
    setAuditLogs(prev => [log, ...prev]);
  }, [currentUser]);

  // ============================================
  // NOTIFICATIONS
  // ============================================
  const addNotification = useCallback((
    title: string, message: string, type: NotificationType,
    targetRole: UserRole[] = ['supervisor', 'superadmin'], targetUserId?: string
  ) => {
    const notif: Notification = {
      id: generateId(),
      targetRole,
      targetUserId,
      title,
      message,
      type,
      isRead: false,
      createdAt: getWIBDateTime(),
    };
    setNotifications(prev => [notif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => 
      (n.targetRole.includes(currentUser.role) || n.targetUserId === currentUser.id) 
        ? { ...n, isRead: true } : n
    ));
  }, [currentUser]);

  // ============================================
  // AUTH
  // ============================================
  const login = useCallback((username: string, password: string): { success: boolean; error?: string } => {
    const user = users.find(u => u.username === username && u.isActive);
    if (!user) {
      return { success: false, error: 'Username tidak ditemukan atau akun tidak aktif' };
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Password salah' };
    }
    setCurrentUser(user);
    
    // Record attendance login
    if (user.role !== 'superadmin') {
      const today = getWIBDate();
      const existingAtt = attendanceRecords.find(a => a.operatorId === user.id && a.date === today);
      const shift = shifts.find(s => s.operatorIds.includes(user.id));
      
      if (!existingAtt && shift) {
        const now = getWIBTime();
        const isLate = now > shift.startTime;
        const newAtt: AttendanceRecord = {
          id: generateId(),
          date: today,
          operatorId: user.id,
          operatorName: user.displayName,
          shiftId: shift.id,
          shiftName: shift.name,
          firstLoginAt: now,
          workDurationMinutes: 0,
          status: isLate ? 'terlambat' : 'hadir',
          warnings: isLate ? [`Login terlambat: ${now} (Shift mulai ${shift.startTime})`] : [],
          createdAt: getWIBDateTime(),
          updatedAt: getWIBDateTime(),
        };
        setAttendanceRecords(prev => [...prev, newAtt]);
        
        if (isLate) {
          addNotification(
            'Operator Terlambat',
            `${user.displayName} login terlambat pada ${now}`,
            'late_login'
          );
        }
      }
    }
    
    addAuditLog('login', 'auth', `User ${username} logged in`);
    return { success: true };
  }, [users, attendanceRecords, shifts, addAuditLog, addNotification]);

  const logout = useCallback(() => {
    if (currentUser && currentUser.role !== 'superadmin') {
      const today = getWIBDate();
      const att = attendanceRecords.find(a => a.operatorId === currentUser.id && a.date === today);
      if (att && !att.finalCheckoutAt) {
        const now = getWIBTime();
        setAttendanceRecords(prev => prev.map(a => 
          a.id === att.id ? { ...a, lastLogoutAt: now, updatedAt: getWIBDateTime() } : a
        ));
      }
    }
    addAuditLog('logout', 'auth', `User ${currentUser?.username} logged out`);
    setCurrentUser(null);
    localStorage.removeItem('twrs_current_user');
  }, [currentUser, attendanceRecords, addAuditLog]);

  // ============================================
  // USER MANAGEMENT
  // ============================================
  const addUser = useCallback((data: Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'> & { password: string }) => {
    const newUser: User = {
      id: generateId(),
      username: data.username,
      passwordHash: hashPassword(data.password),
      displayName: data.displayName,
      role: data.role,
      isActive: data.isActive,
      shiftId: data.shiftId,
      createdAt: getWIBDateTime(),
      updatedAt: getWIBDateTime(),
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('create', 'users', `Created user: ${data.username}`);
    return newUser;
  }, [addAuditLog]);

  const updateUser = useCallback((id: string, data: Partial<User> & { password?: string }) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...data, updatedAt: getWIBDateTime() };
        if (data.password) {
          updated.passwordHash = hashPassword(data.password);
        }
        delete (updated as any).password;
        return updated;
      }
      return u;
    }));
    addAuditLog('update', 'users', `Updated user ID: ${id}`);
  }, [addAuditLog]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog('delete', 'users', `Deleted user ID: ${id}`);
  }, [addAuditLog]);

  // ============================================
  // WORK ENTRIES
  // ============================================
  const checkDuplicates = useCallback((avatarId: string, excludeId?: string): DuplicateSource[] => {
    const sources: DuplicateSource[] = [];
    workEntries.forEach(entry => {
      if (entry.avatarId === avatarId && entry.id !== excludeId) {
        sources.push({
          source: 'Internal',
          operator: entry.operatorName,
          date: entry.date,
          project: entry.projectName,
          task: entry.taskName,
        });
      }
    });
    return sources;
  }, [workEntries]);

  const addWorkEntries = useCallback((entries: Omit<WorkEntry, 'id' | 'duplicateStatus' | 'duplicateSources' | 'checkingStatus' | 'createdAt' | 'updatedAt'>[]) => {
    const newEntries: WorkEntry[] = entries.map(entry => {
      const duplicates = checkDuplicates(entry.avatarId);
      return {
        ...entry,
        id: generateId(),
        duplicateStatus: duplicates.length > 0 ? 'internal' as const : 'none' as const,
        duplicateSources: duplicates,
        checkingStatus: 'belum_dicek' as CheckingStatus,
        createdAt: getWIBDateTime(),
        updatedAt: getWIBDateTime(),
      };
    });
    
    setWorkEntries(prev => [...prev, ...newEntries]);
    
    // Create checking records
    const newCheckingRecords: CheckingRecord[] = newEntries.map(entry => ({
      id: generateId(),
      workEntryId: entry.id,
      avatarId: entry.avatarId,
      operatorId: entry.operatorId,
      operatorName: entry.operatorName,
      socialChecks: Object.fromEntries(socialMediaTypes.filter(s => s.isActive).map(s => [s.id, false])),
      checkingStatus: 'belum_dicek',
      note: '',
      checkedBy: '',
      checkedAt: '',
      createdAt: getWIBDateTime(),
      updatedAt: getWIBDateTime(),
    }));
    setCheckingRecords(prev => [...prev, ...newCheckingRecords]);
    
    addAuditLog('create', 'work_entries', `Added ${newEntries.length} work entries`);
    addNotification('Data Baru', `${newEntries.length} data kerja baru perlu dicek`, 'new_data');
    
    return newEntries;
  }, [checkDuplicates, socialMediaTypes, addAuditLog, addNotification]);

  const updateWorkEntry = useCallback((id: string, data: Partial<WorkEntry>) => {
    setWorkEntries(prev => prev.map(e => 
      e.id === id ? { ...e, ...data, updatedAt: getWIBDateTime() } : e
    ));
    addAuditLog('update', 'work_entries', `Updated work entry ID: ${id}`);
  }, [addAuditLog]);

  const deleteWorkEntry = useCallback((id: string) => {
    setWorkEntries(prev => prev.filter(e => e.id !== id));
    setCheckingRecords(prev => prev.filter(c => c.workEntryId !== id));
    addAuditLog('delete', 'work_entries', `Deleted work entry ID: ${id}`);
  }, [addAuditLog]);

  // ============================================
  // PROJECTS, TASKS, LOCATIONS, PROXIES
  // ============================================
  const addProject = useCallback((name: string) => {
    const proj: Project = { id: generateId(), name, isActive: true, createdAt: getWIBDateTime(), updatedAt: getWIBDateTime() };
    setProjects(prev => [...prev, proj]);
    addAuditLog('create', 'projects', `Created project: ${name}`);
    return proj;
  }, [addAuditLog]);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: getWIBDateTime() } : p));
    addAuditLog('update', 'projects', `Updated project ID: ${id}`);
  }, [addAuditLog]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setLocations(prev => prev.filter(l => l.projectId !== id));
    addAuditLog('delete', 'projects', `Deleted project ID: ${id}`);
  }, [addAuditLog]);

  const addTask = useCallback((name: string) => {
    const task: Task = { id: generateId(), name, isActive: true, createdAt: getWIBDateTime(), updatedAt: getWIBDateTime() };
    setTasks(prev => [...prev, task]);
    addAuditLog('create', 'tasks', `Created task: ${name}`);
    return task;
  }, [addAuditLog]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data, updatedAt: getWIBDateTime() } : t));
    addAuditLog('update', 'tasks', `Updated task ID: ${id}`);
  }, [addAuditLog]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    addAuditLog('delete', 'tasks', `Deleted task ID: ${id}`);
  }, [addAuditLog]);

  const addLocations = useCallback((projectId: string, names: string[]) => {
    const newLocs = names.map(name => ({
      id: generateId(), projectId, name, isActive: true, createdAt: getWIBDateTime(), updatedAt: getWIBDateTime()
    }));
    setLocations(prev => [...prev, ...newLocs]);
    addAuditLog('create', 'locations', `Created ${names.length} locations for project ${projectId}`);
    return newLocs;
  }, [addAuditLog]);

  const updateLocation = useCallback((id: string, data: Partial<Location>) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data, updatedAt: getWIBDateTime() } : l));
  }, []);

  const deleteLocation = useCallback((id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  }, []);

  const addProxy = useCallback((label: string) => {
    const proxy: Proxy = { id: generateId(), label, isActive: true, createdAt: getWIBDateTime(), updatedAt: getWIBDateTime() };
    setProxies(prev => [...prev, proxy]);
    return proxy;
  }, []);

  const updateProxy = useCallback((id: string, data: Partial<Proxy>) => {
    setProxies(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: getWIBDateTime() } : p));
  }, []);

  const deleteProxy = useCallback((id: string) => {
    setProxies(prev => prev.filter(p => p.id !== id));
  }, []);

  // ============================================
  // CHECKING
  // ============================================
  const updateChecking = useCallback((id: string, data: Partial<CheckingRecord>) => {
    setCheckingRecords(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...data, updatedAt: getWIBDateTime() };
        if (data.checkingStatus && data.checkingStatus !== c.checkingStatus) {
          updated.checkedBy = currentUser?.displayName || '';
          updated.checkedAt = getWIBDateTime();
          // Update work entry checking status
          setWorkEntries(we => we.map(e => 
            e.id === c.workEntryId ? { ...e, checkingStatus: data.checkingStatus!, updatedAt: getWIBDateTime() } : e
          ));
        }
        return updated;
      }
      return c;
    }));
    addAuditLog('checking', 'checking', `Updated checking ID: ${id}`);
  }, [currentUser, addAuditLog]);

  // ============================================
  // SOCIAL MEDIA TYPES
  // ============================================
  const addSocialMediaType = useCallback((name: string) => {
    const sm: SocialMediaType = { id: generateId(), name, isDefault: false, isActive: true };
    setSocialMediaTypes(prev => [...prev, sm]);
    return sm;
  }, []);

  const deleteSocialMediaType = useCallback((id: string) => {
    setSocialMediaTypes(prev => prev.filter(s => s.id !== id));
  }, []);

  // ============================================
  // EXTERNAL SOURCES
  // ============================================
  const addExternalSource = useCallback((data: Omit<ExternalSource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const src: ExternalSource = { ...data, id: generateId(), createdAt: getWIBDateTime(), updatedAt: getWIBDateTime() };
    setExternalSources(prev => [...prev, src]);
    addAuditLog('create', 'external_sources', `Added external source: ${data.sourceName}`);
    return src;
  }, [addAuditLog]);

  const updateExternalSource = useCallback((id: string, data: Partial<ExternalSource>) => {
    setExternalSources(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: getWIBDateTime() } : s));
  }, []);

  const deleteExternalSource = useCallback((id: string) => {
    setExternalSources(prev => prev.filter(s => s.id !== id));
  }, []);

  // ============================================
  // EMAIL INVENTORY
  // ============================================
  const addEmailSource = useCallback((name: string) => {
    const src: EmailSource = { id: generateId(), name, isDefault: false, createdBy: currentUser?.username || '', createdAt: getWIBDateTime() };
    setEmailSources(prev => [...prev, src]);
    return src;
  }, [currentUser]);

  const addEmails = useCallback((emails: { email: string; password: string; sourceId: string; sourceName: string; condition?: GmailCondition }[]) => {
    const newEmails: EmailInventory[] = emails.map(e => ({
      id: generateId(),
      email: e.email,
      encryptedPassword: encryptPassword(e.password),
      sourceId: e.sourceId,
      sourceName: e.sourceName,
      pickupStatus: 'belum_diambil',
      gmailCondition: e.condition || 'belum_dicek',
      note: '',
      lastEditedBy: currentUser?.displayName || '',
      lastEditedAt: getWIBDateTime(),
      createdBy: currentUser?.displayName || '',
      createdAt: getWIBDateTime(),
      updatedAt: getWIBDateTime(),
    }));
    setEmailInventory(prev => [...prev, ...newEmails]);
    
    if (currentUser?.role === 'operator') {
      addNotification(
        'Gmail Baru Ditambahkan',
        `Ada ${emails.length} Gmail baru ditambahkan oleh ${currentUser.displayName}. Sumber: ${emails[0]?.sourceName || '-'}`,
        'gmail_added'
      );
    }
    
    addAuditLog('create', 'email_inventory', `Added ${emails.length} emails`);
    return newEmails;
  }, [currentUser, addAuditLog, addNotification]);

  const updateEmail = useCallback((id: string, data: Partial<EmailInventory>) => {
    const oldEmail = emailInventory.find(e => e.id === id);
    setEmailInventory(prev => prev.map(e => {
      if (e.id === id) {
        let note = e.note;
        if (data.note && data.note !== e.note) {
          const timestamp = getWIBDateTime();
          note = e.note ? `${e.note} || ${data.note} - ${timestamp} by ${currentUser?.displayName}` : `${data.note} - ${timestamp} by ${currentUser?.displayName}`;
        }
        return { ...e, ...data, note, lastEditedBy: currentUser?.displayName || '', lastEditedAt: getWIBDateTime(), updatedAt: getWIBDateTime() };
      }
      return e;
    }));
    
    if (oldEmail && (data.gmailCondition || data.pickupStatus)) {
      addNotification(
        'Status Gmail Diubah',
        `Gmail ${oldEmail.email} diubah oleh ${currentUser?.displayName}`,
        'gmail_changed'
      );
      addAuditLog('gmail_status_change', 'email_inventory', `Changed status for ${oldEmail.email}`);
    }
  }, [currentUser, emailInventory, addAuditLog, addNotification]);

  const deleteEmail = useCallback((id: string) => {
    setEmailInventory(prev => prev.filter(e => e.id !== id));
    addAuditLog('delete', 'email_inventory', `Deleted email ID: ${id}`);
  }, [addAuditLog]);

  // ============================================
  // SHIFTS & ATTENDANCE
  // ============================================
  const addShift = useCallback((data: Omit<AttendanceShift, 'id' | 'createdAt' | 'updatedAt'>) => {
    const shift: AttendanceShift = { ...data, id: generateId(), createdAt: getWIBDateTime(), updatedAt: getWIBDateTime() };
    setShifts(prev => [...prev, shift]);
    return shift;
  }, []);

  const updateShift = useCallback((id: string, data: Partial<AttendanceShift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: getWIBDateTime() } : s));
  }, []);

  const deleteShift = useCallback((id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  }, []);

  // ============================================
  // BACKUP & EXPORT
  // ============================================
  const addBackupLog = useCallback((log: Omit<BackupLog, 'id'>) => {
    const newLog: BackupLog = { ...log, id: generateId() };
    setBackupLogs(prev => [newLog, ...prev]);
    addAuditLog('backup', 'backup', `Backup ${log.status}: ${log.totalRows} rows`);
    addNotification(
      log.status === 'success' ? 'Backup Berhasil' : 'Backup Gagal',
      log.status === 'success' ? `${log.totalRows} data berhasil dibackup` : log.errorMessage || 'Terjadi kesalahan',
      log.status === 'success' ? 'backup_success' : 'backup_failed'
    );
    return newLog;
  }, [addAuditLog, addNotification]);

  const clearBackedUpEntries = useCallback((entryIds: string[]) => {
    setWorkEntries(prev => prev.filter(e => !entryIds.includes(e.id)));
    setCheckingRecords(prev => prev.filter(c => !entryIds.includes(c.workEntryId)));
  }, []);

  // ============================================
  // APP SETTINGS & VERSIONS
  // ============================================
  const updateAppSettings = useCallback((data: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...data, updatedBy: currentUser?.username || '', updatedAt: getWIBDateTime() }));
    addAuditLog('update', 'app_settings', 'Updated app settings');
  }, [currentUser, addAuditLog]);

  const addVersion = useCallback((data: Omit<VersionUpdate, 'id' | 'createdAt'>) => {
    const version: VersionUpdate = { ...data, id: generateId(), createdAt: getWIBDateTime() };
    setVersions(prev => {
      const updated = prev.map(v => ({ ...v, isActive: false }));
      return [version, ...updated];
    });
    if (data.isActive) {
      setAppSettings(prev => ({ ...prev, activeVersionId: version.id }));
    }
    return version;
  }, []);

  const getActiveVersion = useCallback(() => {
    return versions.find(v => v.id === appSettings.activeVersionId) || versions[0];
  }, [versions, appSettings]);

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    appSettings, versions, users, currentUser, workEntries, projects, tasks, locations,
    proxies, socialMediaTypes, checkingRecords, externalSources, backupLogs,
    emailSources, emailInventory, shifts, attendanceRecords, notifications, auditLogs,
    
    // Auth
    login, logout,
    
    // Users
    addUser, updateUser, deleteUser,
    
    // Work Entries
    addWorkEntries, updateWorkEntry, deleteWorkEntry, checkDuplicates,
    
    // Projects, Tasks, Locations, Proxies
    addProject, updateProject, deleteProject,
    addTask, updateTask, deleteTask,
    addLocations, updateLocation, deleteLocation,
    addProxy, updateProxy, deleteProxy,
    
    // Checking
    updateChecking,
    
    // Social Media Types
    addSocialMediaType, deleteSocialMediaType,
    
    // External Sources
    addExternalSource, updateExternalSource, deleteExternalSource,
    
    // Email Inventory
    addEmailSource, addEmails, updateEmail, deleteEmail,
    
    // Shifts & Attendance
    addShift, updateShift, deleteShift,
    
    // Backup
    addBackupLog, clearBackedUpEntries,
    
    // App Settings & Versions
    updateAppSettings, addVersion, getActiveVersion,
    
    // Notifications
    addNotification, markNotificationRead, markAllNotificationsRead,
    
    // Audit
    addAuditLog,
  };
}

export type StoreType = ReturnType<typeof useStore>;
