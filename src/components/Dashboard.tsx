import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileInput, CheckCircle, XCircle, Clock, AlertTriangle, Users, TrendingUp, Search } from 'lucide-react';
import type { User, WorkEntry, CheckingRecord } from '../types';
import { getWIBDate } from '../utils/helpers';
import { useState } from 'react';

interface Props {
  currentUser: User;
  users: User[];
  workEntries: WorkEntry[];
  checkingRecords: CheckingRecord[];
  onNavigate: (page: string) => void;
}

export default function Dashboard({ currentUser, users, workEntries, checkingRecords, onNavigate }: Props) {
  const [searchId, setSearchId] = useState('');
  const today = getWIBDate();
  const isOperator = currentUser.role === 'operator';

  // Filter entries for operator
  const myEntries = isOperator
    ? workEntries.filter(e => e.operatorId === currentUser.id)
    : workEntries;

  const todayEntries = myEntries.filter(e => e.date === today);
  const todaySuccess = todayEntries.filter(e => e.status === 'sukses').length;
  const todayFailed = todayEntries.filter(e => e.status === 'gagal').length;
  const todayPending = todayEntries.filter(e => e.status === 'pending').length;
  const todayDuplicate = todayEntries.filter(e => e.duplicateStatus !== 'none').length;

  // Stats cards
  const stats = [
    { label: 'Total Input Hari Ini', value: todayEntries.length, icon: FileInput, color: 'from-blue-500 to-blue-600' },
    { label: 'Sukses', value: todaySuccess, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Gagal', value: todayFailed, icon: XCircle, color: 'from-red-500 to-red-600' },
    { label: 'Pending', value: todayPending, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Duplicate', value: todayDuplicate, icon: AlertTriangle, color: 'from-purple-500 to-purple-600' },
  ];

  // Operator ranking (for SPV & Admin)
  const operators = users.filter(u => u.role === 'operator' && u.isActive);
  const operatorStats = operators.map(op => {
    const entries = todayEntries.filter(e => e.operatorId === op.id);
    const checking = checkingRecords.filter(c => c.operatorId === op.id);
    const ok = checking.filter(c => c.checkingStatus === 'ok').length;
    const suspend = checking.filter(c => c.checkingStatus === 'suspend').length;
    const logout = checking.filter(c => c.checkingStatus === 'logout').length;
    const belumDicek = checking.filter(c => c.checkingStatus === 'belum_dicek').length;
    const checked = ok + suspend + logout;
    const performance = checked > 0 ? Math.round((ok / checked) * 100) : 0;
    
    return {
      id: op.id,
      name: op.displayName,
      total: entries.length,
      ok,
      suspend,
      logout,
      belumDicek,
      performance,
    };
  }).sort((a, b) => b.total - a.total);

  // Chart data: Status distribution
  const statusData = [
    { name: 'Sukses', value: todaySuccess, color: '#10b981' },
    { name: 'Gagal', value: todayFailed, color: '#ef4444' },
    { name: 'Pending', value: todayPending, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Chart data: Entries per operator
  const operatorChartData = operatorStats.slice(0, 5).map(op => ({
    name: op.name.split(' ')[0],
    total: op.total,
  }));

  // Quick search
  const searchResults = searchId.trim()
    ? myEntries.filter(e => e.avatarId.toLowerCase().includes(searchId.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Selamat Datang, {currentUser.displayName} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Search */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-blue-400" />
            Quick Search Avatar ID
          </h2>
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Ketik Avatar ID..."
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />
          {searchResults.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map(entry => (
                <div key={entry.id} className="bg-slate-700/30 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{entry.avatarId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.status === 'sukses' ? 'bg-emerald-500/20 text-emerald-300' :
                      entry.status === 'gagal' ? 'bg-red-500/20 text-red-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{entry.projectName} • {entry.taskName} • {entry.date}</p>
                </div>
              ))}
              <button
                onClick={() => onNavigate('search')}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2"
              >
                Lihat Semua Hasil →
              </button>
            </div>
          ) : searchId.trim() ? (
            <p className="text-slate-500 text-sm text-center py-4">Tidak ada hasil</p>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">Ketik untuk mencari...</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Distribusi Status Hari Ini
          </h2>
          {statusData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500">
              Belum ada data hari ini
            </div>
          )}
        </div>
      </div>

      {/* Supervisor/Admin Only: Operator Performance */}
      {!isOperator && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operator Ranking */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-amber-400" />
              Ranking Operator Hari Ini
            </h2>
            <div className="space-y-2">
              {operatorStats.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">Tidak ada data</p>
              ) : (
                operatorStats.map((op, idx) => (
                  <div key={op.id} className="bg-slate-700/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-500 text-amber-900' :
                        idx === 1 ? 'bg-slate-400 text-slate-900' :
                        idx === 2 ? 'bg-orange-600 text-orange-100' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{op.name}</p>
                        <p className="text-xs text-slate-400">{op.total} data</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        op.performance >= 80 ? 'text-emerald-400' :
                        op.performance >= 50 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {op.performance}%
                      </p>
                      <p className="text-xs text-slate-500">performance</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Operator Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Input per Operator
            </h2>
            {operatorChartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={operatorChartData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                Belum ada data
              </div>
            )}
          </div>

          {/* Performance Table */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Performa Sosmed per Operator
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400">Operator</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-slate-400">Total ID</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-emerald-400">OK</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-red-400">Suspend</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-amber-400">Logout</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-slate-400">Belum Dicek</th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-slate-400">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {operatorStats.map(op => (
                    <tr key={op.id} className="border-b border-slate-700/30">
                      <td className="px-3 py-2.5 text-sm text-white">{op.name}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-slate-300">{op.total}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-emerald-400">{op.ok}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-red-400">{op.suspend}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-amber-400">{op.logout}</td>
                      <td className="px-3 py-2.5 text-sm text-center text-slate-400">{op.belumDicek}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-sm font-bold ${
                          op.performance >= 80 ? 'text-emerald-400' :
                          op.performance >= 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {op.performance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
