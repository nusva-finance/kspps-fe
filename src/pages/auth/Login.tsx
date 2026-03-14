import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Lock, User as UserIcon, ArrowRight, RefreshCw } from 'lucide-react';

const Login = () => {
  // Ganti state email menjadi username
  const [username, setUsername] = useState('admin'); 
  const [password, setPassword] = useState('Admin2026');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Panggil fungsi login store dengan username dan password
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Username atau password salah.');
      }
    } catch (err: any) {
      // Tangkap pesan error dari backend jika ada
      setError(err.response?.data?.error || 'Gagal login. Periksa koneksi backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0A1628]">
      {/* Background Effects tetap sama */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-cyan/5 blur-[120px]" />
        <div className="absolute top-[80%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div className="rounded-[24px] p-10 border border-white/10 backdrop-blur-[20px] bg-white/5 shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0FA3B1] to-[#1ECAD3] rounded-[14px] flex items-center justify-center text-2xl shadow-[0_8px_24px_rgba(15,163,177,0.4)]">
              🕌
            </div>
            <div>
              <strong className="block font-fraunces text-[18px] text-white font-semibold leading-tight">Nusva Admin</strong>
              <span className="text-[11px] text-cyan uppercase tracking-[1.5px] font-medium">Syariah Digital</span>
            </div>
          </div>

          <h2 className="font-fraunces text-2xl font-bold text-white mb-1">Selamat Datang</h2>
          <p className="text-[13px] text-white/45 mb-8">Masuk dengan akun administrator anda</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[12px] font-semibold text-white/50 tracking-wider uppercase">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan/50 focus:bg-cyan/5 outline-none transition-all placeholder:text-white/20"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-semibold text-white/50 tracking-wider uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyan/50 focus:bg-cyan/5 outline-none transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#0FA3B1] to-[#1ECAD3] hover:from-[#1ECAD3] hover:to-[#0FA3B1] text-white font-bold rounded-xl shadow-[0_8px_24px_rgba(15,163,177,0.35)] transition-all duration-200"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Masuk ke Admin Panel
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;