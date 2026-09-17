import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../services/authService';
import { Captcha } from '../components/common/Captcha';

export const LoginPage = () => {
  const navigate = useNavigate();

  // State Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State Captcha
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [userCaptcha, setUserCaptcha] = useState('');

  // State UI status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validasi Captcha
    if (userCaptcha !== generatedCaptcha) {
      setErrorMessage('Kode CAPTCHA yang Anda masukkan salah!');
      return;
    }

    setLoading(true);

    try {
      // const res = await loginApi({ email, password, captcha: userCaptcha });
      
      // Kirim sebagai type assertion ( bypass sementara pembatasan tipe )  
      const res = await loginApi({ email, password, captcha: userCaptcha } as any);

      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Gagal terhubung ke server backend';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full space-y-6 border border-slate-200">
        
        {/* Header Logo & Judul */}
        <div className="text-center">
          <div className="inline-block bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-lg mb-3">
            BPPMHKP
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Masuk Akun</h2>
          <p className="text-sm text-slate-600 mt-1">
            Sistem Informasi Terpadu Layanan BPPMHKP
          </p>
        </div>

        {/* Pesan Error */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              placeholder="budi@bppmhkp.go.id"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Reusable Captcha Component */}
          <Captcha
            onCaptchaChange={setGeneratedCaptcha}
            value={userCaptcha}
            onChange={setUserCaptcha}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors cursor-pointer shadow-md"
          >
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
};
