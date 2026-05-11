import { useState } from 'react';
import { History, Plus, Tag, Bug, Palette, Shield, Database } from 'lucide-react';
import type { User, VersionUpdate } from '../types';
import { formatWIBDate } from '../utils/helpers';

interface Props {
  versions: VersionUpdate[];
  currentUser: User;
  onAddVersion: (data: Omit<VersionUpdate, 'id' | 'createdAt'>) => VersionUpdate;
}

export default function VersionsPage({ versions, currentUser, onAddVersion }: Props) {
  const [showModal, setShowModal] = useState(false);

  const typeIcons = {
    feature: Tag,
    bugfix: Bug,
    ui: Palette,
    security: Shield,
    database: Database,
  };

  const typeColors = {
    feature: 'bg-blue-500/20 text-blue-300',
    bugfix: 'bg-red-500/20 text-red-300',
    ui: 'bg-purple-500/20 text-purple-300',
    security: 'bg-amber-500/20 text-amber-300',
    database: 'bg-emerald-500/20 text-emerald-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-blue-400" />
            Version Updates
          </h1>
          <p className="text-slate-400 text-sm mt-1">Riwayat pembaruan sistem</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Version
        </button>
      </div>

      <div className="space-y-4">
        {versions.map((ver) => {
          const Icon = typeIcons[ver.updateType];
          return (
            <div key={ver.id} className={`bg-slate-800/50 border rounded-xl p-5 ${ver.isActive ? 'border-blue-500/50' : 'border-slate-700/50'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{ver.versionName}</h3>
                    {ver.isActive && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">Aktif</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${typeColors[ver.updateType]}`}>
                      <Icon className="w-3 h-3" /> {ver.updateType}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{formatWIBDate(ver.releaseDate)}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1">
                {ver.updateDetails.map((detail, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-4">Oleh: {ver.createdBy}</p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <AddVersionModal
          currentUser={currentUser}
          onAdd={(data) => { onAddVersion(data); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function AddVersionModal({ currentUser, onAdd, onClose }: {
  currentUser: User;
  onAdd: (data: Omit<VersionUpdate, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    versionName: '',
    releaseDate: new Date().toISOString().split('T')[0],
    updateType: 'feature' as VersionUpdate['updateType'],
    updateDetails: '',
    isActive: true,
  });

  const handleSubmit = () => {
    if (!form.versionName.trim() || !form.updateDetails.trim()) return;
    onAdd({
      versionName: form.versionName,
      releaseDate: form.releaseDate,
      updateType: form.updateType,
      updateDetails: form.updateDetails.split('\n').filter(d => d.trim()),
      isActive: form.isActive,
      createdBy: currentUser.username,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Tambah Version</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Version Name</label>
              <input value={form.versionName} onChange={e => setForm(f => ({ ...f, versionName: e.target.value }))}
                placeholder="Alpha 1.1"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Release Date</label>
              <input type="date" value={form.releaseDate} onChange={e => setForm(f => ({ ...f, releaseDate: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Type</label>
            <select value={form.updateType} onChange={e => setForm(f => ({ ...f, updateType: e.target.value as any }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
              <option value="feature">Feature</option>
              <option value="bugfix">Bug Fix</option>
              <option value="ui">UI Improvement</option>
              <option value="security">Security</option>
              <option value="database">Database</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Update Details (satu per baris)</label>
            <textarea value={form.updateDetails} onChange={e => setForm(f => ({ ...f, updateDetails: e.target.value }))}
              placeholder="Penambahan fitur X&#10;Perbaikan bug Y"
              rows={5}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-blue-500" />
            <span className="text-sm text-slate-300">Set sebagai versi aktif</span>
          </label>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">Batal</button>
            <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Tambah</button>
          </div>
        </div>
      </div>
    </div>
  );
}
