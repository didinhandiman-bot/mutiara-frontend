import { useState } from 'react';
import { pengawasanData } from '../mocks/dashboardData';
import type {
  JenisLab,
  StatusAkreditasi,
  TipeUnitMutu,
} from '../types/dashboard';

const jenisLabStyles: Record<JenisLab, string> = {
  'Lab Penguji': 'bg-teal-50 text-teal-700 border-teal-200',
  'Lab Acuan': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const statusAkreditasiStyles: Record<StatusAkreditasi, string> = {
  Aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Akan Berakhir': 'bg-amber-50 text-amber-700 border-amber-200',
  Kedaluwarsa: 'bg-rose-50 text-rose-700 border-rose-200',
};

const tipeUnitStyles: Record<TipeUnitMutu, string> = {
  Pusat: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'UPT Daerah': 'bg-slate-100 text-slate-600 border-slate-200',
};

const capaianStyle = (persen: number) => {
  if (persen >= 95) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (persen >= 85) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
};

const capaianBar = (persen: number) => {
  if (persen >= 95) return 'bg-emerald-500';
  if (persen >= 85) return 'bg-amber-500';
  return 'bg-rose-500';
};

const bulanSingkat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatTanggal = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getDate()} ${bulanSingkat[date.getMonth()]} ${date.getFullYear()}`;
};

type FilterLab = 'Semua' | JenisLab;

const FILTER_LAB: FilterLab[] = ['Semua', 'Lab Penguji', 'Lab Acuan'];

export const PengawasanManajemenMutuOcPage = () => {
  const { manajemenMutuOc } = pengawasanData;
  const {
    unitPembinaCount,
    unitPusatCount,
    unitUptCount,
    labPengujiCount,
    labAcuanCount,
    labAkreditasiPersen,
    evaluasiKinerja,
    laboratorium,
  } = manajemenMutuOc;

  const [filterLab, setFilterLab] = useState<FilterLab>('Semua');

  const pillars = [
    { label: 'Unit Pembina', value: unitPembinaCount, accent: 'bg-blue-50 text-blue-700' },
    { label: 'Unit Mutu Pusat', value: unitPusatCount, accent: 'bg-indigo-50 text-indigo-700' },
    { label: 'Unit Mutu UPT', value: unitUptCount, accent: 'bg-sky-50 text-sky-700' },
    { label: 'Lab Penguji', value: labPengujiCount, accent: 'bg-teal-50 text-teal-700' },
    { label: 'Lab Acuan', value: labAcuanCount, accent: 'bg-emerald-50 text-emerald-700' },
  ];

  const totalUnit = unitPembinaCount + unitPusatCount + unitUptCount;
  const totalLab = labPengujiCount + labAcuanCount;

  const totalTarget = evaluasiKinerja.reduce((sum, item) => sum + item.target, 0);
  const totalRealisasi = evaluasiKinerja.reduce((sum, item) => sum + item.realisasi, 0);
  const totalTemuan = evaluasiKinerja.reduce((sum, item) => sum + item.temuan, 0);
  const capaianRataRata =
    totalTarget > 0 ? Math.round((totalRealisasi / totalTarget) * 100) : 0;

  const labFiltered =
    filterLab === 'Semua'
      ? laboratorium
      : laboratorium.filter((lab) => lab.jenis === filterLab);

  const labAkanBerakhir = laboratorium.filter(
    (lab) => lab.statusAkreditasi !== 'Aktif'
  ).length;

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
            <span className="font-medium text-slate-600">Manajemen Mutu OC</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">
            Manajemen Mutu OC
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring performa dan kapasitas institusional unit penjaminan mutu di
            tingkat pusat dan daerah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-periode" className="text-xs font-semibold text-slate-500">
              Periode
            </label>
            <select
              id="filter-periode"
              defaultValue="2026"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-wilayah" className="text-xs font-semibold text-slate-500">
              Wilayah
            </label>
            <select
              id="filter-wilayah"
              defaultValue="nasional"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="nasional">Nasional</option>
              <option value="barat">Regional Barat</option>
              <option value="tengah">Regional Tengah</option>
              <option value="timur">Regional Timur</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Container: 5 Pilar Unit Mutu */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Struktur Entitas Pengawasan Mutu
            </h2>
            <p className="text-sm text-slate-500">
              Lima pilar unit pemantauan mutu di tingkat pusat dan daerah.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            {totalUnit} unit · {totalLab} laboratorium
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${pillar.accent}`}
              >
                {pillar.value}
              </span>
              <p className="mt-3 text-sm font-medium text-slate-600">
                {pillar.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Cakupan Akreditasi Laboratorium (ISO/IEC 17025)
            </span>
            <span className="text-sm font-bold text-teal-600">
              {labAkreditasiPersen}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-teal-600"
              style={{ width: `${labAkreditasiPersen}%` }}
            />
          </div>
        </div>
      </section>

      {/* Matriks Komparatif Kinerja */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Matriks Komparatif Kinerja Pengawasan
            </h2>
            <p className="text-sm text-slate-500">
              Pemenuhan target pengawasan tahunan antara unit pusat dan UPT daerah.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
              Capaian rata-rata {capaianRataRata}%
            </span>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              {totalTemuan} Temuan
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Realisasi</th>
                <th className="px-6 py-3">Capaian</th>
                <th className="px-6 py-3">Temuan</th>
                <th className="px-6 py-3">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluasiKinerja.map((item) => {
                const persen = Math.round((item.realisasi / item.target) * 100);
                return (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {item.unit}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${tipeUnitStyles[item.tipe]}`}
                      >
                        {item.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.target}</td>
                    <td className="px-6 py-3 text-slate-600">{item.realisasi}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${capaianBar(persen)}`}
                            style={{ width: `${Math.min(persen, 100)}%` }}
                          />
                        </div>
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${capaianStyle(persen)}`}
                        >
                          {persen}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`font-semibold ${
                          item.temuan >= 6 ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {item.temuan}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-slate-600">
                        {item.tindakLanjutPersen}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
          Sumber data: Pusat Manajemen Mutu (Pus MM)
        </p>
      </section>

      {/* Status Laboratorium */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Status Laboratorium Penguji & Acuan
            </h2>
            <p className="text-sm text-slate-500">
              Masa berlaku akreditasi ISO/IEC 17025 per laboratorium.
            </p>
          </div>
          {labAkanBerakhir > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {labAkanBerakhir} perlu perpanjangan
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {FILTER_LAB.map((option) => {
            const isActive = filterLab === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilterLab(option)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {labFiltered.map((lab) => (
            <div
              key={lab.id}
              className="flex flex-col rounded-xl border border-slate-200 p-5 transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${jenisLabStyles[lab.jenis]}`}
                >
                  {lab.jenis}
                </span>
                <span
                  className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${statusAkreditasiStyles[lab.statusAkreditasi]}`}
                >
                  {lab.statusAkreditasi}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-slate-800">{lab.nama}</h3>
              <p className="mt-1 text-xs text-slate-500">{lab.lokasi}</p>

              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">No. Akreditasi</dt>
                  <dd className="font-mono font-medium text-slate-600">
                    {lab.nomorAkreditasi}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">Masa Berlaku</dt>
                  <dd className="font-medium text-slate-600">
                    {formatTanggal(lab.masaBerlaku)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-400">Ruang Lingkup</dt>
                  <dd className="font-medium text-slate-600">
                    {lab.ruangLingkup} parameter
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {labFiltered.length === 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-400">
            Tidak ada laboratorium pada kategori ini.
          </div>
        )}
      </section>
    </div>
  );
};
