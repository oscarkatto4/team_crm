import { Bell, CheckCheck, Mail, AlertTriangle, Clock, FileSpreadsheet, Database } from 'lucide-react';
import type { User, Notification, NotificationType } from '../types';
import { formatWIBDateTime } from '../utils/helpers';

interface Props {
  currentUser: User;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsPage({ currentUser, notifications, onMarkRead, onMarkAllRead }: Props) {
  const myNotifs = notifications
    .filter(n => n.targetRole.includes(currentUser.role) || n.targetUserId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = myNotifs.filter(n => !n.isRead).length;

  const typeConfig: Record<NotificationType, { icon: any; color: string; bg: string }> = {
    new_data: { icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    gmail_added: { icon: Mail, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    gmail_changed: { icon: Mail, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    duplicate: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    late_login: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    overtime: { icon: Clock, color: 'text-red-400', bg: 'bg-red-500/10' },
    backup_success: { icon: FileSpreadsheet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    backup_failed: { icon: FileSpreadsheet, color: 'text-red-400', bg: 'bg-red-500/10' },
    export_success: { icon: FileSpreadsheet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    export_failed: { icon: FileSpreadsheet, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-400" />
            Notifikasi
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Pemberitahuan dan pembaruan sistem</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={onMarkAllRead}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      <div className="space-y-2">
        {myNotifs.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-lg font-medium">Tidak ada notifikasi</p>
          </div>
        ) : (
          myNotifs.map(notif => {
            const tc = typeConfig[notif.type] || { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-500/10' };
            const Icon = tc.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && onMarkRead(notif.id)}
                className={`bg-slate-800/50 border rounded-xl p-4 hover:bg-slate-800/70 transition-colors cursor-pointer ${
                  notif.isRead ? 'border-slate-700/30 opacity-70' : 'border-slate-700/50 border-l-4 border-l-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${tc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-slate-500 shrink-0">{formatWIBDateTime(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{notif.message}</p>
                    {!notif.isRead && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
