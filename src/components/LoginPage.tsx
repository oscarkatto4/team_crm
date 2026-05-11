import { useState } from 'react';
import { Lock, User, LogIn, Shield } from 'lucide-react';

interface Props {
  onLogin: (username: string, password: string) => { success: boolean; error?: string };
  appSettings: { appTitle: string; appSubtitle: string; logoUrl: string };
  versionName: string;
}

export default function LoginPage({ onLogin, appSettings, versionName }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const result = onLogin(username, password);
      if (!result.success) {
        setError(result.error || 'Login gagal');
      }
      setLoading(false);
    }, 500);
  };

  const demoAccounts = [
    { label: 'Superadmin', user: 'superadmin', pass: 'superadmin123', color: 'bg-red-500' },
    { label: 'Supervisor', user: 'spv-rina', pass: 'spv123', color: 'bg-amber-500' },
    { label: 'Operator', user: 'op-gunawan', pass: 'op123', color: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
              {appSettings.logoUrl ? (
                <img src={appSettings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <Shield className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">{appSettings.appTitle}</h1>
            <p className="text-slate-400 mt-1">{appSettings.appSubtitle}</p>
            <span className="inline-block mt-2 text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
              {versionName}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-3">Demo Akun (klik untuk mengisi)</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.user}
                  onClick={() => { setUsername(acc.user); setPassword(acc.pass); setError(''); }}
                  className="text-xs py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 transition-all text-center"
                >
                  <div className={`w-2 h-2 ${acc.color} rounded-full mx-auto mb-1`} />
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-4">
          © 2024 Team Work Recap System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
