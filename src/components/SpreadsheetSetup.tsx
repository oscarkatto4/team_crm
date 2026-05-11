import { useState } from 'react';
import { FileSpreadsheet, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { User, ExternalSource } from '../types';
import { validateWebAppUrl } from '../utils/helpers';

interface Props {
  externalSources: ExternalSource[];
  onAdd: (data: Omit<ExternalSource, 'id' | 'createdAt' | 'updatedAt'>) => ExternalSource;
  onUpdate: (id: string, data: Partial<ExternalSource>) => void;
  onDelete: (id: string) => void;
  currentUser: User;
}

export default function SpreadsheetSetup({ externalSources, onAdd, onUpdate, onDelete, currentUser }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState<ExternalSource | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-blue-400" />
            Spreadsheet Setup
          </h1>
          <p className="text-slate-400 text-sm mt-1">Konfigurasi Apps Script Web App URL untuk export/import</p>
        </div>
        <button onClick={() => { setEditingSource(null); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Source
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium">Penting!</p>
            <p className="text-amber-200/80 text-sm mt-1">
              Gunakan Apps Script Web App URL yang berakhiran <code className="bg-amber-500/20 px-1 rounded">/exec</code>.<br/>
              Format: <code className="bg-amber-500/20 px-1 rounded">https://script.google.com/macros/s/XXXXX/exec</code><br/>
              Jangan gunakan URL Spreadsheet biasa!
            </p>
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="grid gap-4">
        {externalSources.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Belum ada external source</p>
          </div>
        ) : externalSources.map(src => (
          <div key={src.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{src.sourceName}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${src.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {src.isActive ? 'Aktif' : 'Non-Aktif'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{src.type}</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">Sheet: {src.sheetName}</p>
                <p className="text-slate-500 text-xs mt-2 font-mono break-all">{src.webAppUrl}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingSource(src); setShowModal(true); }}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(src.id)}
                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <SourceModal
          source={editingSource}
          onSave={(data) => {
            if (editingSource) {
              onUpdate(editingSource.id, data);
            } else {
              onAdd({ ...data, createdBy: currentUser.username } as any);
            }
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function SourceModal({ source, onSave, onClose }: {
  source: ExternalSource | null;
  onSave: (data: Partial<ExternalSource>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    sourceName: source?.sourceName || '',
    webAppUrl: source?.webAppUrl || '',
    sheetName: source?.sheetName || 'Data',
    type: source?.type || 'both' as 'export' | 'import' | 'both',
    isActive: source?.isActive ?? true,
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const validation = validateWebAppUrl(form.webAppUrl);
    if (!validation.valid) {
      setError(validation.error || 'URL tidak valid');
      return;
    }
    if (!form.sourceName.trim()) {
      setError('Nama source wajib diisi');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{source ? 'Edit Source' : 'Tambah Source'}</h2>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nama Source</label>
            <input value={form.sourceName} onChange={e => setForm(f => ({ ...f, sourceName: e.target.value }))}
              placeholder="Contoh: Spreadsheet Utama"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Apps Script Web App URL</label>
            <input value={form.webAppUrl} onChange={e => { setForm(f => ({ ...f, webAppUrl: e.target.value })); setError(''); }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nama Sheet</label>
            <input value={form.sheetName} onChange={e => setForm(f => ({ ...f, sheetName: e.target.value }))}
              placeholder="Data"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Tipe</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                <option value="both">Export & Import</option>
                <option value="export">Export Only</option>
                <option value="import">Import Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Status</label>
              <select value={form.isActive ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
                <option value="true">Aktif</option>
                <option value="false">Non-Aktif</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">Batal</button>
            <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}
