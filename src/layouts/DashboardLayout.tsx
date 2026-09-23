import { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { logoutUser, type UserProfile } from '../services/authService';
import { navItems } from '../config/navigation';
import { getCurrentUserRole, hasRoleAccess } from '../utils/role';
import type { NavItem } from '../types/dashboard';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState<UserProfile | null>(() => {
    try {
      const userRaw = localStorage.getItem('user');
      return userRaw ? (JSON.parse(userRaw) as UserProfile) : null;
    } catch {
      return null;
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [role] = useState(() => getCurrentUserRole());
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logoutUser();
    navigate('/login', { replace: true });
  };

  const isPathActive = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      return item.children.some((child) => isPathActive(child.path));
    }
    return isPathActive(item.path);
  };

  const visibleNavItems = navItems.filter(
    (item) => !item.hidden && hasRoleAccess(role, item.roles)
  );

  const toggleMenu = (itemId: string) => {
    setOpenMenus((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

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
        <nav className="space-y-1.5 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const hasChildren = !!item.children && item.children.length > 0;
            const visibleChildren = (item.children ?? []).filter((child) =>
              hasRoleAccess(role, child.roles)
            );
            const active = isItemActive(item);
            const expanded = openMenus[item.id] ?? active;

            if (hasChildren) {
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-slate-400">
                      {expanded ? '▾' : '▸'}
                    </span>
                  </button>

                  {expanded && (
                    <div className="mt-1 space-y-1 border-l border-slate-700 pl-3 ml-2">
                      {visibleChildren.map((child) => (
                        <Link
                          key={child.id}
                          to={child.path ?? '#'}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            isPathActive(child.path)
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path ?? '#'}
                onClick={() => setIsSidebarOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
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