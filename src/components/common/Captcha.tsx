import React, { useEffect, useState, useCallback } from 'react';

interface CaptchaProps {
  onCaptchaChange: (code: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({
  onCaptchaChange,
  value,
  onChange,
}) => {
  const [captchaCode, setCaptchaCode] = useState('');

  // Menghasilkan kode captcha acak
  const generateCaptcha = useCallback(() => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    onCaptchaChange(result); // Kirim kode terbaru ke parent component
    onChange(''); // Reset input user
  }, [onCaptchaChange, onChange]);

  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Verifikasi CAPTCHA
      </label>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-slate-200 text-slate-800 font-mono font-bold text-lg tracking-widest text-center py-2 rounded-lg border border-slate-300 select-none line-through italic">
          {captchaCode}
        </div>
        <button
          type="button"
          onClick={generateCaptcha}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm transition-colors cursor-pointer"
          title="Acak Ulang CAPTCHA"
        >
          🔄
        </button>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
        placeholder="Masukkan kode di atas"
        required
      />
    </div>
  );
};