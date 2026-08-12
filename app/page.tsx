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

  const [serverLoad, setServerLoad] = useState(42);
  const [stokTersedia, setStokTersedia] = useState(128);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const interval = setInterval(() => {
      setServerLoad(Math.floor(Math.random() * (75 - 35 + 1)) + 35);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Pendaftaran sukses! Silakan periksa email atau langsung login.');
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

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses pembuatan akses premium.');
      }

      setSuccessData(data.account);
      setStokTersedia((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-teal-400 font-mono gap-3">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Menghubungkan Core Gateway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-100 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0d1527] border border-gray-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>

        {!user ? (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-bold text-teal-400 tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span> Secure Access v2.4
              </div>
              <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">
                AM PREMIUM HUB
              </h1>
              <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto">
                Masuk untuk memvalidasi token harian dan mencegah penyalahgunaan sistem oleh bot otomasi.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <span>⚠️</span> <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Alamat Email</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050914] border border-gray-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none transition-all text-white placeholder-gray-600"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Kata Sandi</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050914] border border-gray-800 rounded-xl text-sm focus:border-teal-500 focus:outline-none transition-all text-white"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="w-full py-3.5 mt-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-gray-950 font-extrabold text-sm rounded-xl transition-all">
                {authMode === 'login' ? 'MASUK KE DASBOR' : 'DAFTAR SEKARANG'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-800/40 pt-5">
              {authMode === 'login' ? 'Belum memiliki hak akses? ' : 'Sudah terdaftar di sistem? '}
              <button 
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-teal-400 hover:text-teal-300 font-bold underline transition-colors"
              >
                {authMode === 'login' ? 'Buat Akun Hub' : 'Silakan Login'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6 bg-[#090f1d] border border-gray-800/50 p-3 rounded-2xl">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center font-bold text-gray-950 text-xs shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] uppercase font-bold text-teal-400 block tracking-widest">Active Client</span>
                  <p className="text-xs text-gray-300 truncate max-w-[160px] font-mono">{user.email}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="text-[11px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-xl text-red-400 font-semibold transition-all"
              >
                Log Out
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#050914] border border-gray-800/40 p-3 rounded-xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status Server</span>
                <span className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE
                </span>
              </div>
              <div className="bg-[#050914] border border-gray-800/40 p-3 rounded-xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Est. Sisa Stok</span>
                <span className="text-xs text-teal-400 font-mono font-bold mt-1">{stokTersedia} Akun</span>
              </div>
            </div>

            <div className="text-center my-6">
              <h2 className="text-2xl font-black tracking-tight text-white">Alight Motion Premium</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Klik tombol picu di bawah untuk melakukan kloning data lisensi premium via api.znn.my.id.
              </p>
            </div>

            {errorMsg && (
              <div className="my-5 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs text-red-300 leading-relaxed">
                🛑 <strong>Sistem Keamanan Menolak:</strong> {errorMsg}
              </div>
            )}

            <button 
              type="button"
              onClick={triggerGenerator}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.25)]"
            >
              {loading ? 'BYPASSING ACCESS PROTOCOL...' : 'AMBIL AKSES PREMIUM AM'}
            </button>

            {successData && (
              <div className="mt-6 p-4 bg-[#050914] border border-emerald-500/30 rounded-2xl space-y-4 relative">
                <div className="absolute top-0 right-4 -translate-y-1/2">
        {!user ? (
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-bold text-teal-400 tracking-wider uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span> Secure Access v2.4
              </div>
              <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500">
                AM PREMIUM HUB
              </h1>
              <p className="text-xs text-gray-400 mt-1.5 max-w-sm mx-auto">
                Masuk untuk memvalidasi token harian dan mencegah penyalahgunaan sistem oleh bot otomasi.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-950/30 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-shake">
                <span>⚠️</span> <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Alamat Email</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050914] border border-gray-800 rounded-xl text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all text-white placeholder-gray-600"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Kata Sandi</label>
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#050914] border border-gray-800 rounded-xl text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all text-white placeholder-••••••••"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="w-full py-3.5 mt-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:opacity-90 active:scale-[0.99] text-gray-950 font-extrabold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(20,184,166,0.25)]">
                {authMode === 'login' ? 'MASUK KE DASBOR' : 'DAFTAR SEKARANG'}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-800/40 pt-5">
              {authMode === 'login' ? 'Belum memiliki hak akses? ' : 'Sudah terdaftar di sistem? '}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-teal-400 hover:text-teal-300 font-bold underline transition-colors"
              >
                {authMode === 'login' ? 'Buat Akun Hub' : 'Silakan Login'}
              </button>
            </div>
          </div>
        ) : (
          /* 2. TAMPILKAN LAYAR GENERATOR UTAMA (UI SUPER MEWAH) */
          <div>
            {/* Header Profil User */}
            <div className="flex justify-between items-center mb-6 bg-[#090f1d] border border-gray-800/50 p-3 rounded-2xl">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center font-bold text-gray-950 text-xs shadow-md">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] uppercase font-bold text-teal-400 block tracking-widest">Active Client</span>
                  <p className="text-xs text-gray-300 truncate max-w-[160px] font-mono">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-[11px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-xl text-red-400 font-semibold transition-all"
              >
                Log Out
              </button>
            </div>

            {/* Widget Status Server Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#050914] border border-gray-800/40 p-3 rounded-xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Status Server</span>
                <span className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE (NORMAL)
                </span>
              </div>
              <div className="bg-[#050914] border border-gray-800/40 p-3 rounded-xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Est. Sisa Stok</span>
                <span className="text-xs text-teal-400 font-mono font-bold mt-1">{stokTersedia} Akun Tersedia</span>
              </div>
            </div>

            {/* Konten Sentral Deskripsi */}
            <div className="text-center my-6">
              <h2 className="text-2xl font-black tracking-tight text-white">Alight Motion Premium</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Klik tombol picu di bawah untuk melakukan kloning data lisensi premium via api.znn.my.id.
              </p>
            </div>

            {/* Kotak Notifikasi Error */}
            {errorMsg && (
              <div className="my-5 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs text-red-300 leading-relaxed shadow-inner">
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

