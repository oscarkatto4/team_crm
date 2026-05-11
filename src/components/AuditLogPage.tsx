import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import type { AuditLog } from '../types';
import { formatWIBDateTime } from '../utils/helpers';

interface Props {
  auditLogs: AuditLog[];
}

export default function AuditLogPage({ auditLogs }: Props) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterModule, setFilterModule] = useState('');

  let filtered = auditLogs;
  if (search) {
    filtered = filtered.filter(l =>
      l.username.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (filterAction) {
    filtered = filtered.filter(l => l.action === filterAction);
  }
  if (filterModule) {
    filtered = filtered.filter(l => l.module === filterModule);
  }

  const actionColors: Record<string, string> = {
    login: 'bg-emerald-500/20 text-emerald-300',
    logout: 'bg-slate-500/20 text-slate-300',
    create: 'bg-blue-500/20 text-blue-300',
    update: 'bg-amber-500/20 text-amber-300',
    delete: 'bg-red-500/20 text-red-300',
    export: 'bg-purple-500/20 text-purple-300',
    backup: 'bg-indigo-500/20 text-indigo-300',
    checking: 'bg-teal-500/20 text-teal-300',
    gmail_status_change: 'bg-pink-500/20 text-pink-300',
  };

  const modules = [...new Set(auditLogs.map(l => l.module))];
  const actions = [...new Set(auditLogs.map(l => l.action))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-400" />
          Audit Log
        </h1>
        <p className="text-slate-400 text-sm mt-1">Riwayat aktivitas sistem</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm">
          <option value="">Semua Action</option>
          {actions.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm">
          <option value="">Semua Module</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Module</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>
              ) : filtered.slice(0, 100).map(log => (
                <tr key={log.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatWIBDateTime(log.createdAt)}</td>
                  <td className="px-4 py-3 text-white">{log.username}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${actionColors[log.action] || ''}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{log.module}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
