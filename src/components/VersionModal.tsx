import { X, Tag, Bug, Palette, Shield, Database } from 'lucide-react';
import type { VersionUpdate } from '../types';
import { formatWIBDate } from '../utils/helpers';

interface Props {
  version: VersionUpdate;
  onClose: () => void;
}

export default function VersionModal({ version, onClose }: Props) {
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

  const Icon = typeIcons[version.updateType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{version.versionName}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${typeColors[version.updateType]}`}>
              <Icon className="w-3 h-3" /> {version.updateType}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-slate-400 text-sm mb-4">Release: {formatWIBDate(version.releaseDate)}</p>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Changelog:</h3>
          <ul className="space-y-2">
            {version.updateDetails.map((detail, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {detail}
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4">Oleh: {version.createdBy}</p>
        </div>
        <div className="p-5 border-t border-slate-700">
          <button onClick={onClose} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
