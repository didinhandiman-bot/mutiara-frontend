import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { LayananPage } from './pages/LayananPage';
import { ProfilPage } from './pages/ProfilPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

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
            {/* Rute Layanan Saya yang Baru Ditambahkan */}
            <Route path="/layanan" element={<LayananPage />} />
            <Route path="/profil" element={<ProfilPage />} />
          </Route>
        </Route>

        {/* Redirect Rute Tak Dikenal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;