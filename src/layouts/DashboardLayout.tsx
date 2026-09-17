import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { logoutUser, type UserProfile } from '../services/authService';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      try {
        setUser(JSON.parse(userRaw));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/layanan', label: 'Layanan Saya' },
    { path: '/profil', label: 'Profil Saya' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Overlay Backdrop Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white p-4 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Header Sidebar */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-bold text-white tracking-wide">
            BPPMHKP App
          </h2>
          {/* Tombol Tutup Sidebar (Mobile) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigasi Utama */}
        <nav className="space-y-1.5 flex-1">
          {navLinks.map((link) => {
            // Memastikan penanda aktif berfungsi dengan presisi untuk /dashboard dan /layanan (termasuk sub-route /layanan/...)
            const isActive =
              link.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`block py-2.5 px-4 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card di Bagian Bawah Sidebar */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.nama || 'Pengguna'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || 'user@bppmhkp.go.id'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            {/* Tombol Hamburger Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              ☰
            </button>
            <span className="font-semibold text-slate-800 text-sm md:text-base">
              Selamat Datang,{' '}
              <span className="text-blue-600 font-bold">
                {user?.nama || 'User'}
              </span>
            </span>
          </div>

          {/* User Info & Logout Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dynamic Main Content (DashboardPage / LayananPage) */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};