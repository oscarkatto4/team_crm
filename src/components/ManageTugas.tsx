import { useState } from 'react';
import { ListTodo, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Task } from '../types';

interface Props {
  tasks: Task[];
  onAdd: (name: string) => Task;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function ManageTugas({ tasks, onAdd, onUpdate, onDelete }: Props) {
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
          <ListTodo className="w-7 h-7 text-blue-400" />
          Manage Tugas
        </h1>
        <p className="text-slate-400 text-sm mt-1">Kelola daftar tugas</p>
      </div>

      <div className="flex gap-3">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nama tugas baru..."
          className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white text-sm"
        />
        <button onClick={handleAdd} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="grid gap-2">
        {tasks.map(task => (
          <div key={task.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
            {editingId === task.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEdit(task.id)}
                onBlur={() => handleEdit(task.id)}
                autoFocus
                className="flex-1 px-3 py-1 bg-slate-900/50 border border-slate-600 rounded text-white text-sm mr-3"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-white">{task.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${task.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  {task.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => onUpdate(task.id, { isActive: !task.isActive })}
                className={`px-2 py-1 rounded text-xs ${task.isActive ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {task.isActive ? 'Non-aktifkan' : 'Aktifkan'}
              </button>
              <button onClick={() => { setEditingId(task.id); setEditName(task.name); }}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(task.id)}
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
