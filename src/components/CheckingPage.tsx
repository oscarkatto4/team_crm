import { useState } from 'react';
import { ClipboardCheck, Plus, Trash2, Filter } from 'lucide-react';
import type { User, CheckingRecord, SocialMediaType, CheckingStatus } from '../types';
import { getWIBDate, formatWIBDateTime } from '../utils/helpers';

interface Props {
  currentUser: User;
  checkingRecords: CheckingRecord[];
  socialMediaTypes: SocialMediaType[];
  onUpdateChecking: (id: string, data: Partial<CheckingRecord>) => void;
  onAddSocialMedia: (name: string) => SocialMediaType;
  onDeleteSocialMedia: (id: string) => void;
}

export default function CheckingPage({ checkingRecords, socialMediaTypes, onUpdateChecking, onAddSocialMedia, onDeleteSocialMedia }: Props) {
  const [filterDate, setFilterDate] = useState(getWIBDate());
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [newSocmed, setNewSocmed] = useState('');

  const activeSocmeds = socialMediaTypes.filter(s => s.isActive);
  
  let filtered = checkingRecords.filter(c => c.createdAt.startsWith(filterDate));
  if (filterStatus) {
    filtered = filtered.filter(c => c.checkingStatus === filterStatus);
  }

  const statusColors: Record<CheckingStatus, string> = {
    ok: 'bg-emerald-600 text-white',
    suspend: 'bg-red-600 text-white',
    logout: 'bg-amber-600 text-white',
    belum_dicek: 'bg-slate-600 text-white',
  };

  const handleStatusChange = (record: CheckingRecord, status: CheckingStatus) => {
    onUpdateChecking(record.id, { checkingStatus: status });
  };

  const handleSocialCheck = (record: CheckingRecord, socmedId: string, checked: boolean) => {
    onUpdateChecking(record.id, {
      socialChecks: { ...record.socialChecks, [socmedId]: checked }
    });
  };

  const handleAddSocmed = () => {
    if (!newSocmed.trim()) return;
    onAddSocialMedia(newSocmed.trim());
    setNewSocmed('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-blue-400" />
            Checking Sosmed
          </h1>
          <p className="text-slate-400 text-sm mt-1">Cek kelengkapan sosmed per Avatar ID</p>
        </div>

        {/* Add Social Media */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSocmed}
            onChange={e => setNewSocmed(e.target.value)}
            placeholder="Tambah sosmed..."
            className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm w-40"
          />
          <button onClick={handleAddSocmed} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Filter className="w-4 h-4" /> Filter:
        </div>
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm"
        >
          <option value="">Semua Status</option>
          <option value="belum_dicek">Belum Dicek</option>
          <option value="ok">OK</option>
          <option value="suspend">Suspend</option>
          <option value="logout">Logout</option>
        </select>
        <span className="text-slate-400 text-sm">{filtered.length} data</span>
      </div>

      {/* Social Media List */}
      <div className="flex flex-wrap gap-2">
        {activeSocmeds.map(sm => (
          <span key={sm.id} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/50 border border-slate-600 rounded-full text-sm text-slate-300">
            {sm.name}
            {!sm.isDefault && (
              <button onClick={() => onDeleteSocialMedia(sm.id)} className="ml-1 text-slate-500 hover:text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Avatar ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Operator</th>
                {activeSocmeds.map(sm => (
                  <th key={sm.id} className="text-center px-3 py-3 text-xs font-medium text-slate-400">{sm.name}</th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Checked By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4 + activeSocmeds.length} className="px-4 py-8 text-center text-slate-500">Tidak ada data</td></tr>
              ) : filtered.map(record => (
                <tr key={record.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="px-4 py-3 text-white font-mono">{record.avatarId}</td>
                  <td className="px-4 py-3 text-slate-300">{record.operatorName}</td>
                  {activeSocmeds.map(sm => (
                    <td key={sm.id} className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={record.socialChecks[sm.id] || false}
                        onChange={e => handleSocialCheck(record, sm.id, e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <select
                      value={record.checkingStatus}
                      onChange={e => handleStatusChange(record, e.target.value as CheckingStatus)}
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[record.checkingStatus]}`}
                    >
                      <option value="belum_dicek">Belum Dicek</option>
                      <option value="ok">OK</option>
                      <option value="suspend">Suspend</option>
                      <option value="logout">Logout</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {record.checkedBy ? `${record.checkedBy} - ${formatWIBDateTime(record.checkedAt)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
