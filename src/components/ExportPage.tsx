import { useState } from 'react';
import { Download, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { User, WorkEntry, CheckingRecord, ExternalSource, BackupLog } from '../types';
import { validateWebAppUrl, getWIBDateTime } from '../utils/helpers';

interface Props {
  currentUser: User;
  workEntries: WorkEntry[];
  checkingRecords: CheckingRecord[];
  externalSources: ExternalSource[];
  onAddBackupLog: (log: Omit<BackupLog, 'id'>) => BackupLog;
  onClearEntries: (ids: string[]) => void;
}

export default function ExportPage({ currentUser, workEntries, checkingRecords, externalSources, onAddBackupLog, onClearEntries }: Props) {
  const [selectedSource, setSelectedSource] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const uncheckedCount = checkingRecords.filter(c => c.checkingStatus === 'belum_dicek').length;
  const exportSources = externalSources.filter(s => s.isActive && (s.type === 'export' || s.type === 'both'));

  const handleExportExcel = () => {
    const data = workEntries.map(e => ({
      Tanggal: e.date,
      Operator: e.operatorName,
      Tugas: e.taskName,
      Project: e.projectName,
      'Avatar ID': e.avatarId,
      Proxy: e.proxyLabel,
      Rating: e.rating,
      Lokasi: e.locationName,
      Status: e.status,
      Keterangan: e.description,
      Masalah: e.issue,
      'Checking Status': e.checkingStatus,
      Duplicate: e.duplicateStatus,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Kerja');
    XLSX.writeFile(wb, `export_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleBackup = async () => {
    if (!selectedSource) return;
    const source = externalSources.find(s => s.id === selectedSource);
    if (!source) return;

    const validation = validateWebAppUrl(source.webAppUrl);
    if (!validation.valid) {
      setResult({ success: false, message: validation.error || 'URL tidak valid' });
      return;
    }

    setExporting(true);
    setShowConfirm(false);

    const rows = workEntries.map(e => [
      e.date, e.operatorName, e.taskName, e.projectName, e.avatarId,
      e.proxyLabel, e.rating, e.locationName, e.status, e.description,
      e.issue, e.checkingStatus, e.duplicateStatus
    ]);

    try {
      await fetch(source.webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          sheetName: source.sheetName,
          headers: ['Tanggal', 'Operator', 'Tugas', 'Project', 'Avatar ID', 'Proxy', 'Rating', 'Lokasi', 'Status', 'Keterangan', 'Masalah', 'Checking', 'Duplicate'],
          values: rows,
        }),
      });

      onAddBackupLog({
        type: 'work_data',
        destinationUrl: source.webAppUrl,
        sheetName: source.sheetName,
        totalRows: workEntries.length,
        status: 'success',
        backupBy: currentUser.username,
        backupAt: getWIBDateTime(),
      });

      // Clear entries after backup
      onClearEntries(workEntries.map(e => e.id));
      
      setResult({ success: true, message: `Berhasil backup ${workEntries.length} data ke ${source.sourceName}` });
    } catch (error: any) {
      onAddBackupLog({
        type: 'work_data',
        destinationUrl: source.webAppUrl,
        sheetName: source.sheetName,
        totalRows: workEntries.length,
        status: 'failed',
        errorMessage: error.message,
        backupBy: currentUser.username,
        backupAt: getWIBDateTime(),
      });
      setResult({ success: false, message: error.message || 'Gagal backup' });
    }

    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Download className="w-7 h-7 text-blue-400" />
          Export Data
        </h1>
        <p className="text-slate-400 text-sm mt-1">Export ke Excel atau backup ke Google Spreadsheet</p>
      </div>

      {result && (
        <div className={`rounded-xl p-4 border ${result.success ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center gap-3">
            {result.success ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <AlertTriangle className="w-6 h-6 text-red-400" />}
            <p className={result.success ? 'text-emerald-400' : 'text-red-400'}>{result.message}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Excel Export */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-emerald-400" />
            Export Excel
          </h2>
          <p className="text-slate-400 text-sm mb-4">Download data sebagai file Excel (.xlsx)</p>
          <p className="text-slate-300 mb-4">{workEntries.length} data siap di-export</p>
          <button onClick={handleExportExcel} disabled={workEntries.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            <Download className="w-5 h-5" /> Download Excel
          </button>
        </div>

        {/* Spreadsheet Backup */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Backup ke Spreadsheet
          </h2>
          {uncheckedCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <p className="text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {uncheckedCount} data belum dicek di Checking
              </p>
            </div>
          )}
          <div className="space-y-3 mb-4">
            <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm">
              <option value="">Pilih tujuan spreadsheet</option>
              {exportSources.map(s => <option key={s.id} value={s.id}>{s.sourceName}</option>)}
            </select>
          </div>
          <p className="text-slate-300 mb-4">{workEntries.length} data siap di-backup</p>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!selectedSource || workEntries.length === 0 || exporting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><FileSpreadsheet className="w-5 h-5" /> Backup ke Spreadsheet</>
            )}
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">
                {uncheckedCount > 0 ? 'Masih ada data yang belum dicek' : 'Konfirmasi Backup'}
              </h2>
            </div>
            <p className="text-slate-300 mb-6">
              {uncheckedCount > 0
                ? `Ada ${uncheckedCount} ID yang belum melalui proses checking. Apakah Anda tetap ingin backup dan menghapus database internal?`
                : 'Data yang sudah di-backup akan dihapus dari database internal. Lanjutkan?'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">
                {uncheckedCount > 0 ? 'Tidak, kembali ke Checking' : 'Batal'}
              </button>
              <button onClick={handleBackup} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">
                Ya, tetap backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
