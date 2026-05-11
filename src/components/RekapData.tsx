import { useState } from 'react';
import { FileText, Search, Edit2, Trash2, X, Save, Filter, AlertTriangle } from 'lucide-react';
import type { User, WorkEntry, Project, Task, Location, Proxy } from '../types';
import { formatWIBDate } from '../utils/helpers';

interface Props {
  currentUser: User;
  users: User[];
  workEntries: WorkEntry[];
  projects: Project[];
  tasks: Task[];
  locations: Location[];
  proxies: Proxy[];
  onUpdateEntry: (id: string, data: Partial<WorkEntry>) => void;
  onDeleteEntry: (id: string) => void;
}

export default function RekapData({ currentUser, users, workEntries, projects, tasks, locations, proxies, onUpdateEntry, onDeleteEntry }: Props) {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterOperator, setFilterOperator] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChecking, setFilterChecking] = useState('');
  const [page, setPage] = useState(1);
  const [editEntry, setEditEntry] = useState<WorkEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showDupPopup, setShowDupPopup] = useState<WorkEntry | null>(null);
  const perPage = 20;

  const isOperator = currentUser.role === 'operator';
  const operators = users.filter(u => u.role === 'operator');

  // Filter entries
  let filtered = workEntries;
  if (isOperator) {
    filtered = filtered.filter(e => e.operatorId === currentUser.id);
  }
  if (search) {
    filtered = filtered.filter(e => e.avatarId.toLowerCase().includes(search.toLowerCase()));
  }
  if (filterDate) {
    filtered = filtered.filter(e => e.date === filterDate);
  }
  if (filterOperator) {
    filtered = filtered.filter(e => e.operatorId === filterOperator);
  }
  if (filterProject) {
    filtered = filtered.filter(e => e.projectId === filterProject);
  }
  if (filterStatus) {
    filtered = filtered.filter(e => e.status === filterStatus);
  }
  if (filterChecking) {
    filtered = filtered.filter(e => e.checkingStatus === filterChecking);
  }

  // Sort by date descending
  filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const canEdit = (entry: WorkEntry) => {
    if (isOperator) return entry.operatorId === currentUser.id;
    return true;
  };

  const statusColors: Record<string, string> = {
    sukses: 'bg-emerald-500/20 text-emerald-300',
    gagal: 'bg-red-500/20 text-red-300',
    pending: 'bg-amber-500/20 text-amber-300',
    proses: 'bg-blue-500/20 text-blue-300',
  };

  const checkingColors: Record<string, string> = {
    ok: 'bg-emerald-500/20 text-emerald-300',
    suspend: 'bg-red-500/20 text-red-300',
    logout: 'bg-amber-500/20 text-amber-300',
    belum_dicek: 'bg-slate-500/20 text-slate-300',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-blue-400" />
          Rekap Data
        </h1>
        <p className="text-slate-400 text-sm mt-1">Total: {filtered.length} data</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
          <Filter className="w-4 h-4" /> Filter
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative col-span-2 md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search Avatar ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!isOperator && (
            <select
              value={filterOperator}
              onChange={e => { setFilterOperator(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Operator</option>
              {operators.map(o => <option key={o.id} value={o.id}>{o.displayName}</option>)}
            </select>
          )}
          <select
            value={filterProject}
            onChange={e => { setFilterProject(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="sukses">Sukses</option>
            <option value="gagal">Gagal</option>
            <option value="pending">Pending</option>
            <option value="proses">Proses</option>
          </select>
          <select
            value={filterChecking}
            onChange={e => { setFilterChecking(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Checking</option>
            <option value="ok">OK</option>
            <option value="suspend">Suspend</option>
            <option value="logout">Logout</option>
            <option value="belum_dicek">Belum Dicek</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Operator</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Avatar ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Project</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Tugas</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Lokasi</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Checking</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">DUP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>
              ) : paginated.map(entry => (
                <tr key={entry.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="px-4 py-3 text-slate-300">{formatWIBDate(entry.date)}</td>
                  <td className="px-4 py-3 text-white">{entry.operatorName}</td>
                  <td className="px-4 py-3 text-white font-mono">{entry.avatarId}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.projectName}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.taskName}</td>
                  <td className="px-4 py-3 text-slate-300">{entry.locationName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[entry.status] || ''}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${checkingColors[entry.checkingStatus] || ''}`}>
                      {entry.checkingStatus === 'belum_dicek' ? 'Belum' : entry.checkingStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.duplicateStatus !== 'none' && (
                      <button
                        onClick={() => setShowDupPopup(entry)}
                        className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30"
                      >
                        DUP
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {canEdit(entry) && (
                        <>
                          <button onClick={() => setEditEntry(entry)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {deleteConfirm === entry.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => { onDeleteEntry(entry.id); setDeleteConfirm(null); }} className="px-2 py-1 bg-red-600 text-white text-xs rounded">Ya</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 bg-slate-600 text-white text-xs rounded">Tidak</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(entry.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <span className="text-sm text-slate-400">Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-slate-700 rounded text-sm disabled:opacity-50">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-slate-700 rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Duplicate Popup */}
      {showDupPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowDupPopup(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Duplicate Info</h3>
            </div>
            <p className="text-sm text-slate-300 mb-3">Avatar ID: <span className="font-mono text-white">{showDupPopup.avatarId}</span></p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {showDupPopup.duplicateSources.map((d, i) => (
                <div key={i} className="bg-slate-700/50 rounded-lg p-3 text-sm">
                  <p className="text-white">{d.operator} - {d.date}</p>
                  <p className="text-slate-400">{d.project} • {d.task}</p>
                  <p className="text-xs text-slate-500 mt-1">Source: {d.source}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDupPopup(null)} className="mt-4 w-full py-2 bg-slate-700 text-white rounded-lg">Tutup</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEntry && (
        <EditModal
          entry={editEntry}
          projects={projects}
          tasks={tasks}
          locations={locations}
          proxies={proxies}
          onSave={(data) => { onUpdateEntry(editEntry.id, data); setEditEntry(null); }}
          onClose={() => setEditEntry(null)}
        />
      )}
    </div>
  );
}

function EditModal({ entry, projects, tasks, locations, proxies, onSave, onClose }: {
  entry: WorkEntry;
  projects: Project[];
  tasks: Task[];
  locations: Location[];
  proxies: Proxy[];
  onSave: (data: Partial<WorkEntry>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    projectId: entry.projectId,
    taskId: entry.taskId,
    locationId: entry.locationId,
    proxyId: entry.proxyId,
    rating: entry.rating,
    status: entry.status,
    description: entry.description,
    issue: entry.issue,
  });

  const projectLocations = locations.filter(l => l.projectId === form.projectId && l.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === form.projectId);
    const task = tasks.find(t => t.id === form.taskId);
    const loc = locations.find(l => l.id === form.locationId);
    const proxy = proxies.find(p => p.id === form.proxyId);
    onSave({
      ...form,
      projectName: proj?.name || '',
      taskName: task?.name || '',
      locationName: loc?.name || '',
      proxyLabel: proxy?.label || '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Edit Data</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Project</label>
              <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value, locationId: '' }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Tugas</label>
              <select value={form.taskId} onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Lokasi</label>
              <select value={form.locationId} onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                {projectLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                <option value="sukses">Sukses</option>
                <option value="gagal">Gagal</option>
                <option value="pending">Pending</option>
                <option value="proses">Proses</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Keterangan</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Masalah</label>
            <textarea value={form.issue} onChange={e => setForm(f => ({ ...f, issue: e.target.value }))} rows={2}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">Batal</button>
            <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
