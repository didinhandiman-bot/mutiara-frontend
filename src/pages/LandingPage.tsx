import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../sections/HeroSection';
import { LaboratoriumSection } from '../sections/LaboratoriumSection';
import { RegulasiSection } from '../sections/RegulasiSection';
import { RegistrasiSection } from '../sections/RegistrasiSection';
import { DataSection } from '../sections/DataSection';
import { SertifikasiSection } from '../sections/SertifikasiSection';
import { Footer } from '../components/layout/Footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Header / Top Navbar */}
      <Navbar />

      {/* 2. Konten Utama Landing Page */}
      <main className="flex-1">
        <HeroSection />
        <LaboratoriumSection />
        <RegulasiSection />
        <RegistrasiSection />
        <DataSection />
        <SertifikasiSection />
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
};
