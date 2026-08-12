'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function PremiumGeneratorApp() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Pendaftaran berhasil! Silakan periksa email untuk verifikasi atau langsung login.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses autentikasi.');
    }
  };

  const triggerGenerator = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessData(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memproses pembuatan akses premium.');
      setSuccessData(data.account);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <p className="animate-pulse">Menyiapkan Enkripsi Generator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-600"></div>

        {!user ? (
          <div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">AM PREMIUM HUB</h1>
              <p className="text-xs text-gray-500 mt-1">Autentikasi akun gateway untuk mencegah penyalahgunaan robot otomatis</p>
            </div>

            {errorMsg && <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300">⚠️ {errorMsg}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Alamat Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white" placeholder="name@example.com"/>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Kata Sandi</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white" placeholder="••••••••"/>
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold text-sm rounded-xl">{authMode === 'login' ? 'Masuk ke Dasbor' : 'Daftar Akun Baru'}</button>
            </form>
            <div className="mt-6 text-center text-xs text-gray-500">
              {authMode === 'login' ? 'Belum bergabung? ' : 'Sudah terdaftar? '}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-teal-400 hover:underline font-bold">{authMode === 'login' ? 'Buat Akun' : 'Silakan Login'}</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400">Secure Gateway</span>
                <p className="text-xs text-gray-400 truncate max-w-[180px]">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-xs bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg text-gray-400">Keluar</button>
            </div>

            <div className="text-center my-4">
              <h2 className="text-xl font-extrabold text-white">Alight Motion Premium Generator</h2>
              <p className="text-xs text-gray-400 mt-1">Distribusi otomatis lisensi sistem terenkripsi token harian.</p>
            </div>

            {errorMsg && <div className="my-4 p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">🛑 {errorMsg}</div>}

            <button onClick={triggerGenerator} disabled={loading} className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-xl disabled:bg-gray-800">
              {loading ? 'Menghubungkan Server x-znn...' : 'Mulai Proses Generator'}
            </button>

            {successData && (
              <div className="mt-6 p-4 bg-gray-950 border border-emerald-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">Akses Berhasil Didapatkan</span>
                  <span className="text-[9px] text-gray-500 font-mono">{successData.expired_at}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Email Alight Motion</span>
                    <div className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg font-mono text-xs mt-0.5 text-emerald-400 select-all">{successData.email}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold">Kata Sandi Akun</span>
                    <div className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg font-mono text-xs mt-0.5 text-emerald-400 select-all">{successData.password}</div>
                  </div>
                </div>
                <div className="p-2 bg-yellow-950/20 border border-yellow-700/20 rounded-lg text-[10px] text-yellow-400">{successData.note}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
