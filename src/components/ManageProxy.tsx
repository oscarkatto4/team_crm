import { useState } from 'react';
import { Server, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Proxy } from '../types';

interface Props {
  proxies: Proxy[];
  onAdd: (label: string) => Proxy;
  onUpdate: (id: string, data: Partial<Proxy>) => void;
  onDelete: (id: string) => void;
}

export default function ManageProxy({ proxies, onAdd, onUpdate, onDelete }: Props) {
  const [newLabel, setNewLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    onAdd(newLabel.trim());
    setNewLabel('');
  };

  const handleEdit = (id: string) => {
    if (!editLabel.trim()) return;
    onUpdate(id, { label: editLabel.trim() });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Server className="w-7 h-7 text-blue-400" />
          Manage Proxy
        </h1>
        <p className="text-slate-400 text-sm mt-1">Hanya label proxy, tanpa IP</p>
      </div>

      <div className="flex gap-3">
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Label proxy baru..."
          className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-sm"
        />
        <button onClick={handleAdd} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="grid gap-2">
        {proxies.map(proxy => (
          <div key={proxy.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
            {editingId === proxy.id ? (
              <input
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEdit(proxy.id)}
                onBlur={() => handleEdit(proxy.id)}
                autoFocus
                className="flex-1 px-3 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm mr-3"
              />
            ) : (
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-slate-400" />
                <span className="text-white">{proxy.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${proxy.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {proxy.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => onUpdate(proxy.id, { isActive: !proxy.isActive })}
                className={`px-2 py-1 rounded text-xs ${proxy.isActive ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {proxy.isActive ? 'Non-aktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => { setEditingId(proxy.id); setEditLabel(proxy.label); }}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(proxy.id)}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
