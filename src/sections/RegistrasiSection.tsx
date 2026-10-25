import { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Inbox,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';

// ==========================================================================
// Section Registrasi Mitra — terhubung langsung ke REST API backend
//   GET /registrasi-mitra/requirements      -> kartu persyaratan per negara
//   GET /registrasi-mitra/upinoreg          -> tabel UPI (search + filter + paging)
//   GET /registrasi-mitra/countries         -> opsi dropdown negara tujuan
// ==========================================================================

// Base URL backend utama. Prioritas:
// 1. VITE_API_BASE_URL
// 2. Turunan dari VITE_API_URL_AUTH (akhiran /auth dibuang)
// 3. Fallback backend lokal (port 5007)
const AUTH_URL = import.meta.env.VITE_API_URL_AUTH as string | undefined;

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  AUTH_URL?.replace(/\/auth\/?$/, '') ||
  'http://localhost:5007';

const PAGE_LIMIT = 5; // Jumlah baris per halaman tabel UPI
const SEARCH_DEBOUNCE_MS = 400; // Jeda pencarian agar tidak menembak API tiap ketikan
const SKELETON_CARDS = [0, 1, 2];
const SKELETON_ROWS = [0, 1, 2, 3, 4];

// --------------------------------------------------------------------------
// Tipe data respons backend
// --------------------------------------------------------------------------
interface RequirementItem {
  id: string;
  country: string;
  flag: string | null;
  authority: string | null;
  full_name_authority: string | null;
  requirements: string[] | null;
  pdf_url: string | null;
  external_portal_url: string | null;
}

interface UpiNoregItem {
  id: number;
  nama_upi: string;
  jenis_fasilitas: string | null;
  negara_tujuan: string | null;
  nomor_registrasi: string | null;
  status: string | null;
  tgl_terbit: string | null;
}

interface TablePagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Bentuk bungkus respons backend: { success, data, pagination? }
interface ApiEnvelope {
  success?: boolean;
  data?: unknown;
  pagination?: TablePagination;
}

// Kombinasi filter tabel yang dikirim ke backend
interface QueryState {
  search: string;
  negara: string;
  page: number;
}

// --------------------------------------------------------------------------
// Alur 4 langkah perizinan registrasi mitra
// --------------------------------------------------------------------------
interface WorkflowStep {
  no: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    no: '01',
    title: 'Kelayakan Dasar',
    description: 'Pemenuhan SKP/SMKHP & sertifikat HACCP aktif.',
    icon: ShieldCheck,
  },
  {
    no: '02',
    title: 'Verifikasi & Audit',
    description: 'Verifikasi dokumen dan audit lapangan oleh UPT BPPMHKP.',
    icon: CheckCircle2,
  },
  {
    no: '03',
    title: 'Rekomendasi Pusat',
    description: 'Evaluasi dan penerbitan rekomendasi resmi Pus Manajemen Mutu.',
    icon: Building2,
  },
  {
    no: '04',
    title: 'Approval Otoritas Mitra',
    description: 'Pencatatan dan penerbitan nomor registrasi di portal negara tujuan.',
    icon: ExternalLink,
  },
];

// --------------------------------------------------------------------------
// Helper
// --------------------------------------------------------------------------

// Tarik JSON dari backend; lempar bila respons bukan 2xx
const fetchJson = async (url: string): Promise<ApiEnvelope> => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Permintaan gagal (HTTP ${res.status})`);
  }
  return (await res.json()) as ApiEnvelope;
};

// Amankan nilai `data` menjadi array (backend boleh mengirim null/bentuk lain)
const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// Susun URL file dari path relatif yang dikirim backend (mis. /docs/juknis/....pdf)
const toFileUrl = (path: string): string =>
  /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

// Warna badge status registrasi
const statusBadgeClass = (status: string | null | undefined): string => {
  switch (status) {
    case 'Aktif':
      return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
    case 'Perpanjangan':
      return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
    case 'Pending':
      return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
    default:
      return 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300';
  }
};

// Format tanggal ISO (YYYY-MM-DD) menjadi DD/MM/YYYY agar bebas masalah zona waktu
const formatTanggal = (value: string | null | undefined): string => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const RegistrasiSection = () => {
  // Data statis: kartu persyaratan + opsi negara
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqError, setReqError] = useState<string | null>(null);
  const [metaReload, setMetaReload] = useState(0);

  // Tabel UPI ber-nomor registrasi
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState<QueryState>({ search: '', negara: '', page: 1 });
  const [rows, setRows] = useState<UpiNoregItem[]>([]);
  const [pagination, setPagination] = useState<TablePagination | null>(null);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableReload, setTableReload] = useState(0);

  // Debounce pencarian: perbarui query hanya setelah pengguna berhenti mengetik
  useEffect(() => {
    const value = searchInput.trim();

    const timer = window.setTimeout(() => {
      setQuery((prev) => (prev.search === value ? prev : { ...prev, search: value, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Ambil kartu persyaratan & daftar negara sekali saat mount (atau saat reload)
  useEffect(() => {
    let active = true;

    // Dibungkus setTimeout agar tidak memanggil setState secara sinkron di badan effect
    const timer = window.setTimeout(() => {
      setReqLoading(true);
      setReqError(null);

      Promise.all([
        fetchJson(`${API_BASE_URL}/registrasi-mitra/requirements`),
        fetchJson(`${API_BASE_URL}/registrasi-mitra/countries`),
      ])
        .then(([requirementRes, countryRes]) => {
          if (!active) return;
          setRequirements(toArray(requirementRes.data) as RequirementItem[]);
          setCountries(
            toArray(countryRes.data).filter(
              (item): item is string => typeof item === 'string' && item !== '',
            ),
          );
        })
        .catch((err: unknown) => {
          console.error('Gagal memuat data persyaratan registrasi mitra:', err);
          if (!active) return;
          setRequirements([]);
          setCountries([]);
          setReqError('Tidak dapat memuat data persyaratan. Pastikan backend sudah berjalan.');
        })
        .finally(() => {
          if (active) setReqLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [metaReload]);

  // Ambil tabel UPI setiap kali filter / halaman berubah
  useEffect(() => {
    let active = true;

    // Dibungkus setTimeout agar tidak memanggil setState secara sinkron di badan effect
    const timer = window.setTimeout(() => {
      setTableLoading(true);
      setTableError(null);

      const params = new URLSearchParams({
        page: String(query.page),
        limit: String(PAGE_LIMIT),
      });
      if (query.search) params.set('search', query.search);
      if (query.negara) params.set('negara', query.negara);

      fetchJson(`${API_BASE_URL}/registrasi-mitra/upinoreg?${params.toString()}`)
        .then((payload) => {
          if (!active) return;

          const items = toArray(payload.data) as UpiNoregItem[];
          setRows(items);
          setPagination(payload.pagination ?? null);

          // Bila halaman aktif sudah tidak berisi data (mis. setelah filter menyempit),
          // kembali ke halaman pertama agar pengguna tidak melihat tabel kosong.
          if (items.length === 0 && query.page > 1) {
            const maxPage = Math.max(Number(payload.pagination?.totalPages) || 0, 1);
            const target = Math.min(query.page, maxPage);
            if (target !== query.page) {
              setQuery((prev) => ({ ...prev, page: target }));
            }
          }
        })
        .catch((err: unknown) => {
          console.error('Gagal memuat data UPI noreg:', err);
          if (!active) return;
          setRows([]);
          setPagination(null);
          setTableError('Tidak dapat memuat data UPI. Pastikan backend sudah berjalan.');
        })
        .finally(() => {
          if (active) setTableLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, tableReload]);

  const totalPages = Math.max(Number(pagination?.totalPages) || 0, 1);
  const currentPage = Math.min(Math.max(query.page, 1), totalPages);
  const totalItems = Number(pagination?.totalItems) || 0;

  return (
    <section
      id="registrasi"
      className="bg-white dark:bg-slate-950 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Registrasi Mitra"
          title="Persyaratan Pengajuan Nomor Registrasi"
          description="Ketentuan pengajuan Nomor Registrasi (Noreg) ke negara mitra serta daftar UPI yang telah memperoleh Noreg."
        />

        {/* 1. Alur 4 langkah perizinan registrasi mitra */}
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;

            return (
              <li key={step.no} className="h-full">
                <div className="h-full rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5 shadow-xs transition-colors">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 transition-colors">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h4 className="mt-4 font-semibold text-slate-900 dark:text-white transition-colors">
                    {step.no}. {step.title}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400 transition-colors">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* 2. Katalog persyaratan khusus per negara mitra */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-12 mb-6 transition-colors">
          Persyaratan per Negara Mitra
        </h3>

        {reqLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden="true">
            {SKELETON_CARDS.map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="mt-4 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-2 h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-5 h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
            <p className="col-span-full text-center text-sm text-slate-500 dark:text-slate-400">
              Memuat daftar persyaratan…
            </p>
          </div>
        ) : reqError ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-8 text-center">
            <p className="font-medium text-amber-800 dark:text-amber-300">{reqError}</p>
            <button
              type="button"
              onClick={() => setMetaReload((prev) => prev + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba Lagi
            </button>
          </div>
        ) : requirements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-10 text-center">
            <Inbox className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
              Belum ada persyaratan tersedia
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Data persyaratan akan tampil setelah diperbarui oleh Pus Manajemen Mutu (Pus MM).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {requirements.map((item) => {
              const checklist = toArray(item.requirements).filter(
                (req): req is string => typeof req === 'string' && req !== '',
              );

              return (
                <article
                  key={item.id}
                  className="flex h-full flex-col rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5 shadow-xs transition-colors"
                >
                  {/* Bendera + nama negara + badge otoritas */}
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-3xl leading-none" aria-hidden="true">
                        {item.flag || '🏳️'}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 dark:text-white transition-colors">
                          {item.country}
                        </h4>
                        {item.full_name_authority && (
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 transition-colors">
                            {item.full_name_authority}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.authority && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/50 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors">
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {item.authority}
                      </span>
                    )}
                  </header>

                  {/* Checklist persyaratan */}
                  {checklist.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {checklist.map((req, index) => (
                        <li
                          key={`${index}-${req}`}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                            aria-hidden="true"
                          />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      Rincian persyaratan belum tersedia.
                    </p>
                  )}

                  {/* Aksi: unduh juknis + portal resmi */}
                  <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700/60 pt-4 transition-colors">
                    {item.pdf_url && (
                      <a
                        href={toFileUrl(item.pdf_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Unduh Juknis
                      </a>
                    )}
                    {item.external_portal_url && (
                      <a
                        href={item.external_portal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Portal Resmi
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 3. Direktori pencarian UPI ber-nomor registrasi */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-12 mb-6 transition-colors">
          Direktori UPI Ber-Nomor Registrasi
        </h3>

        {/* Kontrol filter: pencarian + dropdown negara tujuan */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama UPI / no. registrasi…"
              aria-label="Cari nama UPI atau nomor registrasi"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-negara-noreg"
              className="text-sm text-slate-600 dark:text-slate-300 transition-colors"
            >
              Negara Tujuan
            </label>
            <select
              id="filter-negara-noreg"
              value={query.negara}
              onChange={(e) =>
                setQuery((prev) => ({ ...prev, negara: e.target.value, page: 1 }))
              }
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="">Semua Negara</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Galat pemuatan tabel */}
        {tableError && (
          <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
            <p className="font-medium text-amber-800 dark:text-amber-300">{tableError}</p>
            <button
              type="button"
              onClick={() => setTableReload((prev) => prev + 1)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Tabel UPI (responsif, gulir horizontal di layar sempit) */}
        {!tableError && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Nama UPI
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Jenis Fasilitas
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Negara Tujuan
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    No. Registrasi
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Tgl Terbit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {tableLoading ? (
                  SKELETON_ROWS.map((i) => (
                    <tr key={i} className="bg-white dark:bg-slate-900/40" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map((col) => (
                        <td key={col} className="px-5 py-3">
                          <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr className="bg-white dark:bg-slate-900/40">
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <Inbox
                        className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600"
                        aria-hidden="true"
                      />
                      <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
                        Data tidak ditemukan
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Coba ubah kata kunci pencarian atau pilih negara tujuan lainnya.
                      </p>
                    </td>
                  </tr>
                ) : (
                  rows.map((upi) => (
                    <tr
                      key={upi.id}
                      className="bg-white dark:bg-slate-900/40 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                        {upi.nama_upi}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {upi.jenis_fasilitas || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {upi.negara_tujuan || '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {upi.nomor_registrasi || '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(upi.status)}`}
                        >
                          {upi.status || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                        {formatTanggal(upi.tgl_terbit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination — disembunyikan saat terjadi galat pemuatan */}
        {!tableError && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {pagination
                ? `Menampilkan ${rows.length} dari ${totalItems} data`
                : '\u00A0'}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuery((prev) => ({ ...prev, page: currentPage - 1 }))}
                disabled={tableLoading || currentPage <= 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Sebelumnya
              </button>

              <span className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setQuery((prev) => ({ ...prev, page: currentPage + 1 }))}
                disabled={tableLoading || currentPage >= totalPages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
          * Data diperbarui berkala dari Pusat Manajemen Mutu (Pus MM)
        </p>
      </div>
    </section>
  );
};
