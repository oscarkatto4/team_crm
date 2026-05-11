import {
  LayoutDashboard, FileInput, FileText, Search, Mail, Clock, Users, FolderKanban,
  ListTodo, MapPin, Server, Settings, History, FileSpreadsheet, Download,
  Bell, LogOut, ChevronLeft, ChevronRight, Shield, Eye, Wrench, ClipboardCheck
} from 'lucide-react';
import type { User, Notification, AppSettings, VersionUpdate } from '../types';

interface Props {
  currentUser: User;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  notifications: Notification[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  appSettings: AppSettings;
  activeVersion: VersionUpdate | undefined;
  onShowVersion: () => void;
}

export default function Sidebar({
  currentUser, activePage, onNavigate, onLogout, notifications,
  collapsed, onToggleCollapse, appSettings, activeVersion, onShowVersion
}: Props) {
  const unreadCount = notifications.filter(n =>
    (n.targetRole.includes(currentUser.role) || n.targetUserId === currentUser.id) && !n.isRead
  ).length;

  const roleConfig = {
    superadmin: { label: 'Superadmin', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
    supervisor: { label: 'Supervisor', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    operator: { label: 'Operator', icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  };

  const rc = roleConfig[currentUser.role];

  // Menu items based on role
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'supervisor', 'operator'] },
    { id: 'input', label: 'Input Data', icon: FileInput, roles: ['superadmin', 'supervisor', 'operator'] },
    { id: 'rekap', label: 'Rekap Data', icon: FileText, roles: ['superadmin', 'supervisor', 'operator'] },
    { id: 'search', label: 'Search ID', icon: Search, roles: ['superadmin', 'supervisor', 'operator'] },
    { id: 'checking', label: 'Checking', icon: ClipboardCheck, roles: ['superadmin', 'supervisor'] },
    { id: 'gmail', label: 'Inventory Gmail', icon: Mail, roles: ['superadmin', 'supervisor', 'operator'] },
    { id: 'absensi', label: 'Absensi', icon: Clock, roles: ['superadmin', 'supervisor'] },
    { id: 'users', label: currentUser.role === 'supervisor' ? 'User Operator' : 'Manage User', icon: Users, roles: ['superadmin', 'supervisor'] },
    { id: 'projects', label: 'Manage Project', icon: FolderKanban, roles: ['superadmin'] },
    { id: 'tasks', label: 'Manage Tugas', icon: ListTodo, roles: ['superadmin'] },
    { id: 'locations', label: 'Manage Lokasi', icon: MapPin, roles: ['superadmin'] },
    { id: 'proxies', label: 'Manage Proxy', icon: Server, roles: ['superadmin'] },
    { id: 'spreadsheet', label: 'Spreadsheet Setup', icon: FileSpreadsheet, roles: ['superadmin', 'supervisor'] },
    { id: 'export', label: 'Export', icon: Download, roles: ['superadmin', 'supervisor'] },
    { id: 'app-settings', label: 'App Settings', icon: Settings, roles: ['superadmin'] },
    { id: 'versions', label: 'Version Updates', icon: History, roles: ['superadmin'] },
    { id: 'audit', label: 'Audit Log', icon: FileText, roles: ['superadmin'] },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, roles: ['superadmin', 'supervisor'], badge: unreadCount },
  ];

  const menuItems = allMenuItems.filter(m => m.roles.includes(currentUser.role));

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-700/50 flex flex-col h-full transition-all duration-300 shrink-0`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
              {appSettings.logoUrl ? (
                <img src={appSettings.logoUrl} alt="" className="w-6 h-6 object-contain" />
              ) : (
                <Shield className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-sm truncate">{appSettings.appTitle}</h2>
              <button
                onClick={onShowVersion}
                className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors"
              >
                {activeVersion?.versionName || 'v1.0'}
              </button>
            </div>
          </div>
        )}
        <button onClick={onToggleCollapse} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info */}
      <div className="p-3 border-b border-slate-700/50">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.displayName}</p>
              <div className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>
                <rc.icon className="w-3 h-3" />
                {rc.label}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => {
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all relative ${
                active
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
              {collapsed && item.badge ? (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
