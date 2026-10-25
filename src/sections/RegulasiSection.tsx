import { useEffect, useState } from 'react';
import { SectionHeading } from '../components/common/SectionHeading';
import {
  getRegulasi,
  getRegulasiFileUrl,
  trackDownload,
  type RegulationItem,
} from '../services/regulasiService';

// Tab filter jenis regulasi
const TABS = ['Semua', 'Nasional', 'Internasional'] as const;
type TabFilter = (typeof TABS)[number];

// Mode tampilan daftar regulasi: baris, kartu, atau tabel
const VIEW_MODES = ['list', 'grid', 'table'] as const;
type ViewMode = (typeof VIEW_MODES)[number];

// Label tooltip/aria untuk tiap mode tampilan
const VIEW_MODE_LABEL: Record<ViewMode, string> = {
  list: 'Tampilan daftar',
  grid: 'Tampilan kartu',
  table: 'Tampilan tabel',
};

const PAGE_SIZE = 6; // Jumlah item yang tampil awal & per penambahan
const FETCH_LIMIT = 100; // Batas data yang ditarik dari backend sekali request
const SEARCH_DEBOUNCE_MS = 400; // Jeda pencarian cepat agar tidak menembak API tiap ketikan

// Gaya badge mengikuti jenis regulasi
const jenisBadgeClass = (jenis: string) =>
  jenis === 'Internasional'
    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300'
    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300';

// Format ukuran file (byte) menjadi satuan yang mudah dibaca
const formatUkuranFile = (size: number | string | null | undefined): string | null => {
  if (size === null || size === undefined || size === '') return null;

  const bytes = typeof size === 'string' ? Number(size) : size;
  if (!Number.isFinite(bytes) || bytes <= 0) {
    // Bukan angka valid (mis. sudah berlabel "1.2 MB"), tampilkan apa adanya
    return typeof size === 'string' ? size : null;
  }
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

// Format angka unduhan dengan pemisah ribuan lokal (id-ID)
const formatRibu = (value: number | string): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(num) ? new Intl.NumberFormat('id-ID').format(num) : String(value);
};

// Nama berkas unduhan: kode regulasi, atau judul bila kode kosong
const namaFilePdf = (item: RegulationItem): string => {
  const dasar = (item.kode || item.judul || 'regulasi').trim();
  // Buang karakter yang dilarang pada nama berkas (Windows): \ / : * ? " < > |
  return `${dasar.replace(/[\\/:*?"<>|]/g, '-')}.pdf`;
};

// Ikon SVG kecil untuk tiap mode tampilan
const IkonViewMode = ({ mode }: { mode: ViewMode }) => {
  if (mode === 'grid') {
    return (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 6A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      </svg>
    );
  }

  if (mode === 'table') {
    return (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.375 5.25h17.25v13.5H3.375v-13.5ZM3.375 9.75h17.25M9.75 5.25v13.5"
        />
      </svg>
    );
  }

  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 6h16.5M3.75 18h16.5" />
    </svg>
  );
};

interface AksiDokumenProps {
  item: RegulationItem;
  // Bentuk ringkas dipakai pada kartu grid & tabel
  compact?: boolean;
  onBukaPdf: (item: RegulationItem) => void;
  onUnduh: (item: RegulationItem) => void;
}

// Tombol aksi buka/unduh yang dipakai bersama oleh ketiga mode tampilan
const AksiDokumen = ({ item, compact = false, onBukaPdf, onUnduh }: AksiDokumenProps) => {
  const tanpaFile = !item.file_url;
  const judulTombol = tanpaFile ? 'File PDF belum tersedia' : undefined;
  const ukuranTombol = compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  return (
    <div
      className={
        compact
          ? 'flex shrink-0 items-center gap-2'
          : 'flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row'
      }
    >
      <button
        type="button"
        onClick={() => onBukaPdf(item)}
        disabled={tanpaFile}
        title={judulTombol}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ukuranTombol}`}
      >
        {compact ? 'Buka' : 'Buka PDF'}
      </button>
      <button
        type="button"
        onClick={() => onUnduh(item)}
        disabled={tanpaFile}
        title={judulTombol}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${ukuranTombol}`}
      >
        Unduh
      </button>
    </div>
  );
};

export const RegulasiSection = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>('Semua');
  const [search, setSearch] = useState('');
  const [regulations, setRegulations] = useState<RegulationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [reloadKey, setReloadKey] = useState(0);

  // Ambil data regulasi dari backend; ganti tab / ketik pencarian memicu request baru
  useEffect(() => {
    let active = true;

    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);

      getRegulasi({
        jenis: activeTab === 'Semua' ? undefined : activeTab,
        search: search.trim() || undefined,
        limit: FETCH_LIMIT,
      })
        .then((result) => {
          if (!active) return;
          setRegulations(result.items);
          setVisibleCount(PAGE_SIZE);
        })
        .catch((err) => {
          console.error('Gagal memuat data regulasi:', err);
          if (!active) return;
          setRegulations([]);
          setError('Tidak dapat memuat data regulasi. Pastikan backend sudah berjalan.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [activeTab, search, reloadKey]);

  // Buka file PDF di tab baru (tanpa menghitung unduhan)
  const handleBukaPdf = (item: RegulationItem) => {
    if (!item.file_url) return;
    window.open(getRegulasiFileUrl(item.file_url), '_blank', 'noopener,noreferrer');
  };

  // Unduh file langsung ke komputer via Blob.
  // Catatan: <a download> biasa diabaikan browser untuk resource cross-origin
  // (port FE ≠ port BE), jadi file harus ditarik lewat fetch lalu dibungkus
  // object URL sebelum dispar unduhan.
  const handleUnduh = async (item: RegulationItem) => {
    if (!item.file_url) return;

    const fullUrl = getRegulasiFileUrl(item.file_url);

    try {
      const res = await fetch(fullUrl);
      if (!res.ok) {
        throw new Error(`Permintaan unduhan gagal (HTTP ${res.status})`);
      }

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = namaFilePdf(item);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Tunda peniadaan object URL agar browser sempat memulai unduhannya
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);

      // Catat counter unduhan di backend (fire-and-forget)
      trackDownload(item.id).catch((err) => {
        // Counter hanya pelengkap; kegagalan pencatatan tidak mengganggu proses unduh
        console.warn('Gagal mencatat unduhan regulasi:', err);
      });
    } catch (err) {
      // Cadangan bila fetch diblokir (mis. CORS backend belum mengizinkan):
      // buka file di tab baru sehingga pengguna tetap bisa menyimpan PDF-nya
      console.error('Gagal mengunduh file regulasi:', err);
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const visibleItems = regulations.slice(0, visibleCount);
  const hasMore = regulations.length > visibleCount;

  return (
    <section
      id="regulasi"
      className="bg-slate-50 dark:bg-slate-900/50 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Landasan Hukum"
          title="Regulasi Nasional & Internasional"
          description="Acuan hukum dan standar yang menjadi dasar penyelenggaraan jaminan mutu hasil kelautan dan perikanan."
        />

        {/* Filter bar: tab pills jenis + pencarian cepat */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-pressed={activeTab === tab}
                className={
                  activeTab === tab
                    ? 'rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors'
                    : 'rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors'
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative w-full sm:w-72">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari regulasi…"
                aria-label="Cari regulasi"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>

            {/* Pengalih mode tampilan: daftar, kartu, atau tabel */}
            <div
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1"
              role="group"
              aria-label="Mode tampilan regulasi"
            >
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-label={VIEW_MODE_LABEL[mode]}
                  aria-pressed={viewMode === mode}
                  title={VIEW_MODE_LABEL[mode]}
                  className={
                    viewMode === mode
                      ? 'rounded-md bg-white dark:bg-slate-700 p-2 text-blue-600 dark:text-blue-300 shadow-xs transition-colors'
                      : 'rounded-md p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors'
                  }
                >
                  <IkonViewMode mode={mode} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status pemuatan: skeleton, galat, kosong, atau daftar dokumen */}
        {loading ? (
          <div className="space-y-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-5"
              >
                <div className="flex gap-2">
                  <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
                  <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="mt-4 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-2 h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Memuat daftar regulasi…
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-8 text-center">
            <p className="font-medium text-amber-800 dark:text-amber-300">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="mt-4 rounded-lg bg-amber-600 px-5 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : regulations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-10 text-center">
            <svg
              className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">
              Regulasi tidak ditemukan
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Coba ubah kata kunci pencarian atau pilih tab “Semua”.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Tampilan kartu: 1 kolom di layar kecil, 2 di md, 3 di lg */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item) => {
              const ukuran = formatUkuranFile(item.file_size);
              const tahun = item.tahun ? String(item.tahun) : null;

              return (
                <div
                  key={item.id}
                  className="flex h-full flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs hover:shadow-md transition-all"
                >
                  {/* Baris badge: kode, jenis, dan penanda unggulan */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 transition-colors">
                      {item.kode}
                    </span>
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md ${jenisBadgeClass(item.jenis)}`}
                    >
                      {item.jenis}
                    </span>
                    {Boolean(item.is_featured) && (
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 transition-colors">
                        ★ Unggulan
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-semibold text-slate-900 dark:text-white transition-colors line-clamp-2">
                    {item.judul}
                  </h3>
                  {item.deskripsi && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 transition-colors">
                      {item.deskripsi}
                    </p>
                  )}

                  {/* Meta: kategori, tahun, dan ukuran file */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                    {item.kategori && <span>{item.kategori}</span>}
                    {tahun && <span>Tahun {tahun}</span>}
                    {ukuran && <span>{ukuran}</span>}
                  </div>

                  {/* Jumlah unduhan, dorong ke bawah agar sejajar di semua kartu */}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="h-3.5 w-3.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M10 2a1 1 0 0 1 1 1v7.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 10.6V3a1 1 0 0 1 1-1Z" />
                        <path d="M3 14a1 1 0 0 1 1 1v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a1 1 0 1 1 2 0v1a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-1a1 1 0 0 1 1-1Z" />
                      </svg>
                      {formatRibu(item.download_count)} unduhan
                    </span>
                  </div>

                  <div className="mt-3">
                    <AksiDokumen
                      item={item}
                      compact
                      onBukaPdf={handleBukaPdf}
                      onUnduh={handleUnduh}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'table' ? (
          /* Tampilan tabel data lengkap dengan gulir horizontal di layar sempit */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 transition-colors">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/80 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Kode
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Judul
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Kategori / Tahun
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Ukuran / Unduhan
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const ukuran = formatUkuranFile(item.file_size);
                  const tahun = item.tahun ? String(item.tahun) : null;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 dark:border-slate-700/40 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 transition-colors">
                            {item.kode}
                          </span>
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-md ${jenisBadgeClass(item.jenis)}`}
                          >
                            {item.jenis}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-medium text-slate-900 dark:text-white transition-colors line-clamp-1">
                          {item.judul}
                        </p>
                        {item.deskripsi && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 transition-colors line-clamp-1">
                            {item.deskripsi}
                          </p>
                        )}
                        {Boolean(item.is_featured) && (
                          <span className="mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 transition-colors">
                            ★ Unggulan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-300 transition-colors">
                        <div>{item.kategori || '—'}</div>
                        <div className="mt-0.5 text-slate-400 dark:text-slate-500">
                          {tahun || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-slate-600 dark:text-slate-300 transition-colors">
                        <div>{ukuran || '—'}</div>
                        <div className="mt-0.5 text-slate-400 dark:text-slate-500">
                          {formatRibu(item.download_count)} unduhan
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <AksiDokumen
                          item={item}
                          compact
                          onBukaPdf={handleBukaPdf}
                          onUnduh={handleUnduh}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleItems.map((item) => {
              const ukuran = formatUkuranFile(item.file_size);
              const tahun = item.tahun ? String(item.tahun) : null;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Baris badge: kode, jenis, kategori, dan penanda unggulan */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 transition-colors">
                          {item.kode}
                        </span>
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md ${jenisBadgeClass(item.jenis)}`}
                        >
                          {item.jenis}
                        </span>
                        {item.kategori && (
                          <span className="inline-block text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 transition-colors">
                            {item.kategori}
                          </span>
                        )}
                        {Boolean(item.is_featured) && (
                          <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 transition-colors">
                            ★ Unggulan
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 font-semibold text-slate-900 dark:text-white transition-colors">
                        {item.judul}
                      </h3>
                      {item.deskripsi && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 transition-colors">
                          {item.deskripsi}
                        </p>
                      )}

                      {/* Meta: tahun, ukuran file, dan jumlah unduhan */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                        {tahun && <span>Tahun {tahun}</span>}
                        {ukuran && <span>{ukuran}</span>}
                        <span className="inline-flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M10 2a1 1 0 0 1 1 1v7.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L9 10.6V3a1 1 0 0 1 1-1Z" />
                            <path d="M3 14a1 1 0 0 1 1 1v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a1 1 0 1 1 2 0v1a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-1a1 1 0 0 1 1-1Z" />
                          </svg>
                          {formatRibu(item.download_count)} unduhan
                        </span>
                      </div>
                    </div>

                    {/* Aksi per baris: buka di tab baru atau unduh langsung */}
                    <AksiDokumen item={item} onBukaPdf={handleBukaPdf} onUnduh={handleUnduh} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tambah tampilan bila masih ada item tersembunyi */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Tampilkan Lebih Banyak ({regulations.length - visibleCount} lagi)
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
