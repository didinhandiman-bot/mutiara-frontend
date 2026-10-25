import React, { useState, useMemo } from 'react';
import { BarChart } from '../components/common/BarChart';

// --- TIPE DATA PEMBINAAN BPPMHKP ---
export type KategoriSektor = 'Primer' | 'Pengolahan';

// 6 Sertifikasi Sektor Primer
export type SubSektorPrimer =
  | 'Budidaya - CPIB (Pembenihan)'
  | 'Budidaya - CBIB (Pembesaran)'
  | 'Kapal - CPIB Kapal'
  | 'Obat Ikan - CDOIB (Distribusi)'
  | 'Obat Ikan - CPOIB (Pembuatan)'
  | 'Pakan Ikan - CPPIB (Pakan)';

// 3 Sertifikasi Sektor Pengolahan
export type SubSektorPengolahan = 'SKP' | 'HACCP' | 'SPDI';

export type SubSektor = SubSektorPrimer | SubSektorPengolahan;

export type StatusPembinaan = 'Belum Dibina' | 'Sedang Didampingi' | 'Perbaikan CAPA' | 'Selesai Pembinaan';
export type RatingKelayakan = 'A' | 'B' | 'C' | 'Belum Dinilai';

export interface UnitPembinaanItem {
  id: string;
  namaUnit: string;
  nib: string;
  kontak: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  kategori: KategoriSektor;
  subSektor: SubSektor;
  uptPembina: string;
  petugasPembina: string;
  tglPelaksanaan: string;
  status: StatusPembinaan;
  rating: RatingKelayakan;
  readinessScore: number;
  sumberData: 'SIAP MUTU' | 'Pipeline Pemda/Ditjen';
  targetSertifikasi: string;
  estimasiAudit: string;
  indikatorKesiapan: {
    dokumenSOP: boolean;
    saranaPrasarana: boolean;
    sanitasiHigiene: boolean;
  };
}

// --- DUMMY DATA LENGKAP 6 SKEMA PRIMER & 3 PENGOLAHAN ---
const mockPembinaanList: UnitPembinaanItem[] = [
  // 1. Budidaya - CPIB
  {
    id: 'PB-PRM-001',
    namaUnit: 'Balai Benih Ikan Air Tawar Mandiri',
    nib: '9120003418291',
    kontak: '0812-3456-7890 (Ir. Dadang Suhendar)',
    alamat: 'Jl. Raya Wanayasa KM 14',
    kabupaten: 'Purwakarta',
    provinsi: 'Jawa Barat',
    kategori: 'Primer',
    subSektor: 'Budidaya - CPIB (Pembenihan)',
    uptPembina: 'BPPMHKP Jakarta',
    petugasPembina: 'Ahmad Fauzi, S.St.Pi',
    tglPelaksanaan: '2026-09-14',
    status: 'Selesai Pembinaan',
    rating: 'A',
    readinessScore: 94,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'CPIB Hatchery / Pembenihan',
    estimasiAudit: '2026-11-10',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: true, sanitasiHigiene: true },
  },
  // 2. Budidaya - CBIB
  {
    id: 'PB-PRM-002',
    namaUnit: 'Tambak Udang Vaname Berkah Bahari',
    nib: '9120007821920',
    kontak: '0813-8822-1920 (H. Sulaeman)',
    alamat: 'Kawasan Pesisir Ciasem',
    kabupaten: 'Subang',
    provinsi: 'Jawa Barat',
    kategori: 'Primer',
    subSektor: 'Budidaya - CBIB (Pembesaran)',
    uptPembina: 'BPPMHKP Jakarta',
    petugasPembina: 'Hendri Kurniawan, S.Pi',
    tglPelaksanaan: '2026-09-28',
    status: 'Selesai Pembinaan',
    rating: 'A',
    readinessScore: 91,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'CBIB Pembesaran Intensif',
    estimasiAudit: '2026-11-15',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: true, sanitasiHigiene: true },
  },
  // 3. Kapal - CPIB Kapal
  {
    id: 'PB-PRM-003',
    namaUnit: 'KM Bahari Samudera 08 (58 GT)',
    nib: '8120009182736',
    kontak: '0813-9876-1234 (Capt. Darmawan)',
    alamat: 'Dermaga Barat Pelabuhan Perikanan Samudera',
    kabupaten: 'Cilacap',
    provinsi: 'Jawa Tengah',
    kategori: 'Primer',
    subSektor: 'Kapal - CPIB Kapal',
    uptPembina: 'BPPMHKP Semarang',
    petugasPembina: 'Budi Santoso, M.Pi',
    tglPelaksanaan: '2026-10-02',
    status: 'Perbaikan CAPA',
    rating: 'B',
    readinessScore: 78,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'CPIB Kapal Penangkap Ikan',
    estimasiAudit: '2026-11-25',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: false, sanitasiHigiene: true },
  },
  // 4. Obat Ikan - CDOIB (Distribusi)
  {
    id: 'PB-PRM-004',
    namaUnit: 'CV Medika Akuatika Sejahtera',
    nib: '7120001298471',
    kontak: '0821-4567-8901 (Drh. Melani)',
    alamat: 'Kawasan Industri Candi Blok C-5',
    kabupaten: 'Semarang',
    provinsi: 'Jawa Tengah',
    kategori: 'Primer',
    subSektor: 'Obat Ikan - CDOIB (Distribusi)',
    uptPembina: 'BPPMHKP Semarang',
    petugasPembina: 'Siti Rahmawati, M.Si',
    tglPelaksanaan: '2026-10-18',
    status: 'Sedang Didampingi',
    rating: 'B',
    readinessScore: 74,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'CDOIB Distributor Obat Ikan',
    estimasiAudit: '2026-12-05',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: true, sanitasiHigiene: false },
  },
  // 5. Obat Ikan - CPOIB (Pembuatan/Produsen)
  {
    id: 'PB-PRM-005',
    namaUnit: 'PT Bio Farma Akuatik Nusantara',
    nib: '7120009988112',
    kontak: '0812-4455-6677 (Apoteker Rian)',
    alamat: 'Kawasan Industri Jababeka Tahap II',
    kabupaten: 'Bekasi',
    provinsi: 'Jawa Barat',
    kategori: 'Primer',
    subSektor: 'Obat Ikan - CPOIB (Pembuatan)',
    uptPembina: 'BPPMHKP Jakarta',
    petugasPembina: 'drh. Agus Prasetyo',
    tglPelaksanaan: '2026-10-19',
    status: 'Sedang Didampingi',
    rating: 'B',
    readinessScore: 82,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'CPOIB Pabrik Formulasi Obat Ikan',
    estimasiAudit: '2026-12-10',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: true, sanitasiHigiene: true },
  },
  // 6. Pakan Ikan - CPPIB
  {
    id: 'PB-PRM-006',
    namaUnit: 'PT Nutrisi Akuakultur Prima',
    nib: '4120008899123',
    kontak: '0811-9988-7766 (Wawan Setiawan)',
    alamat: 'Jl. Raya Cikande KM 12',
    kabupaten: 'Serang',
    provinsi: 'Banten',
    kategori: 'Primer',
    subSektor: 'Pakan Ikan - CPPIB (Pakan)',
    uptPembina: 'BPPMHKP Serang',
    petugasPembina: 'Dra. Nurhayati, Apt',
    tglPelaksanaan: '2026-10-12',
    status: 'Perbaikan CAPA',
    rating: 'B',
    readinessScore: 76,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'CPPIB Produsen Pakan Ikan Mandiri',
    estimasiAudit: '2026-12-08',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: false, sanitasiHigiene: true },
  },
  // 7. Pengolahan - HACCP
  {
    id: 'PB-PGL-001',
    namaUnit: 'PT Lautan Jaya Abadi',
    nib: '0120004561234',
    kontak: '0811-2233-4455 (Bambang Sugeng)',
    alamat: 'Kawasan Pelabuhan Muara Baru Blok D',
    kabupaten: 'Jakarta Utara',
    provinsi: 'DKI Jakarta',
    kategori: 'Pengolahan',
    subSektor: 'HACCP',
    uptPembina: 'BPPMHKP Jakarta',
    petugasPembina: 'Hendri Kurniawan, S.Pi',
    tglPelaksanaan: '2026-08-20',
    status: 'Selesai Pembinaan',
    rating: 'A',
    readinessScore: 96,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'HACCP Grade A (Tuna Loin)',
    estimasiAudit: '2026-11-05',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: true, sanitasiHigiene: true },
  },
  // 8. Pengolahan - SKP
  {
    id: 'PB-PGL-002',
    namaUnit: 'UPI Mina Lestari Mandiri',
    nib: '2120006789123',
    kontak: '0852-6789-0123 (Ibu Warsini)',
    alamat: 'Sentra Pengolahan Hasil Ikan No. 4',
    kabupaten: 'Pati',
    provinsi: 'Jawa Tengah',
    kategori: 'Pengolahan',
    subSektor: 'SKP',
    uptPembina: 'BPPMHKP Semarang',
    petugasPembina: 'Rina Kusuma, S.Pi',
    tglPelaksanaan: '2026-10-10',
    status: 'Perbaikan CAPA',
    rating: 'B',
    readinessScore: 71,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'SKP Pembekuan Ikan Pelagis',
    estimasiAudit: '2026-12-01',
    indikatorKesiapan: { dokumenSOP: false, saranaPrasarana: true, sanitasiHigiene: true },
  },
  // 9. Pengolahan - SPDI
  {
    id: 'PB-PGL-003',
    namaUnit: 'PT Samudera Cold Logistics',
    nib: '3120007890124',
    kontak: '0819-3344-5566 (David Wijaya)',
    alamat: 'Jl. Rungkut Industri III No. 8',
    kabupaten: 'Surabaya',
    provinsi: 'Jawa Timur',
    kategori: 'Pengolahan',
    subSektor: 'SPDI',
    uptPembina: 'BPPMHKP Surabaya',
    petugasPembina: 'Tri Haryanto, M.M',
    tglPelaksanaan: '2026-10-22',
    status: 'Sedang Didampingi',
    rating: 'B',
    readinessScore: 68,
    sumberData: 'SIAP MUTU',
    targetSertifikasi: 'SPDI Distribusi Cold-chain Ikan',
    estimasiAudit: '2026-12-15',
    indikatorKesiapan: { dokumenSOP: true, saranaPrasarana: false, sanitasiHigiene: false },
  },
  // 10. Pipeline Usulan Daerah
  {
    id: 'POT-DJP-001',
    namaUnit: 'Pokdakan Barokah Pasawahan',
    nib: '1120009876543',
    kontak: '0878-1122-3344 (Wahyudi)',
    alamat: 'Desa Pasawahan Kidul RT 03/01',
    kabupaten: 'Purwakarta',
    provinsi: 'Jawa Barat',
    kategori: 'Primer',
    subSektor: 'Budidaya - CBIB (Pembesaran)',
    uptPembina: 'BPPMHKP Bandung',
    petugasPembina: 'Pendamping Teknis Dinas/DJPB',
    tglPelaksanaan: '2026-10-15',
    status: 'Belum Dibina',
    rating: 'Belum Dinilai',
    readinessScore: 65,
    sumberData: 'Pipeline Pemda/Ditjen',
    targetSertifikasi: 'CBIB Kolam Bioflok',
    estimasiAudit: 'Januari 2027',
    indikatorKesiapan: { dokumenSOP: false, saranaPrasarana: true, sanitasiHigiene: false },
  },
];

export const PembinaanPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'semua' | 'primer' | 'pengolahan' | 'pipeline'>('semua');
  const [filterProvinsi, setFilterProvinsi] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<UnitPembinaanItem | null>(null);

  // Filter Data
  const filteredData = useMemo(() => {
    return mockPembinaanList.filter((item) => {
      const matchTab =
        activeTab === 'semua' ? true :
        activeTab === 'primer' ? item.kategori === 'Primer' :
        activeTab === 'pengolahan' ? item.kategori === 'Pengolahan' :
        item.sumberData === 'Pipeline Pemda/Ditjen';

      const matchProvinsi = filterProvinsi === 'semua' || item.provinsi === filterProvinsi;
      const matchStatus = filterStatus === 'semua' || item.status === filterStatus;
      const matchSearch =
        item.namaUnit.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.nib.includes(searchKeyword) ||
        item.subSektor.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchTab && matchProvinsi && matchStatus && matchSearch;
    });
  }, [activeTab, filterProvinsi, filterStatus, searchKeyword]);

  // Statistik Real-time
  const stats = useMemo(() => {
    const totalUnit = mockPembinaanList.length;
    const primer = mockPembinaanList.filter((i) => i.kategori === 'Primer').length;
    const pengolahan = mockPembinaanList.filter((i) => i.kategori === 'Pengolahan').length;
    const pipeline = mockPembinaanList.filter((i) => i.sumberData === 'Pipeline Pemda/Ditjen').length;
    const siapSertifikasi = mockPembinaanList.filter((i) => i.readinessScore >= 80).length;
    const selesaiBina = mockPembinaanList.filter((i) => i.status === 'Selesai Pembinaan').length;

    return { totalUnit, primer, pengolahan, pipeline, siapSertifikasi, selesaiBina };
  }, []);

  // Agregasi Bar Chart 6 Sertifikasi Primer
  const primerBreakdown = useMemo(() => {
    const count = (sub: SubSektor) => mockPembinaanList.filter((i) => i.subSektor === sub).length;
    return {
      labels: ['CPIB Benih', 'CBIB Budidaya', 'CPIB Kapal', 'CDOIB Obat', 'CPOIB Obat', 'CPPIB Pakan'],
      data: [
        count('Budidaya - CPIB (Pembenihan)'),
        count('Budidaya - CBIB (Pembesaran)'),
        count('Kapal - CPIB Kapal'),
        count('Obat Ikan - CDOIB (Distribusi)'),
        count('Obat Ikan - CPOIB (Pembuatan)'),
        count('Pakan Ikan - CPPIB (Pakan)'),
      ],
    };
  }, []);

  const badgeStatus = (status: StatusPembinaan) => {
    switch (status) {
      case 'Selesai Pembinaan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Sedang Didampingi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Perbaikan CAPA':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const badgeRating = (rating: RatingKelayakan) => {
    switch (rating) {
      case 'A':
        return 'bg-emerald-50 text-emerald-700 font-bold border-emerald-300';
      case 'B':
        return 'bg-sky-50 text-sky-700 font-bold border-sky-300';
      case 'C':
        return 'bg-amber-50 text-amber-700 font-bold border-amber-300';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 p-1 text-slate-800">
      {/* HEADER PAGE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <nav className="text-xs text-slate-400">
            <span>Beranda</span> / <span className="font-semibold text-slate-600">Pembinaan Mutu (Internal Terbatas)</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Pembinaan Mutu Hulu & Hilir
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring bimbingan teknis 6 Sertifikasi Primer & 3 Sertifikasi Pengolahan (SIAP MUTU) serta pipeline potensi sertifikasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Integrasi SIAP MUTU: Ready
          </span>
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            Pipeline Terintegrasi
          </span>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Unit Terdata</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats.totalUnit}</p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-medium text-emerald-600">{stats.selesaiBina} Unit</span> selesai bimbingan
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Sertifikasi Primer</p>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">6 Skema</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-blue-700">{stats.primer}</p>
          <p className="mt-1 text-xs text-slate-500">CPIB, CBIB, CPIB Kapal, CDOIB, CPOIB, CPPIB</p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Sertifikasi Pengolahan</p>
            <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">3 Skema</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-teal-700">{stats.pengolahan}</p>
          <p className="mt-1 text-xs text-slate-500">SKP, HACCP, & SPDI</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Potensi Siap Sertifikasi</p>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Skor &ge; 80%</span>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">{stats.siapSertifikasi}</p>
          <p className="mt-1 text-xs text-slate-500">Dari {stats.pipeline} pipeline usulan daerah</p>
        </div>
      </div>

      {/* VISUAL BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Distribusi Sektor Primer (6 Skema)</h3>
              <p className="text-xs text-slate-400">CPIB, CBIB, CPIB Kapal, CDOIB, CPOIB, dan CPPIB</p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">Hulu Mutu</span>
          </div>
          <div className="mt-4 h-52">
            <BarChart
              labels={primerBreakdown.labels}
              data={primerBreakdown.data}
              colors={['#2563eb', '#3b82f6', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc']}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Distribusi Sektor Pengolahan (3 Skema)</h3>
              <p className="text-xs text-slate-400">Jaminan Mutu & Higiene Hilir (SKP, HACCP, SPDI)</p>
            </div>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-600">Hilir Mutu</span>
          </div>
          <div className="mt-4 h-52">
            <BarChart
              labels={['SKP', 'HACCP', 'SPDI']}
              data={[1, 1, 1]}
              colors={['#0d9488', '#14b8a6', '#2dd4bf']}
            />
          </div>
        </div>
      </div>

      {/* FILTER & TAB NAVIGATION */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['semua', 'primer', 'pengolahan', 'pipeline'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'primer' ? 'Primer (6 Skema)' : tab === 'pengolahan' ? 'Pengolahan (3 Skema)' : tab === 'pipeline' ? 'Target Pipeline Daerah' : 'Semua Sektor'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari Unit, NIB, Sektor..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Provinsi:</span>
            <select
              value={filterProvinsi}
              onChange={(e) => setFilterProvinsi(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 outline-none"
            >
              <option value="semua">Semua Wilayah</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Tengah">Jawa Tengah</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
              <option value="Banten">Banten</option>
              <option value="Jawa Timur">Jawa Timur</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Status Tahapan:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="Belum Dibina">Belum Dibina</option>
              <option value="Sedang Didampingi">Sedang Didampingi</option>
              <option value="Perbaikan CAPA">Perbaikan CAPA</option>
              <option value="Selesai Pembinaan">Selesai Pembinaan</option>
            </select>
          </div>

          <span className="ml-auto text-slate-400">
            Menampilkan <strong className="text-slate-700">{filteredData.length}</strong> data unit
          </span>
        </div>
      </div>

      {/* MASTER DATA TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-600">
                <th className="px-5 py-3.5">Pelaku Usaha / NIB</th>
                <th className="px-4 py-3.5">Skema Sertifikasi Mutu</th>
                <th className="px-4 py-3.5">UPT & Tim Pembina</th>
                <th className="px-4 py-3.5">Tanggal Bimbingan</th>
                <th className="px-4 py-3.5">Tahapan & Kelayakan</th>
                <th className="px-4 py-3.5">Skor Kesiapan & Jadwal Audit</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{item.namaUnit}</p>
                    <p className="font-mono text-[11px] text-slate-400">NIB: {item.nib}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.kabupaten}, {item.provinsi}
                    </p>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 font-semibold text-[11px] ${
                        item.kategori === 'Primer'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : 'border-teal-200 bg-teal-50 text-teal-700'
                      }`}
                    >
                      {item.subSektor}
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">Target: {item.targetSertifikasi}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{item.uptPembina}</p>
                    <p className="text-[11px] text-slate-500">PIC: {item.petugasPembina}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-700">{item.tglPelaksanaan}</p>
                    <span className="text-[10px] text-slate-400">Sumber: {item.sumberData}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badgeStatus(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`rounded border px-1.5 py-0.2 text-[10px] ${badgeRating(item.rating)}`}>
                        Rating: {item.rating}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${
                            item.readinessScore >= 80 ? 'bg-emerald-500' : item.readinessScore >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${item.readinessScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-700">{item.readinessScore}%</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Est. Audit: {item.estimasiAudit}</p>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedUnit(item)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-2xs"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL UNIT USAHA */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  {selectedUnit.kategori} - {selectedUnit.subSektor}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-slate-900">{selectedUnit.namaUnit}</h3>
                <p className="text-xs text-slate-400">ID: {selectedUnit.id} | NIB: {selectedUnit.nib}</p>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-400 uppercase">Kontak & Lokasi</p>
                <p className="mt-1 font-medium text-slate-800">{selectedUnit.kontak}</p>
                <p className="text-slate-600">{selectedUnit.alamat}, {selectedUnit.kabupaten}, {selectedUnit.provinsi}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase">Petugas Pelaksana</p>
                <p className="mt-1 font-medium text-slate-800">{selectedUnit.uptPembina}</p>
                <p className="text-slate-600">Inspektur: {selectedUnit.petugasPembina}</p>
                <p className="text-slate-400">Tanggal: {selectedUnit.tglPelaksanaan}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-700 uppercase">Indikator Pemenuhan Kesiapan</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className={`rounded-lg border p-2 text-center ${selectedUnit.indikatorKesiapan.dokumenSOP ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  Dokumen SOP: {selectedUnit.indikatorKesiapan.dokumenSOP ? '✓ Sesuai' : '✗ Belum'}
                </div>
                <div className={`rounded-lg border p-2 text-center ${selectedUnit.indikatorKesiapan.saranaPrasarana ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  Sarana Prasarana: {selectedUnit.indikatorKesiapan.saranaPrasarana ? '✓ Layak' : '✗ Perbaikan'}
                </div>
                <div className={`rounded-lg border p-2 text-center ${selectedUnit.indikatorKesiapan.sanitasiHigiene ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  Sanitasi & Higiene: {selectedUnit.indikatorKesiapan.sanitasiHigiene ? '✓ Memenuhi' : '✗ Temuan'}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/70 p-3 text-xs">
              <div>
                <p className="font-semibold text-blue-900">Target: {selectedUnit.targetSertifikasi}</p>
                <p className="text-blue-700">Estimasi Pelaksanaan Audit: <strong>{selectedUnit.estimasiAudit}</strong></p>
              </div>
              <span className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white">
                Skor: {selectedUnit.readinessScore}%
              </span>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedUnit(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};