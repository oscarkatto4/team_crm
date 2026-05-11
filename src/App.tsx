import { useState } from 'react';
import { useStore } from './store/useStore';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InputData from './components/InputData';
import RekapData from './components/RekapData';
import SearchPage from './components/SearchPage';
import CheckingPage from './components/CheckingPage';
import GmailInventory from './components/GmailInventory';
import AbsensiPage from './components/AbsensiPage';
import UserManagement from './components/UserManagement';
import ManageProject from './components/ManageProject';
import ManageTugas from './components/ManageTugas';
import ManageLokasi from './components/ManageLokasi';
import ManageProxy from './components/ManageProxy';
import SpreadsheetSetup from './components/SpreadsheetSetup';
import ExportPage from './components/ExportPage';
import AppSettingsPage from './components/AppSettingsPage';
import VersionsPage from './components/VersionsPage';
import AuditLogPage from './components/AuditLogPage';
import NotificationsPage from './components/NotificationsPage';
import VersionModal from './components/VersionModal';
import { Bell, Menu, X } from 'lucide-react';

export default function App() {
  const store = useStore();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const activeVersion = store.getActiveVersion();

  if (!store.currentUser) {
    return (
      <LoginPage
        onLogin={store.login}
        appSettings={store.appSettings}
        versionName={activeVersion?.versionName || 'v1.0'}
      />
    );
  }

  const unreadCount = store.notifications.filter(n =>
    (n.targetRole.includes(store.currentUser!.role) || n.targetUserId === store.currentUser!.id) && !n.isRead
  ).length;

  const navigate = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const renderPage = () => {
    const user = store.currentUser!;
    
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            currentUser={user}
            users={store.users}
            workEntries={store.workEntries}
            checkingRecords={store.checkingRecords}
            onNavigate={navigate}
          />
        );
      case 'input':
        return (
          <InputData
            currentUser={user}
            projects={store.projects}
            tasks={store.tasks}
            locations={store.locations}
            proxies={store.proxies}
            onAddEntries={store.addWorkEntries}
            checkDuplicates={store.checkDuplicates}
          />
        );
      case 'rekap':
        return (
          <RekapData
            currentUser={user}
            users={store.users}
            workEntries={store.workEntries}
            projects={store.projects}
            tasks={store.tasks}
            locations={store.locations}
            proxies={store.proxies}
            onUpdateEntry={store.updateWorkEntry}
            onDeleteEntry={store.deleteWorkEntry}
          />
        );
      case 'search':
        return (
          <SearchPage
            currentUser={user}
            workEntries={store.workEntries}
            externalSources={store.externalSources}
          />
        );
      case 'checking':
        if (user.role === 'operator') return null;
        return (
          <CheckingPage
            currentUser={user}
            checkingRecords={store.checkingRecords}
            socialMediaTypes={store.socialMediaTypes}
            onUpdateChecking={store.updateChecking}
            onAddSocialMedia={store.addSocialMediaType}
            onDeleteSocialMedia={store.deleteSocialMediaType}
          />
        );
      case 'gmail':
        return (
          <GmailInventory
            currentUser={user}
            emailInventory={store.emailInventory}
            emailSources={store.emailSources}
            onAddEmails={store.addEmails}
            onUpdateEmail={store.updateEmail}
            onDeleteEmail={store.deleteEmail}
            onAddSource={store.addEmailSource}
          />
        );
      case 'absensi':
        if (user.role === 'operator') return null;
        return (
          <AbsensiPage
            currentUser={user}
            users={store.users}
            shifts={store.shifts}
            attendanceRecords={store.attendanceRecords}
            onAddShift={store.addShift}
            onUpdateShift={store.updateShift}
            onDeleteShift={store.deleteShift}
          />
        );
      case 'users':
        if (user.role === 'operator') return null;
        return (
          <UserManagement
            currentUser={user}
            users={store.users}
            shifts={store.shifts}
            onAddUser={store.addUser}
            onUpdateUser={store.updateUser}
            onDeleteUser={store.deleteUser}
          />
        );
      case 'projects':
        if (user.role !== 'superadmin') return null;
        return (
          <ManageProject
            projects={store.projects}
            onAdd={store.addProject}
            onUpdate={store.updateProject}
            onDelete={store.deleteProject}
          />
        );
      case 'tasks':
        if (user.role !== 'superadmin') return null;
        return (
          <ManageTugas
            tasks={store.tasks}
            onAdd={store.addTask}
            onUpdate={store.updateTask}
            onDelete={store.deleteTask}
          />
        );
      case 'locations':
        if (user.role !== 'superadmin') return null;
        return (
          <ManageLokasi
            projects={store.projects}
            locations={store.locations}
            onAdd={store.addLocations}
            onUpdate={store.updateLocation}
            onDelete={store.deleteLocation}
          />
        );
      case 'proxies':
        if (user.role !== 'superadmin') return null;
        return (
          <ManageProxy
            proxies={store.proxies}
            onAdd={store.addProxy}
            onUpdate={store.updateProxy}
            onDelete={store.deleteProxy}
          />
        );
      case 'spreadsheet':
        if (user.role === 'operator') return null;
        return (
          <SpreadsheetSetup
            externalSources={store.externalSources}
            onAdd={store.addExternalSource}
            onUpdate={store.updateExternalSource}
            onDelete={store.deleteExternalSource}
            currentUser={user}
          />
        );
      case 'export':
        if (user.role === 'operator') return null;
        return (
          <ExportPage
            currentUser={user}
            workEntries={store.workEntries}
            checkingRecords={store.checkingRecords}
            externalSources={store.externalSources}
            onAddBackupLog={store.addBackupLog}
            onClearEntries={store.clearBackedUpEntries}
          />
        );
      case 'app-settings':
        if (user.role !== 'superadmin') return null;
        return (
          <AppSettingsPage
            appSettings={store.appSettings}
            onUpdate={store.updateAppSettings}
          />
        );
      case 'versions':
        if (user.role !== 'superadmin') return null;
        return (
          <VersionsPage
            versions={store.versions}
            currentUser={user}
            onAddVersion={store.addVersion}
          />
        );
      case 'audit':
        if (user.role !== 'superadmin') return null;
        return <AuditLogPage auditLogs={store.auditLogs} />;
      case 'notifications':
        return (
          <NotificationsPage
            currentUser={user}
            notifications={store.notifications}
            onMarkRead={store.markNotificationRead}
            onMarkAllRead={store.markAllNotificationsRead}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <Sidebar
          currentUser={store.currentUser}
          activePage={activePage}
          onNavigate={navigate}
          onLogout={store.logout}
          notifications={store.notifications}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          appSettings={store.appSettings}
          activeVersion={activeVersion}
          onShowVersion={() => setShowVersionModal(true)}
        />
      </div>

      {/* Sidebar - mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar
          currentUser={store.currentUser}
          activePage={activePage}
          onNavigate={navigate}
          onLogout={store.logout}
          notifications={store.notifications}
          collapsed={false}
          onToggleCollapse={() => setMobileMenuOpen(false)}
          appSettings={store.appSettings}
          activeVersion={activeVersion}
          onShowVersion={() => setShowVersionModal(true)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900/80 border-b border-slate-700/50 flex items-center justify-between px-4 shrink-0 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-semibold text-white capitalize">
              {activePage === 'input' ? 'Input Data' :
               activePage === 'rekap' ? 'Rekap Data' :
               activePage === 'search' ? 'Search ID' :
               activePage === 'checking' ? 'Checking Sosmed' :
               activePage === 'gmail' ? 'Inventory Gmail' :
               activePage === 'absensi' ? 'Absensi' :
               activePage === 'users' ? 'Manage User' :
               activePage === 'projects' ? 'Manage Project' :
               activePage === 'tasks' ? 'Manage Tugas' :
               activePage === 'locations' ? 'Manage Lokasi' :
               activePage === 'proxies' ? 'Manage Proxy' :
               activePage === 'spreadsheet' ? 'Spreadsheet Setup' :
               activePage === 'export' ? 'Export Data' :
               activePage === 'app-settings' ? 'App Settings' :
               activePage === 'versions' ? 'Version Updates' :
               activePage === 'audit' ? 'Audit Log' :
               activePage === 'notifications' ? 'Notifikasi' : 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('notifications')}
              className="relative p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {store.currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </main>
      </div>

      {/* Version Modal */}
      {showVersionModal && activeVersion && (
        <VersionModal version={activeVersion} onClose={() => setShowVersionModal(false)} />
      )}
    </div>
  );
}
