import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/*
 * Layout & guard tetap di-import secara statis (bagian dari "shell" aplikasi).
 * Alasannya: shell harus langsung tersedia supaya sidebar/header tidak flicker
 * saat berpindah halaman di dalam area dashboard.
 */
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGuard } from './components/common/RoleGuard';
import { RouteFallback } from './components/common/RouteFallback';
import { ROUTE_ROLES } from './config/navigation';

/* -------------------------------------------------------------------------- */
/*  CODE SPLITTING — Semua halaman di folder src/pages/ di-lazy-load           */
/*  Setiap halaman menjadi chunk JS terpisah dan hanya diunduh saat rutenya    */
/*  benar-benar dibuka. Halaman memakai named export, jadi hasil import()      */
/*  di-map ke properti `default` yang dibutuhkan React.lazy().                 */
/* -------------------------------------------------------------------------- */
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const LayananPage = lazy(() =>
  import('./pages/LayananPage').then((m) => ({ default: m.LayananPage }))
);
const ProfilPage = lazy(() =>
  import('./pages/ProfilPage').then((m) => ({ default: m.ProfilPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const IotMonitoringPage = lazy(() =>
  import('./pages/IotMonitoringPage').then((m) => ({
    default: m.IotMonitoringPage,
  }))
);
const UsersPage = lazy(() =>
  import('./pages/UsersPage').then((m) => ({ default: m.UsersPage }))
);
const PembinaanPage = lazy(() =>
  import('./pages/PembinaanPage').then((m) => ({ default: m.PembinaanPage }))
);
const PengawasanMutuPrimerPage = lazy(() =>
  import('./pages/PengawasanMutuPrimerPage').then((m) => ({
    default: m.PengawasanMutuPrimerPage,
  }))
);
const PengawasanManajemenMutuOcPage = lazy(() =>
  import('./pages/PengawasanManajemenMutuOcPage').then((m) => ({
    default: m.PengawasanManajemenMutuOcPage,
  }))
);
const EksekutifPage = lazy(() =>
  import('./pages/EksekutifPage').then((m) => ({ default: m.EksekutifPage }))
);
const AccessDeniedPage = lazy(() =>
  import('./pages/AccessDeniedPage').then((m) => ({
    default: m.AccessDeniedPage,
  }))
);

export function App() {
  return (
    <BrowserRouter>
      {/*
       * Suspense level teratas: menangani chunk halaman publik (/ dan /login)
       * yang belum punya layout shell. Untuk rute dashboard, boundary milik
       * DashboardLayout (di sekitar <Outlet />) yang mengambil alih sehingga
       * sidebar & header tetap ter-render tanpa flicker.
       */}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Rute Publik Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Rute Form Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rute Terproteksi (Wajib Login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Rute Monitoring IoT (Realtime) */}
              <Route
                path="/iot-monitoring"
                element={
                  <RoleGuard roles={ROUTE_ROLES['iot-monitoring']}>
                    <IotMonitoringPage />
                  </RoleGuard>
                }
              />
              {/* Rute Layanan Saya (disembunyikan dari sidebar) */}
              <Route path="/layanan" element={<LayananPage />} />

              {/* Rute Baru: Pembinaan */}
              <Route
                path="/pembinaan"
                element={
                  <RoleGuard roles={ROUTE_ROLES.pembinaan}>
                    <PembinaanPage />
                  </RoleGuard>
                }
              />

              {/* Rute Baru: Pengendalian / Pengawasan */}
              <Route
                path="/pengawasan"
                element={<Navigate to="/pengawasan/mutu-primer" replace />}
              />
              <Route
                path="/pengawasan/mutu-primer"
                element={
                  <RoleGuard roles={ROUTE_ROLES.pengawasan}>
                    <PengawasanMutuPrimerPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/pengawasan/manajemen-mutu-oc"
                element={
                  <RoleGuard roles={ROUTE_ROLES.pengawasan}>
                    <PengawasanManajemenMutuOcPage />
                  </RoleGuard>
                }
              />

              {/* Rute Baru: Dashboard Eksekutif */}
              <Route
                path="/eksekutif"
                element={
                  <RoleGuard roles={ROUTE_ROLES.eksekutif}>
                    <EksekutifPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/users"
                element={
                  <RoleGuard roles={ROUTE_ROLES.users}>
                    <UsersPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/profil"
                element={
                  <RoleGuard roles={ROUTE_ROLES.profil}>
                    <ProfilPage />
                  </RoleGuard>
                }
              />

              {/* Halaman Akses Ditolak (RBAC) */}
              <Route path="/akses-ditolak" element={<AccessDeniedPage />} />
            </Route>
          </Route>

          {/* Redirect Rute Tak Dikenal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
