import { useState } from 'react';
import { Settings, Save, Image } from 'lucide-react';
import type { AppSettings } from '../types';

interface Props {
  appSettings: AppSettings;
  onUpdate: (data: Partial<AppSettings>) => void;
}

export default function AppSettingsPage({ appSettings, onUpdate }: Props) {
  const [form, setForm] = useState({
    appTitle: appSettings.appTitle,
    appSubtitle: appSettings.appSubtitle,
    logoUrl: appSettings.logoUrl,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-400" />
          App Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">Konfigurasi tampilan aplikasi</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Logo URL</label>
            <input
              value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
            />
            {form.logoUrl && (
              <div className="mt-2 p-3 bg-slate-700/50 rounded-lg inline-block">
                <img src={form.logoUrl} alt="Preview" className="h-10 object-contain" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Judul Aplikasi</label>
            <input
              value={form.appTitle}
              onChange={e => setForm(f => ({ ...f, appTitle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Subtitle</label>
            <input
              value={form.appSubtitle}
              onChange={e => setForm(f => ({ ...f, appSubtitle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 max-w-xl">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Preview</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="" className="w-8 h-8 object-contain" />
            ) : (
              <Image className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-white">{form.appTitle || 'App Title'}</h2>
            <p className="text-slate-400 text-sm">{form.appSubtitle || 'Subtitle'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
