import { useEffect, useState } from 'react';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { pengawasanData } from '../mocks/dashboardData';
// Tipe dipakai ulang dari section landing agar struktur respons API tetap satu sumber
// (type-only, ikut terhapus saat compile sehingga tidak menambah dependensi runtime)
import type { SertifikasiKpiData } from '../sections/SertifikasiSection';

// ==========================================================================
// KPI Sertifikasi agregat — endpoint publik mutiara-backend
//   GET /api/v1/public/sertifikasi-kpi?year=<tahun|all>
// ==========================================================================

// Base URL backend. Prioritas:
// 1. VITE_API_BASE_URL
// 2. Turunan dari VITE_API_URL_AUTH (akhiran /auth dibuang)
// 3. Fallback backend lokal (port 5007)
const AUTH_URL = import.meta.env.VITE_API_URL_AUTH as string | undefined;

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  AUTH_URL?.replace(/\/auth\/?$/, '') ||
  'http://localhost:5007'
).replace(/\/+$/, '');

// Opsi dropdown "Rentang Waktu / Tahun" pada header halaman
const TAHUN_OPTIONS = ['2026', '2025', '2024', 'all'] as const;
type TahunOption = (typeof TAHUN_OPTIONS)[number];

const TAHUN_LABEL: Record<TahunOption, string> = {
  '2026': 'Tahun 2026',
  '2025': 'Tahun 2025',
  '2024': 'Tahun 2024',
  all: 'Semua Tahun',
};

// Data lokal cadangan: dipakai saat API tidak terjangkau agar halaman tetap tampil penuh
// (snapshot "Semua Tahun"; SPDI kini live dari backend — 72 sertifikat terbit 2026)
const KPI_FALLBACK: SertifikasiKpiData = {
  total_nasional: 40819,
  pasca_panen: { total: 37838, items: { SKP: 13624, HACCP: 24142, SPDI: 72 } },
  primer: {
    total: 2981,
    items: { CPIB: 172, CBIB: 741, CPPIB: 31, CPOIB: 33, CDOIB: 23, CPIB_KAPAL: 1981 },
  },
  selected_year: 'all',
  updated_at: '2026-10-25T04:26:08.834Z',
};

type SumberKpi = 'memuat' | 'api' | 'lokal';

const sumberKpiLabel: Record<SumberKpi, string> = {
  memuat: 'Memuat data…',
  api: 'Live · API publik',
  lokal: 'Data lokal (fallback)',
};

// Format angka dengan pemisah ribuan ala Indonesia: 40.747, 13.624
const idNumber = new Intl.NumberFormat('id-ID');

const formatAngka = (value: number | null | undefined): string => {
  const num = Number(value);
  return idNumber.format(Number.isFinite(num) ? Math.max(0, Math.trunc(num)) : 0);
};

const idDateTime = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

// Format timestamp ISO dari API menjadi waktu yang terbaca
const formatWaktu = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : idDateTime.format(date);
};

// Angka aman: `undefined` bila field tidak ikut dikirim backend
const angkaAm = (value: number | undefined): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

// Skor aman: `null` bila field skor tidak tersedia (dipakai di drawer SPDI)
const dariSkor = (value: number | null | undefined): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

// Chip 9 sertifikasi: urut sesuai kebutuhan tampilan (primer lalu pascapanen)
const chipStyle = {
  primer: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  pasca: 'border-emerald-200 bg-emerald-50 text-emerald-700',
} as const;

type KategoriChip = keyof typeof chipStyle;

interface ChipSertifikasi {
  kode: string;
  jumlah: number;
  klaster: KategoriChip;
}

const bulanSingkat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatTanggal = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getDate()} ${bulanSingkat[date.getMonth()]} ${date.getFullYear()}`;
};

const daysUntil = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

// ==========================================================================
// Daftar unit tersertifikasi per skema — endpoint publik mutiara-backend
//   GET /api/v1/public/sertifikasi/perusahaan
//        ?skema=&year=&search=&page=&limit=
// ==========================================================================

const LIMIT_PERUSAHAAN = 10;
const SEARCH_DEBOUNCE_MS = 400;
const SKELETON_ROWS = [0, 1, 2, 3, 4];

// Pemetaan label skema pada chip ke parameter `skema` pada API.
// Menerima label chip ('CPIB Kapal') maupun kode ternormalisasi ('CPIB_KAPAL')
// sehingga parameter yang dikirim ke backend selalu valid.
const SKEMA_API_MAP: Record<string, string> = {
  CPIB: 'CPIB',
  CBIB: 'CBIB',
  'CPIB Kapal': 'CPIB_KAPAL',
  CPIB_KAPAL: 'CPIB_KAPAL',
  CDOIB: 'CDOIB',
  CPOIB: 'CPOIB',
  CPPIB: 'CPPIB',
  SKP: 'SKP',
  HACCP: 'HACCP',
  SPDI: 'SPDI',
};

interface PerusahaanItem {
  id: number;
  nama_unit: string;
  nomor_sertifikat: string;
  produk: string | null;
  tgl_terbit: string | null;
  tgl_kadaluarsa: string | null;
  nama_upt: string | null;
  skema: string | null;
  // Field opsional khusus SPDI (database report_spdi) — ditampilkan bila backend mengirim
  nomor_lampiran?: string | null;
  provinsi?: string | null;
  kbli?: string | null;
  skor_inspeksi?: number | null;
  skor_cdib?: number | null;
}

interface PerusahaanPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

interface PerusahaanResponse {
  success?: boolean;
  data?: PerusahaanItem[] | null;
  pagination?: PerusahaanPagination | null;
}

interface PaginationInfo {
  total: number;
  total_pages: number;
}

// Tanggal aman untuk field nullable dari API (tanpa Invalid Date)
const formatTanggalAm = (value: string | null | undefined): string => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '—';
  return formatTanggal(`${year}-${month}-${day}`);
};

// Status sertifikat diturunkan dari tanggal kadaluwarsa
const statusSertifikat = (
  item: PerusahaanItem
): { label: string; className: string } => {
  if (!item.tgl_kadaluarsa) {
    return {
      label: 'Aktif',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }
  const sisa = daysUntil(item.tgl_kadaluarsa);
  if (sisa < 0) {
    return {
      label: 'Kedaluwarsa',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }
  if (sisa <= 90) {
    return {
      label: 'Akan Kedaluwarsa',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }
  return {
    label: 'Aktif',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
};

export const PengawasanMutuPrimerPage = () => {
  const { mutuPrimer } = pengawasanData;
  const { totalSertifikasiAktif, noregTerdaftar } = mutuPrimer;

  // Filter tahun pada header; ikut menyegarkan seluruh angka agregasi sertifikasi
  const [selectedYear, setSelectedYear] = useState<TahunOption>('2026');
  const [kpi, setKpi] = useState<SertifikasiKpiData>(KPI_FALLBACK);
  const [sumberKpi, setSumberKpi] = useState<SumberKpi>('memuat');

  // Daftar unit tersertifikasi per skema (chip Ringkasan 9 Sertifikasi)
  const [selectedSkema, setSelectedSkema] = useState<string>('CPIB');
  const [perusahaanList, setPerusahaanList] = useState<PerusahaanItem[]>([]);
  const [isLoadingPerusahaan, setIsLoadingPerusahaan] = useState(true);
  const [perusahaanError, setPerusahaanError] = useState<string | null>(null);
  const [perusahaanReload, setPerusahaanReload] = useState(0);
  const [searchInput, setSearchInput] = useState(''); // nilai input (debounce)
  const [searchKeyword, setSearchKeyword] = useState(''); // kata kunci yang dikirim ke API
  const [page, setPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    total: 0,
    total_pages: 1,
  });
  const [selectedPerusahaan, setSelectedPerusahaan] =
    useState<PerusahaanItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Tarik KPI sertifikasi; ganti tahun langsung memicu request baru.
  // Bila gagal, state tetap diisi KPI_FALLBACK supaya halaman tidak pernah blank.
  useEffect(() => {
    let active = true;
    const requestUrl = `${API_BASE_URL}/api/v1/public/sertifikasi-kpi?year=${encodeURIComponent(
      selectedYear
    )}`;

    // Dibungkus setTimeout agar tidak memanggil setState secara sinkron di badan effect
    const timer = window.setTimeout(() => {
      setSumberKpi('memuat');

      fetch(requestUrl, { headers: { Accept: 'application/json' } })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Permintaan gagal (HTTP ${res.status})`);
          const payload = (await res.json()) as {
            success?: boolean;
            data?: SertifikasiKpiData;
          };
          if (!payload?.success || !payload.data) throw new Error('Respons API tidak valid');
          return payload.data;
        })
        .then((data) => {
          if (!active) return;
          setKpi(data);
          setSumberKpi('api');
        })
        .catch((err: unknown) => {
          console.error('Gagal memuat KPI sertifikasi, memakai data lokal:', err);
          if (!active) return;
          setKpi(KPI_FALLBACK);
          setSumberKpi('lokal');
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedYear]);

  // Debounce pencarian: terapkan kata kunci setelah pengguna berhenti mengetik
  useEffect(() => {
    const value = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearchKeyword(value);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Ambil daftar unit tersertifikasi setiap skema / tahun / pencarian / halaman berubah.
  // `selectedSkema` WAJIB ada di dependency agar URL benar-benar berubah saat chip diklik.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchDaftarPerusahaan = () => {
      setIsLoadingPerusahaan(true);
      setPerusahaanError(null);
      // Kosongkan daftar lama seketika: setiap request SELALU mengganti total
      // isi tabel (replace), bukan menggabung/menumpuk dengan data skema sebelumnya
      setPerusahaanList([]);

      // Normalisasi kode skema chip → parameter backend
      // (mis. 'CPIB Kapal' → 'CPIB_KAPAL', kode ternormalisasi diterima apa adanya)
      const apiSkema = SKEMA_API_MAP[selectedSkema] || selectedSkema;
      const url = `${API_BASE_URL}/api/v1/public/sertifikasi/perusahaan?skema=${encodeURIComponent(
        apiSkema
      )}&year=${encodeURIComponent(selectedYear)}&page=${page}&limit=${LIMIT_PERUSAHAAN}&search=${encodeURIComponent(
        searchKeyword
      )}`;

      fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Permintaan gagal (HTTP ${res.status})`);
          const payload = (await res.json()) as PerusahaanResponse;
          if (!payload?.success) throw new Error('Respons API tidak valid');
          return payload;
        })
        .then((payload) => {
          if (!active) return;
          const total = Number(payload.pagination?.total) || 0;
          const totalPages = Math.max(Number(payload.pagination?.total_pages) || 1, 1);

          // REPLACE total — JANGAN spread/append dengan data lama
          // (setPerusahaanList(prev => [...prev, ...data]) dilarang, agar data
          // skema baru tidak menumpuk di bawah data skema sebelumnya)
          setPerusahaanList(Array.isArray(payload.data) ? payload.data : []);
          setPaginationInfo({ total, total_pages: totalPages });

          // Bila halaman aktif di luar jangkauan (mis. setelah pencarian menyempit),
          // kembali ke halaman terakhir yang masih berisi data.
          if (page > totalPages) setPage(totalPages);
        })
        .catch((err: unknown) => {
          // Respons dari request lama yang dibatalkan tidak boleh menimpa data skema baru
          if (err instanceof Error && err.name === 'AbortError') return;
          console.error('Gagal memuat daftar unit tersertifikasi:', err);
          if (!active) return;
          // Gagal memuat → kosongkan daftar. JANGAN isi dengan mock/fallback
          // data HACCP untuk skema lain (dan jangan pertahankan data lama).
          setPerusahaanList([]);
          setPaginationInfo({ total: 0, total_pages: 1 });
          setPerusahaanError(
            'Tidak dapat memuat data sertifikasi. Pastikan backend sudah berjalan.'
          );
        })
        .finally(() => {
          if (active) setIsLoadingPerusahaan(false);
        });
    };

    // Dibungkus setTimeout agar tidak memanggil setState secara sinkron di badan effect
    const timer = window.setTimeout(fetchDaftarPerusahaan, 0);

    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [selectedSkema, selectedYear, page, searchKeyword, perusahaanReload]);

  // Kunci scroll body + tutup panel saat Escape ditekan
  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  // Jumlah sertifikat pascapanen untuk chip SKP & HACCP
  const jumlahHaccp = angkaAm(kpi.pasca_panen.items.HACCP);
  const jumlahSkp = angkaAm(kpi.pasca_panen.items.SKP);

  // Ringkasan 9 sertifikasi (primer: 6, pascapanen: 3)
  const chipsSertifikasi: ChipSertifikasi[] = [
    { kode: 'CPIB', jumlah: angkaAm(kpi.primer.items.CPIB), klaster: 'primer' },
    { kode: 'CBIB', jumlah: angkaAm(kpi.primer.items.CBIB), klaster: 'primer' },
    { kode: 'CPIB Kapal', jumlah: angkaAm(kpi.primer.items.CPIB_KAPAL), klaster: 'primer' },
    { kode: 'CDOIB', jumlah: angkaAm(kpi.primer.items.CDOIB), klaster: 'primer' },
    { kode: 'CPOIB', jumlah: angkaAm(kpi.primer.items.CPOIB), klaster: 'primer' },
    { kode: 'CPPIB', jumlah: angkaAm(kpi.primer.items.CPPIB), klaster: 'primer' },
    { kode: 'SKP', jumlah: jumlahSkp, klaster: 'pasca' },
    { kode: 'HACCP', jumlah: jumlahHaccp, klaster: 'pasca' },
    { kode: 'SPDI', jumlah: angkaAm(kpi.pasca_panen.items.SPDI), klaster: 'pasca' },
  ];

  const waktuPerbarui = formatWaktu(kpi.updated_at);

  // Deteksi skema SPDI & skor tambahan dari API (dipakai pada drawer detail)
  const isSpdi = selectedPerusahaan?.skema === 'SPDI';
  const skorInspeksi = dariSkor(selectedPerusahaan?.skor_inspeksi);
  const skorCdib = dariSkor(selectedPerusahaan?.skor_cdib);

  // Tahun yang benar-benar direpresentasikan angka di layar
  // (saat fallback lokal dipakai, angkanya bersifat semua tahun)
  const labelTahunAktif =
    kpi.selected_year && kpi.selected_year in TAHUN_LABEL
      ? TAHUN_LABEL[kpi.selected_year as TahunOption]
      : TAHUN_LABEL[selectedYear];

  const totalPages = Math.max(paginationInfo.total_pages, 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const bukaDetailPerusahaan = (item: PerusahaanItem) => {
    setSelectedPerusahaan(item);
    setIsDrawerOpen(true);
  };

  const tutupDrawerPerusahaan = () => setIsDrawerOpen(false);

  return (
    <div className="space-y-6">
      {/* Header Halaman + Quick Filter Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Beranda</span>
            <span>/</span>
            <span>Pengendalian / Pengawasan</span>
            <span>/</span>
            <span className="font-medium text-slate-600">
              Mutu Primer / Pascapanen
            </span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">
            Mutu Primer / Pascapanen
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pengawasan teknis kepatuhan standar mutu pascapanen, verifikasi
            lapangan, dan mutu laboratorium.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-periode" className="text-xs font-semibold text-slate-500">
              Rentang Waktu
            </label>
            <select
              id="filter-periode"
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value as TahunOption)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              {TAHUN_OPTIONS.map((tahun) => (
                <option key={tahun} value={tahun}>
                  {TAHUN_LABEL[tahun]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-upt" className="text-xs font-semibold text-slate-500">
              Wilayah / UPT
            </label>
            <select
              id="filter-upt"
              defaultValue="nasional"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="nasional">Nasional</option>
              <option value="jakarta">UPT Jakarta</option>
              <option value="surabaya">UPT Surabaya</option>
              <option value="makassar">UPT Makassar</option>
              <option value="bitung">UPT Bitung</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card biru Status Kepatuhan — full width (menggantikan card Perhatian Utama) */}
      <section className="w-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm md:p-8">
        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Status Kepatuhan Mutu Primer dan Pascapanen
        </div>

        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-5xl font-bold tracking-tight md:text-6xl">
              {formatAngka(kpi.total_nasional)}
            </p>
            <h2 className="mt-3 text-lg font-semibold md:text-xl">
              Sertifikasi Aktif
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                Primer · {formatAngka(kpi.primer.total)}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                Pascapanen · {formatAngka(kpi.pasca_panen.total)}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
              Sebaran skema sertifikasi mutu primer dan pascapanen yang berlaku,
              didampingi nomor registrasi (Noreg) eksportir.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
              <p className="text-3xl font-bold">{noregTerdaftar || 274}</p>
              <p className="mt-1 text-xs text-white/75">Noreg Terdaftar</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Patuh
            </span>
          </div>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/70">
          <span>Sumber data: SIAP MUTU & Pusat Manajemen Mutu (Pus MM)</span>
          <span aria-hidden="true">·</span>
          <span>{waktuPerbarui ? `Diperbarui ${waktuPerbarui}` : 'Diperbarui berkala'}</span>
          <span aria-hidden="true">·</span>
          <span className={sumberKpi === 'lokal' ? 'font-semibold text-amber-200' : ''}>
            {sumberKpiLabel[sumberKpi]}
          </span>
        </p>
      </section>

      {/* Section Ringkasan 9 Sertifikasi — chip interaktif + daftar unit tersertifikasi */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">Ringkasan 9 Sertifikasi</h2>
            <p className="text-sm text-slate-500">
              Jumlah sertifikat terbit per skema — primer (indigo) dan pascapanen
              (hijau). Klik salah satu skema untuk menampilkan daftar unit
              tersertifikasinya.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {totalSertifikasiAktif} Skema Sertifikasi
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              {labelTahunAktif}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                sumberKpi === 'api'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : sumberKpi === 'lokal'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {sumberKpiLabel[sumberKpi]}
            </span>
          </div>
        </div>

        {/* Chip 9 sertifikasi — tombol pemilih skema */}
        <div className="flex flex-wrap gap-2 px-6 py-5">
          {chipsSertifikasi.map((chip) => {
            const isActive = chip.kode === selectedSkema;
            return (
              <button
                key={chip.kode}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setSelectedSkema(chip.kode);
                  setPage(1);
                  // Kosongkan daftar lama seketika (replace, bukan append) agar
                  // data skema sebelumnya tidak sempat tampil menumpuk di bawah
                  // data skema baru; langsung tampilkan status memuat
                  setPerusahaanList([]);
                  setIsLoadingPerusahaan(true);
                }}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${chipStyle[chip.klaster]} ${
                  isActive
                    ? 'scale-[1.02] shadow-sm ring-2 ring-blue-500 ring-offset-1'
                    : 'hover:scale-[1.02] hover:shadow-xs'
                }`}
              >
                <span className="font-semibold uppercase">{chip.kode}</span>
                <span className="text-sm font-bold tabular-nums">
                  {formatAngka(chip.jumlah)}
                </span>
                {isActive && (
                  <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                    aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tabel daftar unit/perusahaan tersertifikasi */}
        <div className="border-t border-slate-100 px-6 pt-5 pb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Daftar Unit Tersertifikasi: {selectedSkema} ({labelTahunAktif})
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {isLoadingPerusahaan
                  ? 'Memuat data sertifikasi…'
                  : `Total ${formatAngka(paginationInfo.total)} sertifikasi${
                      searchKeyword ? ` untuk pencarian "${searchKeyword}"` : ''
                    }`}
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setSearchKeyword(searchInput.trim());
                    setPage(1);
                  }
                }}
                placeholder="Cari nama unit / nomor sertifikat…"
                aria-label="Cari nama unit atau nomor sertifikat"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {perusahaanError ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="font-medium text-amber-800">{perusahaanError}</p>
              <button
                type="button"
                onClick={() => setPerusahaanReload((prev) => prev + 1)}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full min-w-[1020px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                    <th scope="col" className="px-4 py-3">
                      No
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Nama Unit / Perusahaan
                    </th>
                    <th scope="col" className="px-4 py-3">
                      No. Sertifikat
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Komoditas / Produk
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Masa Berlaku
                    </th>
                    <th scope="col" className="px-4 py-3">
                      UPT Pembina
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingPerusahaan ? (
                    SKELETON_ROWS.map((row) => (
                      <tr key={row} aria-hidden="true">
                        {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                          <td key={col} className="px-4 py-3">
                            <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-slate-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : perusahaanList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <Inbox
                          className="mx-auto h-10 w-10 text-slate-300"
                          aria-hidden="true"
                        />
                        <p className="mt-3 font-medium text-slate-600">
                          Data tidak ditemukan
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Belum ada unit tersertifikasi untuk skema {selectedSkema} pada{' '}
                          {labelTahunAktif}
                          {searchKeyword ? ` dengan kata kunci "${searchKeyword}"` : ''}.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    perusahaanList.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-3 tabular-nums text-slate-500">
                          {(currentPage - 1) * LIMIT_PERUSAHAAN + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => bukaDetailPerusahaan(item)}
                            className="group inline-flex cursor-pointer items-center gap-1.5 text-left font-medium text-blue-600 underline-offset-2 hover:underline"
                          >
                            {item.nama_unit}
                            <ExternalLink
                              className="h-3.5 w-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
                              aria-hidden="true"
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          {item.nomor_sertifikat || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.produk || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="block text-slate-700">
                            {formatTanggalAm(item.tgl_terbit)}
                          </span>
                          <span className="text-xs text-slate-400">
                            s.d. {formatTanggalAm(item.tgl_kadaluarsa)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.nama_upt || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => bukaDetailPerusahaan(item)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!perusahaanError && !isLoadingPerusahaan && (
            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-slate-500">
                Halaman {currentPage} dari {totalPages} (Total{' '}
                {formatAngka(paginationInfo.total)} data)
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Slide-over detail unit/perusahaan tersertifikasi (panel kanan) */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${
          isDrawerOpen ? '' : 'pointer-events-none'
        }`}
        aria-hidden={!isDrawerOpen}
        inert={!isDrawerOpen}
      >
        {/* Backdrop overlay */}
        <div
          role="presentation"
          onClick={tutupDrawerPerusahaan}
          className={`absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Panel detail */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-perusahaan-title"
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header drawer */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Detail Sertifikasi
              </p>
              <h3
                id="drawer-perusahaan-title"
                className="mt-1 text-lg font-bold leading-snug text-slate-800"
              >
                {selectedPerusahaan?.nama_unit ?? '—'}
              </h3>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {selectedPerusahaan?.skema || selectedSkema}
                </span>
                {selectedPerusahaan && (
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      statusSertifikat(selectedPerusahaan).className
                    }`}
                  >
                    {statusSertifikat(selectedPerusahaan).label}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={tutupDrawerPerusahaan}
              aria-label="Tutup detail sertifikasi"
              className="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Isi detail */}
          {selectedPerusahaan && (
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {/* Legalitas */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <h4 className="text-sm font-semibold text-slate-700">
                    Legalitas
                  </h4>
                </div>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-slate-400">Nomor Sertifikat</dt>
                    <dd className="break-all text-right font-mono text-xs font-medium text-slate-800">
                      {selectedPerusahaan.nomor_sertifikat || '—'}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-slate-400">Tanggal Terbit</dt>
                    <dd className="font-medium text-slate-700">
                      {formatTanggalAm(selectedPerusahaan.tgl_terbit)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-slate-400">Masa Berlaku s.d.</dt>
                    <dd className="font-medium text-slate-700">
                      {formatTanggalAm(selectedPerusahaan.tgl_kadaluarsa)}
                    </dd>
                  </div>
                  {/* SPDI: Nomor Lampiran Teknis (bila dikirim backend) */}
                  {isSpdi && selectedPerusahaan.nomor_lampiran && (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-xs text-slate-400">Lampiran Teknis SPDI</dt>
                      <dd className="break-all text-right font-mono text-xs font-medium text-slate-800">
                        {selectedPerusahaan.nomor_lampiran}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Operasional */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  <h4 className="text-sm font-semibold text-slate-700">
                    Operasional
                  </h4>
                </div>
                <dl className="mt-3 space-y-2.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-slate-400">
                      UPT Pembina / Penerbit
                    </dt>
                    <dd className="text-right font-medium text-slate-800">
                      {selectedPerusahaan.nama_upt || '—'}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-xs text-slate-400">
                      Komoditas / Ruang Lingkup
                    </dt>
                    <dd className="text-right font-medium text-slate-800">
                      {selectedPerusahaan.produk || '—'}
                    </dd>
                  </div>
                  {/* SPDI: Provinsi & KBLI / Ruang Lingkup Distribusi (bila dikirim backend) */}
                  {isSpdi && selectedPerusahaan.provinsi && (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-xs text-slate-400">Provinsi</dt>
                      <dd className="text-right font-medium text-slate-800">
                        {selectedPerusahaan.provinsi}
                      </dd>
                    </div>
                  )}
                  {isSpdi && selectedPerusahaan.kbli && (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-300" aria-hidden="true" />
                        KBLI / Ruang Lingkup Distribusi
                      </dt>
                      <dd className="text-right font-medium text-slate-800">
                        {selectedPerusahaan.kbli}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* SPDI: ringkasan hasil penilaian (bila backend mengirim skor) */}
              {isSpdi && (skorInspeksi !== null || skorCdib !== null) && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    <h4 className="text-sm font-semibold text-emerald-800">
                      Ringkasan Hasil Penilaian
                    </h4>
                  </div>
                  <p className="mt-2 text-sm font-medium text-emerald-800">
                    Hasil Inspeksi:{' '}
                    {skorInspeksi !== null ? `${formatAngka(skorInspeksi)}%` : '—'}
                    {' · '}
                    Penilaian CDIB:{' '}
                    {skorCdib !== null ? `${formatAngka(skorCdib)}%` : '—'}
                  </p>
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-slate-400">
                Data disajikan sebagaimana diterbitkan oleh BPPMHKP melalui SIAP
                MUTU & Pusat Manajemen Mutu (Pus MM).
              </p>
            </div>
          )}

          {/* Aksi penutup */}
          <div className="border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={tutupDrawerPerusahaan}
              className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
