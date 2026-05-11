import { useState } from 'react';
import { FolderKanban, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Project } from '../types';

interface Props {
  projects: Project[];
  onAdd: (name: string) => Project;
  onUpdate: (id: string, data: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

export default function ManageProject({ projects, onAdd, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
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
          <FolderKanban className="w-7 h-7 text-blue-400" />
          Manage Project
        </h1>
        <p className="text-slate-400 text-sm mt-1">Kelola daftar project</p>
      </div>

      {/* Add new */}
      <div className="flex gap-3">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nama project baru..."
          className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-sm"
        />
        <button onClick={handleAdd} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* List */}
      <div className="grid gap-2">
        {projects.map(project => (
          <div key={project.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
            {editingId === project.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEdit(project.id)}
                onBlur={() => handleEdit(project.id)}
                autoFocus
                className="flex-1 px-3 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm mr-3"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-white">{project.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${project.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {project.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => onUpdate(project.id, { isActive: !project.isActive })}
                className={`px-2 py-1 rounded text-xs ${project.isActive ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {project.isActive ? 'Non-aktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => { setEditingId(project.id); setEditName(project.name); }}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(project.id)}
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
