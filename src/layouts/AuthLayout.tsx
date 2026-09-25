import { Outlet } from 'react-router-dom';

/**
 * Shell untuk halaman autentikasi (login).
 *
 * Sengaja minimal: hanya menyediakan latar & tinggi layar penuh. Konten
 * (LoginPage) tetap mengatur tata letaknya sendiri sehingga tidak ada
 * perubahan visual. Layout ini di-import statis dari App.tsx agar tidak
 * flicker saat rute berpindah.
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Outlet />
    </div>
  );
};
