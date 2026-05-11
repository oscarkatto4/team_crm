import { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Project, Location } from '../types';

interface Props {
  projects: Project[];
  locations: Location[];
  onAdd: (projectId: string, names: string[]) => Location[];
  onUpdate: (id: string, data: Partial<Location>) => void;
  onDelete: (id: string) => void;
}

export default function ManageLokasi({ projects, locations, onAdd, onUpdate, onDelete }: Props) {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [newNames, setNewNames] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const projectLocations = locations.filter(l => l.projectId === selectedProject);
  const activeProjects = projects.filter(p => p.isActive);

  const handleAdd = () => {
    if (!newNames.trim() || !selectedProject) return;
    // Parse multiple lines
    const names = newNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (names.length > 0) {
      onAdd(selectedProject, names);
      setNewNames('');
    }
  };

  const handleEdit = (id: string) => {
    if (!editName.trim()) return;
    onUpdate(id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-7 h-7 text-blue-400" />
          Manage Lokasi Avatar
        </h1>
        <p className="text-slate-400 text-sm mt-1">Lokasi dikelompokkan berdasarkan project</p>
      </div>

      {/* Project Selector */}
      <div className="flex gap-2 flex-wrap">
        {activeProjects.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProject(p.id)}
            className={`px-4 py-2 rounded-lg text-sm ${selectedProject === p.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Add new (multiple) */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <label className="block text-sm text-slate-300 mb-2">
          Tambah Lokasi Baru (satu per baris, bisa multiple)
        </label>
        <textarea
          value={newNames}
          onChange={e => setNewNames(e.target.value)}
          placeholder="Dubai&#10;Sharjah&#10;Ajman"
          rows={4}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm resize-none mb-3"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Lokasi
        </button>
      </div>

      {/* List */}
      <div className="grid gap-2">
        {projectLocations.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Belum ada lokasi untuk project ini
          </div>
        ) : projectLocations.map(loc => (
          <div key={loc.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
            {editingId === loc.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEdit(loc.id)}
                onBlur={() => handleEdit(loc.id)}
                autoFocus
                className="flex-1 px-3 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm mr-3"
              />
            ) : (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-white">{loc.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${loc.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {loc.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => onUpdate(loc.id, { isActive: !loc.isActive })}
                className={`px-2 py-1 rounded text-xs ${loc.isActive ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {loc.isActive ? 'Non-aktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => { setEditingId(loc.id); setEditName(loc.name); }}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(loc.id)}
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
