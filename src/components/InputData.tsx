import { useState } from 'react';
import { FileInput, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import type { User, Project, Task, Location, Proxy, WorkEntry } from '../types';
import { getWIBDate } from '../utils/helpers';

interface Props {
  currentUser: User;
  projects: Project[];
  tasks: Task[];
  locations: Location[];
  proxies: Proxy[];
  onAddEntries: (entries: Omit<WorkEntry, 'id' | 'duplicateStatus' | 'duplicateSources' | 'checkingStatus' | 'createdAt' | 'updatedAt'>[]) => WorkEntry[];
  checkDuplicates: (avatarId: string) => { source: string; operator: string; date: string; project: string; task: string }[];
}

const ratings = ['⭐ 1', '⭐ 2', '⭐ 3', '⭐ 4', '⭐ 5'];
const statuses = ['sukses', 'gagal', 'pending', 'proses'];

export default function InputData({ currentUser, projects, tasks, locations, proxies, onAddEntries, checkDuplicates }: Props) {
  const [form, setForm] = useState({
    date: getWIBDate(),
    projectId: '',
    taskId: '',
    locationId: '',
    proxyId: '',
    rating: '⭐ 3',
    status: 'sukses',
    avatarIds: '',
    description: '',
    issue: '',
  });
  const [result, setResult] = useState<{ success: boolean; count: number; duplicates: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const activeProjects = projects.filter(p => p.isActive);
  const activeTasks = tasks.filter(t => t.isActive);
  const activeProxies = proxies.filter(p => p.isActive);
  const projectLocations = locations.filter(l => l.projectId === form.projectId && l.isActive);

  const selectedProject = projects.find(p => p.id === form.projectId);
  const selectedTask = tasks.find(t => t.id === form.taskId);
  const selectedLocation = locations.find(l => l.id === form.locationId);
  const selectedProxy = proxies.find(p => p.id === form.proxyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Parse avatar IDs (one per line)
    const ids = form.avatarIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (ids.length === 0) {
      setResult({ success: false, count: 0, duplicates: [] });
      setLoading(false);
      return;
    }

    // Check for duplicates
    const duplicates: string[] = [];
    ids.forEach(id => {
      const dups = checkDuplicates(id);
      if (dups.length > 0) duplicates.push(id);
    });

    // Create entries
    const entries = ids.map(avatarId => ({
      date: form.date,
      operatorId: currentUser.id,
      operatorName: currentUser.displayName,
      taskId: form.taskId,
      taskName: selectedTask?.name || '',
      projectId: form.projectId,
      projectName: selectedProject?.name || '',
      avatarId,
      proxyId: form.proxyId,
      proxyLabel: selectedProxy?.label || '',
      rating: form.rating,
      locationId: form.locationId,
      locationName: selectedLocation?.name || '',
      status: form.status as 'sukses' | 'gagal' | 'pending' | 'proses',
      description: form.description,
      issue: form.issue,
      createdBy: currentUser.username,
      updatedBy: currentUser.username,
    }));

    setTimeout(() => {
      onAddEntries(entries);
      setResult({ success: true, count: ids.length, duplicates });
      setForm(f => ({ ...f, avatarIds: '', description: '', issue: '' }));
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileInput className="w-7 h-7 text-blue-400" />
          Input Data Kerja
        </h1>
        <p className="text-slate-400 text-sm mt-1">Input batch Avatar ID dengan satu kali submit</p>
      </div>

      {result && (
        <div className={`rounded-xl p-4 border ${result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.success ? `Berhasil menambahkan ${result.count} data!` : 'Gagal: Avatar ID tidak boleh kosong'}
              </p>
              {result.duplicates.length > 0 && (
                <p className="text-sm text-amber-400 mt-1">
                  ⚠️ {result.duplicates.length} ID terdeteksi duplicate: {result.duplicates.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tanggal</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Operator (readonly) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Operator</label>
            <input
              type="text"
              value={currentUser.displayName}
              readOnly
              className="w-full px-3 py-2.5 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-400 text-sm cursor-not-allowed"
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Project *</label>
            <select
              value={form.projectId}
              onChange={e => setForm(f => ({ ...f, projectId: e.target.value, locationId: '' }))}
              required
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Project</option>
              {activeProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Task */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tugas *</label>
            <select
              value={form.taskId}
              onChange={e => setForm(f => ({ ...f, taskId: e.target.value }))}
              required
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Tugas</option>
              {activeTasks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Lokasi Avatar *</label>
            <select
              value={form.locationId}
              onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))}
              required
              disabled={!form.projectId}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">{form.projectId ? 'Pilih Lokasi' : 'Pilih Project dulu'}</option>
              {projectLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Proxy */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Proxy</label>
            <select
              value={form.proxyId}
              onChange={e => setForm(f => ({ ...f, proxyId: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Proxy</option>
              {activeProxies.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Rating</label>
            <select
              value={form.rating}
              onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ratings.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              required
              className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Avatar IDs */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Avatar ID (satu per baris) *
          </label>
          <textarea
            value={form.avatarIds}
            onChange={e => setForm(f => ({ ...f, avatarIds: e.target.value }))}
            placeholder="ID001&#10;ID002&#10;ID003"
            rows={5}
            required
            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          />
          <p className="text-xs text-slate-500 mt-1">
            {form.avatarIds.split('\n').filter(id => id.trim()).length} ID akan diinput
          </p>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">Keterangan</label>
          <input
            type="text"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Keterangan tambahan..."
            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Issue */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300 mb-1">Masalah Yang Dihadapi</label>
          <textarea
            value={form.issue}
            onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
            placeholder="Jika ada masalah, jelaskan di sini..."
            rows={2}
            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Submit Data
            </>
          )}
        </button>
      </form>
    </div>
  );
}
