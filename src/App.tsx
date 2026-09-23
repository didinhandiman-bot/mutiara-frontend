import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { LayananPage } from './pages/LayananPage';
import { ProfilPage } from './pages/ProfilPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { IotMonitoringPage } from './pages/IotMonitoringPage';
import { UsersPage } from './pages/UsersPage';
import { PembinaanPage } from './pages/PembinaanPage';
import { PengawasanMutuPrimerPage } from './pages/PengawasanMutuPrimerPage';
import { PengawasanManajemenMutuOcPage } from './pages/PengawasanManajemenMutuOcPage';
import { EksekutifPage } from './pages/EksekutifPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { RoleGuard } from './components/common/RoleGuard';
import { ROUTE_ROLES } from './config/navigation';

export function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
