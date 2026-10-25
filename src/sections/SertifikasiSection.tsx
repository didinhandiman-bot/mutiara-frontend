import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';

// ==========================================================================
// Section Sertifikasi — data agregasi 9 Sertifikasi BPPMHKP
//   GET /api/v1/public/sertifikasi-kpi?year=<tahun|all>  (endpoint publik)
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

const KPI_URL = `${API_BASE_URL}/api/v1/public/sertifikasi-kpi`;

// Opsi filter tahun pada dropdown
const TAHUN_OPTIONS = ['2026', '2025', '2024', 'all'] as const;
type TahunOption = (typeof TAHUN_OPTIONS)[number];

const TAHUN_LABEL: Record<TahunOption, string> = {
  '2026': '2026',
  '2025': '2025',
  '2024': '2024',
  all: 'Semua Tahun',
};

// --------------------------------------------------------------------------
// Tipe data respons backend
// --------------------------------------------------------------------------
// Klaster mutu pascapanen: SKP, HACCP, SPDI
type PascaPanenKey = 'SKP' | 'HACCP' | 'SPDI';

// Klaster mutu produk primer: CPIB, CBIB, CPPIB, CPOIB, CDOIB, CPIB_KAPAL
type PrimerKey = 'CPIB' | 'CBIB' | 'CPPIB' | 'CPOIB' | 'CDOIB' | 'CPIB_KAPAL';

interface ClusterKpi<K extends string> {
  total: number;
  items: Record<K, number>;
}

export interface SertifikasiKpiData {
  total_nasional: number;
  pasca_panen: ClusterKpi<PascaPanenKey>;
  primer: ClusterKpi<PrimerKey>;
  selected_year?: string | number;
  updated_at: string;
}

interface SertifikasiKpiResponse {
  success?: boolean;
  data?: SertifikasiKpiData;
}

// --------------------------------------------------------------------------
// Definisi kartu per jenis sertifikat
// --------------------------------------------------------------------------
interface SertifikasiCard<K extends string> {
  key: K;
  kode: string;
  nama: string;
}

const PASCA_PANEN_CARDS: SertifikasiCard<PascaPanenKey>[] = [
  { key: 'SKP', kode: 'SKP', nama: 'Sertifikat Kelayakan Pengolahan' },
  { key: 'HACCP', kode: 'HACCP', nama: 'Hazard Analysis Critical Control Point' },
  { key: 'SPDI', kode: 'SPDI', nama: 'Surat Persetujuan Desain Instalasi' },
];

const PRIMER_CARDS: SertifikasiCard<PrimerKey>[] = [
  { key: 'CPIB', kode: 'CPIB', nama: 'Cara Pembenihan Ikan yang Baik' },
  { key: 'CBIB', kode: 'CBIB', nama: 'Cara Budi Daya Ikan yang Baik' },
  { key: 'CPPIB', kode: 'CPPIB', nama: 'Cara Pembuatan Pakan Ikan yang Baik' },
  { key: 'CPOIB', kode: 'CPOIB', nama: 'Cara Pembuatan Obat Ikan yang Baik' },
  { key: 'CDOIB', kode: 'CDOIB', nama: 'Cara Distribusi Obat Ikan yang Baik' },
  {
    key: 'CPIB_KAPAL',
    kode: 'CPIB Kapal',
    nama: 'Cara Penanganan Ikan yang Baik di Atas Kapal',
  },
];

// Kombinasi kelas badge per klaster (literal agar terbaca Tailwind)
const ACCENT = {
  emerald:
    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
} as const;

// --------------------------------------------------------------------------
// Helper format (dibuat sekali di level modul, bukan tiap render)
// --------------------------------------------------------------------------
const idNumber = new Intl.NumberFormat('id-ID');

// Format angka dengan pemisah ribuan ala Indonesia: 40.747, 13.624
const formatAngka = (value: number | null | undefined): string => {
  const num = Number(value);
  return idNumber.format(Number.isFinite(num) ? Math.max(0, Math.trunc(num)) : 0);
};

const idDateTime = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeStyle: 'short',
});

// Format timestamp ISO ("2026-10-25T04:26:08.834Z") menjadi waktu lokal yang terbaca
const formatWaktu = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : idDateTime.format(date);
};

interface KartuSertifikasiProps {
  kode: string;
  nama: string;
  jumlah: number;
  accent: string;
  /** True saat pergantian tahun sedang di-fetch (angka ditampilkan sebagai skeleton) */
  loading: boolean;
}

// Kartu satu jenis sertifikat (dipakai bersama kedua klaster)
const KartuSertifikasi = ({
  kode,
  nama,
  jumlah,
  accent,
  loading,
}: KartuSertifikasiProps) => (
  <div className="h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs hover:shadow-md transition-all">
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${accent}`}>
      {kode}
    </span>
    <h4 className="mt-3 font-semibold text-sm text-slate-900 dark:text-white transition-colors">
      {nama}
    </h4>
    {loading ? (
      <span
        className="mt-3 block h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse"
        aria-hidden="true"
      />
    ) : (
      <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums transition-colors">
        {formatAngka(jumlah)}
      </p>
    )}
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      Sertifikat terbit
    </p>
  </div>
);

export const SertifikasiSection = () => {
  const [kpi, setKpi] = useState<SertifikasiKpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [selectedYear, setSelectedYear] = useState<TahunOption>('2026');

  // Ambil data KPI sertifikasi; pergantian tahun langsung memicu request baru
  useEffect(() => {
    let active = true;
    const requestUrl = `${KPI_URL}?year=${encodeURIComponent(selectedYear)}`;

    // Dibungkus setTimeout agar tidak memanggil setState secara sinkron di badan effect
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      fetch(requestUrl, { headers: { Accept: 'application/json' } })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Permintaan gagal (HTTP ${res.status})`);
          }
          const payload = (await res.json()) as SertifikasiKpiResponse;
          if (!payload?.success || !payload.data) {
            throw new Error('Respons API tidak valid');
          }
          return payload.data;
        })
        .then((data) => {
          if (active) setKpi(data);
        })
        .catch((err: unknown) => {
          console.error('Gagal memuat data KPI sertifikasi:', err);
          if (!active) return;
          setError('Tidak dapat memuat data sertifikasi. Pastikan backend sudah berjalan.');
          // Data lama sengaja tidak dibuang agar kartu tetap terbaca saat request ulang gagal
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selectedYear, reload]);

  const waktuPerbarui = formatWaktu(kpi?.updated_at);

  // Kartu highlight: skeleton halus selama pergantian tahun sedang di-fetch
  const angkaHighlight = (nilai: number) =>
    loading ? (
      <span
        className="block h-10 w-32 rounded-lg bg-white/30 animate-pulse"
        aria-hidden="true"
      />
    ) : (
      formatAngka(nilai)
    );

  return (
    <section
      id="sertifikasi"
      className="bg-white dark:bg-slate-950 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Layanan Sertifikasi"
          title="9 Sertifikasi Mutu BPPMHKP"
          description="Standardisasi jaminan mutu hasil perikanan melalui sertifikasi klaster pascapanen dan mutu produk primer yang diterbitkan BPPMHKP."
        />

        {/* Filter tahun — selalu tampil di atas kartu ringkasan */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
          <label
            htmlFor="pilih-tahun"
            className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 transition-colors"
          >
            PILIH TAHUN:
          </label>
          <select
            id="pilih-tahun"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value as TahunOption)}
            aria-label="PILIH TAHUN"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-900 dark:text-white shadow-xs hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer"
          >
            {TAHUN_OPTIONS.map((tahun) => (
              <option key={tahun} value={tahun}>
                {TAHUN_LABEL[tahun]}
              </option>
            ))}
          </select>
          {loading && kpi && (
            <span className="text-xs text-slate-400 dark:text-slate-500" role="status">
              Memperbarui…
            </span>
          )}
        </div>

        {loading && !kpi ? (
          /* Skeleton sederhana saat fetching pertama */
          <div aria-hidden="true">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
            <div className="mt-10 h-5 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Memuat data sertifikasi…
            </p>
          </div>
        ) : kpi ? (
          <>
            {/* Galat saat request tahun gagal: tampilkan data terakhir */}
            {error && (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {error} Menampilkan data terakhir.
                </p>
                <button
                  type="button"
                  onClick={() => setReload((prev) => prev + 1)}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Highlight summary: 3 card agregat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-indigo-600 text-white rounded-xl p-6 shadow-md">
                <p className="text-4xl font-extrabold">{angkaHighlight(kpi.total_nasional)}</p>
                <p className="mt-1 text-sm text-indigo-100">Total Sertifikasi Nasional</p>
              </div>
              <div className="bg-emerald-600 text-white rounded-xl p-6 shadow-md">
                <p className="text-4xl font-extrabold">{angkaHighlight(kpi.pasca_panen.total)}</p>
                <p className="mt-1 text-sm text-emerald-100">Sertifikasi Mutu Pasca Panen</p>
              </div>
              <div className="bg-amber-500 text-white rounded-xl p-6 shadow-md">
                <p className="text-4xl font-extrabold">{angkaHighlight(kpi.primer.total)}</p>
                <p className="mt-1 text-sm text-amber-100">Sertifikasi Mutu Produk Primer</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 transition-colors">
              {waktuPerbarui
                ? `Terakhir diperbarui: ${waktuPerbarui} WIB.`
                : 'Data diperbarui berkala dari Pusat Manajemen Mutu (Pus MM).'}
            </p>

            {/* Cluster 1 — Mutu Pasca Panen */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">
                Mutu Pasca Panen
              </h3>
              <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full transition-colors">
                {formatAngka(kpi.pasca_panen.total)} sertifikat
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PASCA_PANEN_CARDS.map((card) => (
                <KartuSertifikasi
                  key={card.key}
                  kode={card.kode}
                  nama={card.nama}
                  jumlah={kpi.pasca_panen.items[card.key] ?? 0}
                  accent={ACCENT.emerald}
                  loading={loading}
                />
              ))}
            </div>

            {/* Cluster 2 — Mutu Produk Primer */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">
                Mutu Produk Primer
              </h3>
              <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full transition-colors">
                {formatAngka(kpi.primer.total)} sertifikat
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PRIMER_CARDS.map((card) => (
                <KartuSertifikasi
                  key={card.key}
                  kode={card.kode}
                  nama={card.nama}
                  jumlah={kpi.primer.items[card.key] ?? 0}
                  accent={ACCENT.indigo}
                  loading={loading}
                />
              ))}
            </div>

            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
              *) Angka agregasi diambil dari sistem SIAP MUTU &amp; Pusat Manajemen Mutu (Pus MM).
            </p>
          </>
        ) : error ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-8 text-center">
            <p className="font-medium text-amber-800 dark:text-amber-300">{error}</p>
            <button
              type="button"
              onClick={() => setReload((prev) => prev + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba Lagi
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};
