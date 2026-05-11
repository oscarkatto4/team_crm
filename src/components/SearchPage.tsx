import { useState } from 'react';
import { Search, Database, Globe } from 'lucide-react';
import type { User, WorkEntry, ExternalSource } from '../types';
import { formatWIBDate } from '../utils/helpers';

interface Props {
  currentUser: User;
  workEntries: WorkEntry[];
  externalSources: ExternalSource[];
}

export default function SearchPage({ workEntries, externalSources }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ internal: WorkEntry[]; external: { source: string; data: any[] }[] }>({ internal: [], external: [] });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    
    // Search internal
    const internal = workEntries.filter(e => e.avatarId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Search external (simulated - in real app, would fetch from Apps Script)
    const external: { source: string; data: any[] }[] = [];
    for (const src of externalSources.filter(s => s.isActive)) {
      // In real implementation, fetch from src.webAppUrl
      // For demo, we'll show empty results
      external.push({ source: src.sourceName, data: [] });
    }
    
    setResults({ internal, external });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-7 h-7 text-blue-400" />
          Search Avatar ID
        </h1>
        <p className="text-slate-400 text-sm mt-1">Cari ID dari database internal dan external spreadsheet</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Masukkan Avatar ID..."
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
            Cari
          </button>
        </div>
      </div>

      {/* Results */}
      {(results.internal.length > 0 || results.external.some(e => e.data.length > 0)) && (
        <div className="space-y-4">
          {/* Internal Results */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-emerald-400" />
              Database Internal ({results.internal.length})
            </h2>
            {results.internal.length === 0 ? (
              <p className="text-slate-500 text-sm">Tidak ditemukan di database internal</p>
            ) : (
              <div className="space-y-2">
                {results.internal.map(entry => (
                  <div key={entry.id} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-mono">{entry.avatarId}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === 'sukses' ? 'bg-emerald-500/20 text-emerald-300' :
                        entry.status === 'gagal' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>{entry.status}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {entry.operatorName} • {formatWIBDate(entry.date)} • {entry.projectName} • {entry.taskName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* External Results */}
          {results.external.map((ext, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-400" />
                {ext.source} ({ext.data.length})
              </h2>
              {ext.data.length === 0 ? (
                <p className="text-slate-500 text-sm">Tidak ditemukan di {ext.source}</p>
              ) : (
                <div className="space-y-2">
                  {ext.data.map((d, j) => (
                    <div key={j} className="bg-slate-700/30 rounded-lg p-3">
                      <pre className="text-sm text-slate-300">{JSON.stringify(d, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {searchTerm && !loading && results.internal.length === 0 && results.external.every(e => e.data.length === 0) && (
        <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Tidak ada hasil untuk "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
