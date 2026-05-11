import { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, Users, AlertTriangle } from 'lucide-react';
import type { User, AttendanceShift, AttendanceRecord } from '../types';
import { getWIBDate } from '../utils/helpers';

interface Props {
  currentUser: User;
  users: User[];
  shifts: AttendanceShift[];
  attendanceRecords: AttendanceRecord[];
  onAddShift: (data: Omit<AttendanceShift, 'id' | 'createdAt' | 'updatedAt'>) => AttendanceShift;
  onUpdateShift: (id: string, data: Partial<AttendanceShift>) => void;
  onDeleteShift: (id: string) => void;
}

export default function AbsensiPage({ users, shifts, attendanceRecords, onAddShift, onUpdateShift, onDeleteShift }: Props) {
  const [tab, setTab] = useState<'records' | 'shifts'>('records');
  const [filterDate, setFilterDate] = useState(getWIBDate());
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<AttendanceShift | null>(null);

  const operators = users.filter(u => u.role === 'operator' && u.isActive);
  const todayRecords = attendanceRecords.filter(a => a.date === filterDate);

  const statusColors: Record<string, string> = {
    hadir: 'bg-emerald-500/20 text-emerald-300',
    terlambat: 'bg-amber-500/20 text-amber-300',
    pulang_cepat: 'bg-orange-500/20 text-orange-300',
    lewat_jam_kerja: 'bg-red-500/20 text-red-300',
    tidak_ada_logout: 'bg-slate-500/20 text-slate-300',
    pending_pulang: 'bg-blue-500/20 text-blue-300',
  };

  const statusLabels: Record<string, string> = {
    hadir: 'Hadir',
    terlambat: 'Terlambat',
    pulang_cepat: 'Pulang Cepat',
    lewat_jam_kerja: 'Lewat Jam Kerja',
    tidak_ada_logout: 'Tidak Ada Logout',
    pending_pulang: 'Pending Pulang',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-7 h-7 text-blue-400" />
            Absensi
          </h1>
          <p className="text-slate-400 text-sm mt-1">Kelola absensi dan shift kerja</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        <button onClick={() => setTab('records')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'records' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          Rekap Absensi
        </button>
        <button onClick={() => setTab('shifts')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'shifts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          Kelola Shift
        </button>
      </div>

      {tab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm" />
            <span className="text-slate-400 text-sm">{todayRecords.length} record</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Operator</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Shift</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Jam Masuk</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Jam Pulang</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Durasi</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Warning</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data absensi</td></tr>
                ) : todayRecords.map(record => (
                  <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="px-4 py-3 text-white">{record.operatorName}</td>
                    <td className="px-4 py-3 text-slate-300">{record.shiftName}</td>
                    <td className="px-4 py-3 text-emerald-400">{record.firstLoginAt}</td>
                    <td className="px-4 py-3 text-slate-300">{record.finalCheckoutAt || record.lastLogoutAt || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {record.workDurationMinutes > 0 ? `${Math.floor(record.workDurationMinutes / 60)}j ${record.workDurationMinutes % 60}m` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[record.status] || ''}`}>
                        {statusLabels[record.status] || record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.warnings.length > 0 && (
                        <div className="flex items-center gap-1 text-amber-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {record.warnings.length}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'shifts' && (
        <div className="space-y-4">
          <button onClick={() => { setEditingShift(null); setShowShiftModal(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Tambah Shift
          </button>

          <div className="grid gap-4">
            {shifts.filter(s => s.isActive).map(shift => (
              <div key={shift.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{shift.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">{shift.startTime} - {shift.endTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingShift(shift); setShowShiftModal(true); }}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteShift(shift.id)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Operator ({shift.operatorIds.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {shift.operatorIds.map(opId => {
                      const op = operators.find(o => o.id === opId);
                      return op ? (
                        <span key={opId} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">
                          {op.displayName}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {showShiftModal && (
        <ShiftModal
          shift={editingShift}
          operators={operators}
          onSave={(data) => {
            if (editingShift) {
              onUpdateShift(editingShift.id, data);
            } else {
              onAddShift({ name: data.name || '', startTime: data.startTime || '08:00', endTime: data.endTime || '16:00', operatorIds: data.operatorIds || [], isActive: true });
            }
            setShowShiftModal(false);
          }}
          onClose={() => setShowShiftModal(false)}
        />
      )}
    </div>
  );
}

function ShiftModal({ shift, operators, onSave, onClose }: {
  shift: AttendanceShift | null;
  operators: User[];
  onSave: (data: Partial<AttendanceShift>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: shift?.name || '',
    startTime: shift?.startTime || '08:00',
    endTime: shift?.endTime || '16:00',
    operatorIds: shift?.operatorIds || [],
  });

  const toggleOperator = (id: string) => {
    setForm(f => ({
      ...f,
      operatorIds: f.operatorIds.includes(id)
        ? f.operatorIds.filter(i => i !== id)
        : [...f.operatorIds, id]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{shift ? 'Edit Shift' : 'Tambah Shift'}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nama Shift</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Jam Mulai</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Jam Selesai</label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Operator</label>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {operators.map(op => (
                <label key={op.id} className="flex items-center gap-2 p-2 hover:bg-slate-700/50 rounded cursor-pointer">
                  <input type="checkbox" checked={form.operatorIds.includes(op.id)} onChange={() => toggleOperator(op.id)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-blue-500" />
                  <span className="text-sm text-slate-300">{op.displayName}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">Batal</button>
            <button onClick={() => onSave(form)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
