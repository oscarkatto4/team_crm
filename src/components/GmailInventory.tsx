import { useState } from 'react';
import { Mail, Plus, Copy, Eye, EyeOff, Edit2, Search } from 'lucide-react';
import type { User, EmailInventory, EmailSource, GmailCondition, PickupStatus } from '../types';
import { decryptPassword, formatWIBDateTime } from '../utils/helpers';

interface Props {
  currentUser: User;
  emailInventory: EmailInventory[];
  emailSources: EmailSource[];
  onAddEmails: (emails: { email: string; password: string; sourceId: string; sourceName: string; condition?: GmailCondition }[]) => EmailInventory[];
  onUpdateEmail: (id: string, data: Partial<EmailInventory>) => void;
  onDeleteEmail: (id: string) => void;
  onAddSource: (name: string) => EmailSource;
}

export default function GmailInventory({ emailInventory, emailSources, onAddEmails, onUpdateEmail, onAddSource }: Props) {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterPickup, setFilterPickup] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  let filtered = emailInventory;
  if (search) filtered = filtered.filter(e => e.email.toLowerCase().includes(search.toLowerCase()));
  if (filterSource) filtered = filtered.filter(e => e.sourceId === filterSource);
  if (filterCondition) filtered = filtered.filter(e => e.gmailCondition === filterCondition);
  if (filterPickup) filtered = filtered.filter(e => e.pickupStatus === filterPickup);

  const conditionColors: Record<GmailCondition, string> = {
    aktif: 'bg-emerald-500/20 text-emerald-300',
    suspend: 'bg-red-500/20 text-red-300',
    verifikasi_nomor: 'bg-amber-500/20 text-amber-300',
    tidak_bisa_login: 'bg-red-500/20 text-red-300',
    belum_dicek: 'bg-slate-500/20 text-slate-300',
    lainnya: 'bg-purple-500/20 text-purple-300',
  };

  const conditionLabels: Record<GmailCondition, string> = {
    aktif: 'Aktif',
    suspend: 'Suspend',
    verifikasi_nomor: 'Verif Nomor',
    tidak_bisa_login: 'Tidak Bisa Login',
    belum_dicek: 'Belum Dicek',
    lainnya: 'Lainnya',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const togglePassword = (id: string) => {
    const newSet = new Set(revealedPasswords);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedPasswords(newSet);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail className="w-7 h-7 text-blue-400" />
            Inventory Gmail/Email
          </h1>
          <p className="text-slate-400 text-sm mt-1">Total: {filtered.length} email</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Email
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(['aktif', 'suspend', 'verifikasi_nomor', 'tidak_bisa_login', 'belum_dicek'] as GmailCondition[]).map(cond => (
          <div key={cond} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{emailInventory.filter(e => e.gmailCondition === cond).length}</p>
            <p className={`text-xs ${conditionColors[cond].split(' ')[1]}`}>{conditionLabels[cond]}</p>
          </div>
        ))}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{emailInventory.filter(e => e.pickupStatus === 'sudah_diambil').length}</p>
          <p className="text-xs text-blue-300">Sudah Diambil</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm" />
        </div>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm">
          <option value="">Semua Sumber</option>
          {emailSources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterCondition} onChange={e => setFilterCondition(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm">
          <option value="">Semua Kondisi</option>
          {Object.entries(conditionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterPickup} onChange={e => setFilterPickup(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm">
          <option value="">Semua Status</option>
          <option value="belum_diambil">Belum Diambil</option>
          <option value="sudah_diambil">Sudah Diambil</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Password</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Sumber</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Kondisi</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Pengambilan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Last Edit</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>
              ) : filtered.map(email => (
                <tr key={email.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{email.email}</span>
                      <button onClick={() => copyToClipboard(email.email)} className="text-slate-400 hover:text-blue-400">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono text-xs">
                        {revealedPasswords.has(email.id) ? decryptPassword(email.encryptedPassword) : '••••••••'}
                      </span>
                      <button onClick={() => togglePassword(email.id)} className="text-slate-400 hover:text-blue-400">
                        {revealedPasswords.has(email.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => copyToClipboard(decryptPassword(email.encryptedPassword))} className="text-slate-400 hover:text-blue-400">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{email.sourceName}</td>
                  <td className="px-4 py-3">
                    {editingId === email.id ? (
                      <select
                        value={email.gmailCondition}
                        onChange={e => { onUpdateEmail(email.id, { gmailCondition: e.target.value as GmailCondition }); setEditingId(null); }}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white"
                      >
                        {Object.entries(conditionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full ${conditionColors[email.gmailCondition]}`}>
                        {conditionLabels[email.gmailCondition]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={email.pickupStatus}
                      onChange={e => onUpdateEmail(email.id, { pickupStatus: e.target.value as PickupStatus })}
                      className={`px-2 py-1 rounded text-xs ${
                        email.pickupStatus === 'sudah_diambil' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                      }`}
                    >
                      <option value="belum_diambil">Belum Diambil</option>
                      <option value="sudah_diambil">Sudah Diambil</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {email.lastEditedBy}<br />{formatWIBDateTime(email.lastEditedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setEditingId(editingId === email.id ? null : email.id)} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddEmailModal
          sources={emailSources}
          onAdd={(emails) => { onAddEmails(emails); setShowAddModal(false); }}
          onAddSource={onAddSource}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function AddEmailModal({ sources, onAdd, onAddSource, onClose }: {
  sources: EmailSource[];
  onAdd: (emails: { email: string; password: string; sourceId: string; sourceName: string; condition?: GmailCondition }[]) => void;
  onAddSource: (name: string) => EmailSource;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [batchData, setBatchData] = useState('');
  const [sourceId, setSourceId] = useState(sources[0]?.id || '');
  const [condition, setCondition] = useState<GmailCondition>('belum_dicek');
  const [newSource, setNewSource] = useState('');

  const handleAddSource = () => {
    if (!newSource.trim()) return;
    const src = onAddSource(newSource.trim());
    setSourceId(src.id);
    setNewSource('');
  };

  const handleSubmit = () => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    if (mode === 'single') {
      if (!email.trim() || !password.trim()) return;
      onAdd([{ email: email.trim(), password: password.trim(), sourceId, sourceName: source.name, condition }]);
    } else {
      // Batch: format is email:password per line
      const lines = batchData.split('\n').filter(l => l.trim());
      const emails = lines.map(line => {
        const [e, p] = line.split(':').map(s => s.trim());
        return { email: e || '', password: p || '', sourceId, sourceName: source.name, condition };
      }).filter(e => e.email && e.password);
      if (emails.length > 0) onAdd(emails);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Tambah Email</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button onClick={() => setMode('single')} className={`flex-1 py-2 rounded-lg text-sm ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              Single
            </button>
            <button onClick={() => setMode('batch')} className={`flex-1 py-2 rounded-lg text-sm ${mode === 'batch' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
              Batch
            </button>
          </div>

          {/* Source */}
          <div className="flex gap-2">
            <select value={sourceId} onChange={e => setSourceId(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
              {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="Sumber baru..."
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
            <button onClick={handleAddSource} className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm">+</button>
          </div>

          {mode === 'single' ? (
            <>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm" />
            </>
          ) : (
            <textarea value={batchData} onChange={e => setBatchData(e.target.value)}
              placeholder="email1@gmail.com:password1&#10;email2@gmail.com:password2" rows={6}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none" />
          )}

          <select value={condition} onChange={e => setCondition(e.target.value as GmailCondition)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
            <option value="belum_dicek">Belum Dicek</option>
            <option value="aktif">Aktif</option>
            <option value="suspend">Suspend</option>
            <option value="verifikasi_nomor">Verifikasi Nomor</option>
            <option value="tidak_bisa_login">Tidak Bisa Login</option>
            <option value="lainnya">Lainnya</option>
          </select>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">Batal</button>
            <button onClick={handleSubmit} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Tambah</button>
          </div>
        </div>
      </div>
    </div>
  );
}
