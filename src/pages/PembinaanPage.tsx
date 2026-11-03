import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart } from '../components/common/BarChart';
import type { KategoriUnit, PembinaanKpi, PembinaanPagination, StatusUnit, UnitPembinaan } from '../services/pembinaanService';
import { getPembinaanKpi, getPembinaanUnits } from '../services/pembinaanService';

// ==========================================================================
// Dashboard Pembinaan Mutu Hulu & Hilir
// Data live dari endpoint publik: /api/v1/public/pembinaan/kpi dan /unit
// ==========================================================================

type SektorTab = 'all' | 'primer' | 'pengolahan';

// Nilai awal aman agar halaman tidak blank saat render pertama
const KPI_FALLBACK: PembinaanKpi = {
  total_unit: 0,
  selesai_bina: 0,
  primer: { total: 0, breakdown: {} },
  pengolahan: { total: 0, breakdown: {} },
  potensi_siap_sertifikasi: 0,
  selected_year: '2026',
};

const YEAR_OPTIONS = ['2026', '2025', '2024', 'all'] as const;

// Opsi chip skema sertifikasi: label tampilan -> nilai parameter API
const SKEMA_OPTIONS: { label: string; value: string; kategori: KategoriUnit | null }[] = [
  { label: 'Semua Skema', value: '', kategori: null },
  { label: 'CPIB', value: 'CPIB', kategori: 'Primer' },
  { label: 'CBIB', value: 'CBIB', kategori: 'Primer' },
  { label: 'CPIB Kapal', value: 'CPIB_KAPAL', kategori: 'Primer' },
  { label: 'CDOIB', value: 'CDOIB', kategori: 'Primer' },
  { label: 'CPOIB', value: 'CPOIB', kategori: 'Primer' },
  { label: 'CPPIB', value: 'CPPIB', kategori: 'Primer' },
  { label: 'SKP', value: 'SKP', kategori: 'Pengolahan' },
  { label: 'HACCP', value: 'HACCP', kategori: 'Pengolahan' },
  { label: 'SPDI', value: 'SPDI', kategori: 'Pengolahan' },
];

const SEKTOR_TABS: { value: SektorTab; label: string; param: string }[] = [
  { value: 'all', label: 'Semua Sektor', param: 'all' },
  { value: 'primer', label: 'Sektor Primer (6 Skema)', param: 'primer' },
  { value: 'pengolahan', label: 'Sektor Pengolahan (3 Skema)', param: 'pengolahan' },
];

const PAGE_LIMIT = 10;

const formatTanggal = (iso: string): string => {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso || '-';
  return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const badgeStatus = (status: StatusUnit) => {
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

// Heuristik indikator kesiapan berdasarkan skor (dipakai di modal detail)
const indikatorKesiapan = (score: number) => ({
  sop: score >= 60,
  sarpras: score >= 70,
  higiene: score >= 80,
});

const IndicatorItem: React.FC<{ label: string; ok: boolean }> = ({ label, ok }) => (
  <div
    className={`rounded-lg border p-2 text-center text-[11px] ${
      ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-medium' : 'border-rose-200 bg-rose-50 text-rose-800'
    }`}
  >
    {label}: {ok ? '✓ Siap' : '✗ Perlu Perbaikan'}
  </div>
);

export const PembinaanPage: React.FC = () => {
  // --- Filter & state UI ---
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [activeSektor, setActiveSektor] = useState<SektorTab>('all');
  const [selectedSkema, setSelectedSkema] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedUnit, setSelectedUnit] = useState<UnitPembinaan | null>(null);

  // --- Data API ---
  const [kpi, setKpi] = useState<PembinaanKpi>(KPI_FALLBACK);
  const [kpiLoading, setKpiLoading] = useState<boolean>(true);
  const [unitList, setUnitList] = useState<UnitPembinaan[]>([]);
  const [pagination, setPagination] = useState<PembinaanPagination>({ total: 0, page: 1, limit: PAGE_LIMIT, total_pages: 0 });
  const [unitsLoading, setUnitsLoading] = useState<boolean>(true);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // Debounce pencarian agar tidak memanggil API tiap ketikan
  const lastDebouncedRef = useRef('');
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchKeyword.trim();
      if (next !== lastDebouncedRef.current) {
        lastDebouncedRef.current = next;
        setDebouncedSearch(next);
        setUnitsLoading(true);
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Refetch KPI saat tahun berubah
  useEffect(() => {
    let cancelled = false;
    getPembinaanKpi(selectedYear)
      .then((data) => {
        if (!cancelled) {
          setKpi(data);
          setKpiLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setKpi(KPI_FALLBACK);
          setKpiLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  // Refetch daftar unit saat filter / halaman berubah
  useEffect(() => {
    let cancelled = false;
    getPembinaanUnits({
      year: selectedYear,
      sektor: activeSektor,
      skema: selectedSkema || undefined,
      search: debouncedSearch || undefined,
      page,
      limit: PAGE_LIMIT,
    })
      .then((result) => {
        if (cancelled) return;
        setUnitList(result.items);
        setPagination(result.pagination);
        setUnitsError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setUnitList([]);
        setPagination({ total: 0, page: 1, limit: PAGE_LIMIT, total_pages: 0 });
        setUnitsError('Gagal memuat data unit bimbingan. Coba lagi.');
      })
      .finally(() => {
        if (!cancelled) setUnitsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedYear, activeSektor, selectedSkema, debouncedSearch, page]);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!selectedUnit) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUnit(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedUnit]);

  // --- Handler filter (set loading & reset halaman saat filter berubah) ---

  const handleYearChange = (year: string) => {
    if (year === selectedYear) return;
    setKpiLoading(true);
    setUnitsLoading(true);
    setSelectedYear(year);
    setPage(1);
  };

  const handleSektorChange = (sektor: SektorTab) => {
    if (sektor === activeSektor) return;
    setUnitsLoading(true);
    setActiveSektor(sektor);
    setPage(1);
  };

  // Handler chip skema: set skema + sinkronkan tab sektor otomatis
  const handleSkemaChip = (value: string) => {
    if (value === selectedSkema) return;
    setUnitsLoading(true);
    const opsi = SKEMA_OPTIONS.find((o) => o.value === value);
    if (value && opsi?.kategori === 'Primer') setActiveSektor('primer');
    else if (value && opsi?.kategori === 'Pengolahan') setActiveSektor('pengolahan');
    setSelectedSkema(value);
    setPage(1);
  };

  // Bar Chart Primer: dari kpi.primer.breakdown
  const primerBreakdown = useMemo(() => {
    const b = kpi.primer.breakdown;
    return {
      labels: ['CPIB Benih', 'CBIB Budidaya', 'CPIB Kapal', 'CDOIB Obat', 'CPOIB Obat', 'CPPIB Pakan'],
      data: [b.CPIB ?? 0, b.CBIB ?? 0, b.CPIB_KAPAL ?? 0, b.CDOIB ?? 0, b.CPOIB ?? 0, b.CPPIB ?? 0],
    };
  }, [kpi.primer.breakdown]);

  // Bar Chart Pengolahan: dari kpi.pengolahan.breakdown
  const pengolahanBreakdown = useMemo(() => {
    const b = kpi.pengolahan.breakdown;
    return {
      labels: ['SKP', 'HACCP', 'SPDI'],
      data: [b.SKP ?? 0, b.HACCP ?? 0, b.SPDI ?? 0],
    };
  }, [kpi.pengolahan.breakdown]);

  // Nomor halaman yang ditampilkan (jendela maksimal 5)
  const visiblePages = useMemo(() => {
    const total = pagination.total_pages;
    if (total <= 0) return [];
    const start = Math.max(1, Math.min(pagination.page - 2, total - 4));
    const end = Math.min(total, start + 4);
    const list: number[] = [];
    for (let i = start; i <= end; i++) list.push(i);
    return list;
  }, [pagination]);

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
          {/* FILTER TAHUN (Rentang Waktu) */}
          <label className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs">
            <span className="text-slate-400">Rentang Waktu:</span>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y === 'all' ? 'Semua Tahun' : y}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Unit Terdata</p>
          {kpiLoading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{kpi.total_unit.toLocaleString('id-ID')}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-medium text-emerald-600">{kpi.selesai_bina.toLocaleString('id-ID')} Unit</span> selesai bimbingan
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Sertifikasi Primer</p>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">6 Skema</span>
          </div>
          {kpiLoading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-blue-700">{kpi.primer.total.toLocaleString('id-ID')}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">CPIB, CBIB, CPIB Kapal, CDOIB, CPOIB, CPPIB</p>
        </div>

        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Sertifikasi Pengolahan</p>
            <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">3 Skema</span>
          </div>
          {kpiLoading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-teal-700">{kpi.pengolahan.total.toLocaleString('id-ID')}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">SKP, HACCP, & SPDI</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Potensi Siap Sertifikasi</p>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Skor &ge; 80%</span>
          </div>
          {kpiLoading ? (
            <div className="mt-2 h-9 w-24 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-2 text-3xl font-extrabold text-amber-700">{kpi.potensi_siap_sertifikasi.toLocaleString('id-ID')}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">Kandidat kuat menuju sertifikasi mutu</p>
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
            {kpiLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">Memuat grafik...</div>
            ) : (
              <BarChart
                labels={primerBreakdown.labels}
                data={primerBreakdown.data}
                colors={['#2563eb', '#3b82f6', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc']}
              />
            )}
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
            {kpiLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">Memuat grafik...</div>
            ) : (
              <BarChart
                labels={pengolahanBreakdown.labels}
                data={pengolahanBreakdown.data}
                colors={['#0d9488', '#14b8a6', '#2dd4bf']}
              />
            )}
          </div>
        </div>
      </div>

      {/* FILTER & TAB NAVIGATION */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {SEKTOR_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleSektorChange(tab.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeSektor === tab.value
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
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

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Skema Sertifikasi:</span>
          {SKEMA_OPTIONS.map((opsi) => (
            <button
              key={opsi.value}
              onClick={() => handleSkemaChip(opsi.value)}
              className={`rounded-full border px-3 py-1 font-semibold transition-all ${
                selectedSkema === opsi.value
                  ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {opsi.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400">
            Tahun: <strong className="text-slate-700">{selectedYear === 'all' ? 'Semua Tahun' : selectedYear}</strong>
            {selectedSkema && (
              <>
                {' '}| Skema: <strong className="text-slate-700">{SKEMA_OPTIONS.find((o) => o.value === selectedSkema)?.label}</strong>
              </>
            )}
          </span>
          <span className="ml-auto text-slate-400">
            Menampilkan <strong className="text-slate-700">{unitList.length}</strong> dari{' '}
            <strong className="text-slate-700">{pagination.total.toLocaleString('id-ID')}</strong> data unit
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
                <th className="px-4 py-3.5">UPT Pembina</th>
                <th className="px-4 py-3.5">Tanggal Bimbingan</th>
                <th className="px-4 py-3.5">Status & Skor Kesiapan</th>
                <th className="px-4 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-40 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded bg-slate-200" /></td>
                    <td className="px-4 py-4"><div className="mx-auto h-6 w-16 rounded bg-slate-200" /></td>
                  </tr>
                ))
              ) : unitsError ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <p className="font-semibold text-rose-600">{unitsError}</p>
                  </td>
                </tr>
              ) : unitList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Tidak ada data unit bimbingan</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Coba ubah filter tahun, sektor, skema, atau kata kunci pencarian.
                    </p>
                  </td>
                </tr>
              ) : (
                unitList.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedUnit(item)}
                        className="text-left font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {item.nama_unit}
                        <span className="text-[10px] text-blue-500">↗</span>
                      </button>
                      <p className="font-mono text-[11px] text-slate-400">NIB: {item.nib}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{item.provinsi}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-md border px-2 py-0.5 font-semibold text-[11px] ${
                          item.kategori === 'Primer'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-teal-200 bg-teal-50 text-teal-700'
                        }`}
                      >
                        {item.skema}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">Target: {item.target_sertifikasi}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800">{item.upt_pembina}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-700">{formatTanggal(item.tgl_bimbingan)}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badgeStatus(item.status)}`}>
                          {item.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full ${
                                item.readiness_score >= 80 ? 'bg-emerald-500' : item.readiness_score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.readiness_score}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{item.readiness_score}%</span>
                        </div>
                      </div>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Total <strong className="text-slate-700">{pagination.total.toLocaleString('id-ID')}</strong> unit terdata
            {pagination.total_pages > 0 && (
              <> | Halaman <strong className="text-slate-700">{pagination.page}</strong> dari{' '}
              <strong className="text-slate-700">{pagination.total_pages}</strong></>
            )}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setUnitsLoading(true);
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &laquo; Sebelumnya
            </button>
            {visiblePages.map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (num !== page) {
                    setUnitsLoading(true);
                    setPage(num);
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  num === page
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                setUnitsLoading(true);
                setPage((p) => Math.min(pagination.total_pages, p + 1));
              }}
              disabled={page >= pagination.total_pages}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya &raquo;
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL UNIT USAHA */}
      {selectedUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span
                  className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                    selectedUnit.kategori === 'Primer' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {selectedUnit.kategori} - {selectedUnit.skema}
                </span>
                <h3 className="mt-1.5 text-lg font-bold text-slate-900">{selectedUnit.nama_unit}</h3>
                <p className="text-xs text-slate-400">ID: {selectedUnit.id} | NIB: {selectedUnit.nib}</p>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup detail"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-400 uppercase">Identitas Usaha</p>
                <p className="mt-1 font-medium text-slate-800">{selectedUnit.kategori} — {selectedUnit.skema}</p>
                {/* SPDI: nama panjang skema khusus distribusi ikan */}
                {selectedUnit.skema === 'SPDI' && (
                  <p className="font-semibold text-teal-700">Sertifikat Penerapan Distribusi Ikan (SPDI)</p>
                )}
                <p className="text-slate-600">Skema Sasaran: {selectedUnit.target_sertifikasi}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase">Lokasi / Alamat</p>
                <p className="mt-1 text-slate-600">{selectedUnit.alamat}</p>
                <p className="text-slate-600">{selectedUnit.provinsi}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold text-slate-400 uppercase">UPT Pembina</p>
                <p className="mt-1 font-medium text-slate-800">{selectedUnit.upt_pembina}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-400 uppercase">Tanggal Pelaksanaan</p>
                <p className="mt-1 font-medium text-slate-800">{formatTanggal(selectedUnit.tgl_bimbingan)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/70 p-3 text-xs">
              <span className={`rounded-md border px-2 py-0.5 font-semibold ${badgeStatus(selectedUnit.status)}`}>
                {selectedUnit.status}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${
                      selectedUnit.readiness_score >= 80 ? 'bg-emerald-500' : selectedUnit.readiness_score >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${selectedUnit.readiness_score}%` }}
                  />
                </div>
                <span className="rounded-lg bg-blue-600 px-3 py-1 font-bold text-white">
                  Skor: {selectedUnit.readiness_score}%
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-700">Indikator Kesiapan</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <IndicatorItem label="Dokumen SOP" ok={indikatorKesiapan(selectedUnit.readiness_score).sop} />
                <IndicatorItem label="Sarana Prasarana" ok={indikatorKesiapan(selectedUnit.readiness_score).sarpras} />
                <IndicatorItem label="Sanitasi & Higiene" ok={indikatorKesiapan(selectedUnit.readiness_score).higiene} />
              </div>
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
