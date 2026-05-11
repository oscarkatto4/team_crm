import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, UserCheck, UserX, Search } from 'lucide-react';
import type { User, UserRole, AttendanceShift } from '../types';

interface Props {
  currentUser: User;
  users: User[];
  shifts: AttendanceShift[];
  onAddUser: (data: any) => User;
  onUpdateUser: (id: string, data: Partial<User> & { password?: string }) => void;
  onDeleteUser: (id: string) => void;
}

export default function UserManagement({ currentUser, users, shifts, onAddUser, onUpdateUser, onDeleteUser }: Props) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isSuperadmin = currentUser.role === 'superadmin';
  const allowedRoles: UserRole[] = isSuperadmin ? ['superadmin', 'supervisor', 'operator'] : ['operator'];

  let filtered = users.filter(u => u.id !== currentUser.id);
  if (!isSuperadmin) {
    filtered = filtered.filter(u => u.role === 'operator');
  }
  if (search) {
    filtered = filtered.filter(u =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  }

  const roleColors: Record<UserRole, string> = {
    superadmin: 'bg-red-500/20 text-red-300',
    supervisor: 'bg-amber-500/20 text-amber-300',
    operator: 'bg-blue-500/20 text-blue-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-400" />
            {isSuperadmin ? 'Manage User' : 'User Operator'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Total: {filtered.length} user</p>
        </div>
        <button onClick={() => { setEditingUser(null); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari user..."
          className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm" />
      </div>

      {/* User List */}
      <div className="grid gap-3">
        {filtered.map(user => (
          <div key={user.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold">
                {user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{user.displayName}</p>
                <p className="text-slate-400 text-sm">{user.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>{user.role}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {user.isActive ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onUpdateUser(user.id, { isActive: !user.isActive })}
                className={`p-2 rounded-lg ${user.isActive ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'}`}>
                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              </button>
              <button onClick={() => { setEditingUser(user); setShowModal(true); }}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400">
                <Edit2 className="w-4 h-4" />
              </button>
              {isSuperadmin && deleteConfirm !== user.id && (
                <button onClick={() => setDeleteConfirm(user.id)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {deleteConfirm === user.id && (
                <div className="flex gap-1">
                  <button onClick={() => { onDeleteUser(user.id); setDeleteConfirm(null); }} className="px-2 py-1 bg-red-600 text-white text-xs rounded">Ya</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-slate-600 text-white text-xs rounded">Tidak</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          allowedRoles={allowedRoles}
          shifts={shifts}
          onSave={(data) => {
            if (editingUser) {
              onUpdateUser(editingUser.id, data);
            } else {
              onAddUser(data);
            }
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function UserModal({ user, allowedRoles, shifts, onSave, onClose }: {
  user: User | null;
  allowedRoles: UserRole[];
  shifts: AttendanceShift[];
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    username: user?.username || '',
    password: '',
    displayName: user?.displayName || '',
    role: user?.role || allowedRoles[allowedRoles.length - 1],
    isActive: user?.isActive ?? true,
    shiftId: user?.shiftId || '',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{user ? 'Edit User' : 'Tambah User'}</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Username</label>
            <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password {user && <span className="text-slate-500">(kosongkan jika tidak diubah)</span>}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nama Display</label>
            <input value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Shift</label>
              <select value={form.shiftId} onChange={e => setForm(f => ({ ...f, shiftId: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                <option value="">Tidak ada</option>
                {shifts.filter(s => s.isActive).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
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
