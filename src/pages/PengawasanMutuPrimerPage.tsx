import { useState } from 'react';
import { pengawasanData } from '../mocks/dashboardData';
import type {
  GradeSmkhp,
  JadwalSurveilans,
  StatusLogSmkhp,
} from '../types/dashboard';

type KategoriJadwal = 'Upcoming' | 'Due Soon' | 'Overdue' | 'Selesai';

type FilterJadwal = 'Semua' | KategoriJadwal;

const kategoriStyles: Record<
  KategoriJadwal,
  { badge: string; dot: string; ring: string; soft: string }
> = {
  Upcoming: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    ring: 'ring-blue-300',
    soft: 'bg-blue-50',
  },
  'Due Soon': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    ring: 'ring-amber-300',
    soft: 'bg-amber-50',
  },
  Overdue: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    ring: 'ring-rose-300',
    soft: 'bg-rose-50',
  },
  Selesai: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-300',
    soft: 'bg-emerald-50',
  },
};

const gradeStyles: Record<GradeSmkhp, { bar: string; badge: string }> = {
  A: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  B: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  C: { bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const logStatusStyles: Record<StatusLogSmkhp, string> = {
  Diperbarui: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Menunggu Verifikasi': 'bg-amber-50 text-amber-700 border-amber-200',
  Kedaluwarsa: 'bg-rose-50 text-rose-700 border-rose-200',
};

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

const classifyJadwal = (jadwal: JadwalSurveilans): KategoriJadwal => {
  if (jadwal.status === 'Overdue') return 'Overdue';
  if (jadwal.status === 'Selesai') return 'Selesai';
  const sisa = daysUntil(jadwal.tanggal);
  if (sisa < 0) return 'Overdue';
  if (jadwal.status === 'Berjalan' || sisa <= 7) return 'Due Soon';
  return 'Upcoming';
};

const labelSisaHari = (jadwal: JadwalSurveilans, kategori: KategoriJadwal) => {
  if (kategori === 'Selesai') return 'Selesai';
  const sisa = daysUntil(jadwal.tanggal);
  if (kategori === 'Overdue') return `Terlambat ${Math.abs(sisa)} hari`;
  if (sisa === 0) return 'Hari ini';
  if (sisa === 1) return 'Besok';
  return `${sisa} hari lagi`;
};

const FILTER_OPTIONS: FilterJadwal[] = [
  'Semua',
  'Upcoming',
  'Due Soon',
  'Overdue',
  'Selesai',
];

export const PengawasanMutuPrimerPage = () => {
  const { mutuPrimer } = pengawasanData;
  const { totalSertifikasiAktif, noregTerdaftar, jadwalSurveilans, updateSmkhp, ujiLabJakarta } =
    mutuPrimer;

  const [activeFilter, setActiveFilter] = useState<FilterJadwal>('Semua');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const jadwalDenganKategori = jadwalSurveilans
    .map((jadwal) => ({ ...jadwal, kategori: classifyJadwal(jadwal) }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  const counts = FILTER_OPTIONS.reduce<Record<FilterJadwal, number>>(
    (acc, option) => {
      acc[option] =
        option === 'Semua'
          ? jadwalDenganKategori.length
          : jadwalDenganKategori.filter((item) => item.kategori === option).length;
      return acc;
    },
    { Semua: 0, Upcoming: 0, 'Due Soon': 0, Overdue: 0, Selesai: 0 }
  );

  const filteredJadwal =
    activeFilter === 'Semua'
      ? jadwalDenganKategori
      : jadwalDenganKategori.filter((item) => item.kategori === activeFilter);

  const selected =
    jadwalDenganKategori.find((item) => item.id === selectedId) ??
    filteredJadwal[0] ??
    null;

  const totalGrade = updateSmkhp.gradeDistribusi.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );

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
              defaultValue="2026"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="2026">Tahun 2026</option>
              <option value="q3">Kuartal III 2026</option>
              <option value="q4">Kuartal IV 2026</option>
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

      {/* Baris Utama: Hero Status Kepatuhan + Perhatian Utama */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm lg:col-span-2 md:p-8">
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Status Kepatuhan Mutu Primer
          </div>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-5xl font-bold tracking-tight md:text-6xl">
                {totalSertifikasiAktif}
              </p>
              <h2 className="mt-3 text-lg font-semibold md:text-xl">
                Sertifikasi Aktif
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
                Sebaran skema sertifikasi mutu primer dan pascapanen yang berlaku,
                didampingi nomor registrasi (Noreg) eksportir.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 px-5 py-4 text-center backdrop-blur-sm">
                <p className="text-3xl font-bold">{noregTerdaftar}</p>
                <p className="mt-1 text-xs text-white/75">Noreg Terdaftar</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Patuh
              </span>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/70">
            Sumber data: SIAP MUTU & Pusat Manajemen Mutu (Pus MM)
          </p>
        </section>

        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="font-semibold text-slate-800">Perhatian Utama</h2>
          <p className="mt-1 text-sm text-slate-500">
            Indikator yang perlu tindak lanjut segera.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-amber-800">
                  SMKHP Jatuh Tempo
                </p>
                <p className="text-xs text-amber-600">&lt; 60 hari</p>
              </div>
              <span className="text-xl font-bold text-amber-700">
                {updateSmkhp.akanKedaluwarsa}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-rose-800">
                  Deviasi Uji Lab
                </p>
                <p className="text-xs text-rose-600">Kasus aktif</p>
              </div>
              <span className="text-xl font-bold text-rose-700">
                {ujiLabJakarta.deviasiKasus}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Rasio Lulus Uji
                </p>
                <p className="text-xs text-emerald-600">UPT Jakarta</p>
              </div>
              <span className="text-xl font-bold text-emerald-700">
                {ujiLabJakarta.lulusUjiPersen}%
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Section Verifikasi & Surveilans */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Jadwal Verifikasi & Surveilans
            </h2>
            <p className="text-sm text-slate-500">
              Timeline pengawasan lapangan terdekat beserta status tindak lanjut.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Sumber: SIAP MUTU & Honnes Pus Pascapanen
          </span>
        </div>

        {/* Filter Status */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-3">
          {FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setActiveFilter(option)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                  }`}
                >
                  {counts[option]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          {/* Timeline */}
          <div className="lg:col-span-2">
            {filteredJadwal.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-400">
                Tidak ada jadwal pada kategori ini.
              </div>
            ) : (
              <ol className="relative space-y-3 border-l border-slate-200 pl-6">
                {filteredJadwal.map((jadwal) => {
                  const style = kategoriStyles[jadwal.kategori];
                  const isSelected = selected?.id === jadwal.id;
                  return (
                    <li key={jadwal.id} className="relative">
                      <span
                        className={`absolute -left-[31px] top-4 h-3 w-3 rounded-full ring-4 ring-white ${style.dot}`}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedId(jadwal.id)}
                        className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? `border-transparent ring-2 ${style.ring} ${style.soft}`
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">
                            {jadwal.namaUnit}
                          </span>
                          <span
                            className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
                          >
                            {jadwal.kategori}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="font-mono text-slate-400">{jadwal.id}</span>
                          <span>{formatTanggal(jadwal.tanggal)}</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium text-slate-600">
                              {jadwal.tipe}
                            </span>
                          </span>
                          <span className="font-medium text-slate-600">
                            {labelSisaHari(jadwal, jadwal.kategori)}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Detail Jadwal Terpilih */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
              <h3 className="text-sm font-semibold text-slate-700">
                Detail Jadwal
              </h3>
              {selected ? (
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">Nama Unit</dt>
                    <dd className="font-medium text-slate-800">
                      {selected.namaUnit}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">Tipe</dt>
                    <dd className="font-medium text-slate-700">{selected.tipe}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">Tanggal</dt>
                    <dd className="font-medium text-slate-700">
                      {formatTanggal(selected.tanggal)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">Status</dt>
                    <dd>
                      <span
                        className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${kategoriStyles[selected.kategori].badge}`}
                      >
                        {selected.kategori}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-xs text-slate-400">Sisa Waktu</dt>
                    <dd className="font-medium text-slate-700">
                      {labelSisaHari(selected, selected.kategori)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  Pilih salah satu jadwal untuk melihat detail.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section Update SMKHP */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">Data Update SMKHP</h2>
            <p className="text-sm text-slate-500">
              Monitoring pembaruan Sertifikat Mutu Kelayakan Hasil Perikanan.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            {updateSmkhp.totalAktif} SMKHP Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">
          {/* Grade UPI / Unit */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
            <h3 className="text-sm font-semibold text-slate-700">
              Ringkasan Grade UPI / Unit
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Distribusi grade berdasarkan hasil evaluasi kepatuhan.
            </p>

            <div className="mt-5 space-y-4">
              {updateSmkhp.gradeDistribusi.map((item) => {
                const persen = Math.round((item.jumlah / totalGrade) * 100);
                return (
                  <div key={item.grade}>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${gradeStyles[item.grade].badge}`}
                      >
                        {item.grade}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {item.jumlah} unit · {persen}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${gradeStyles[item.grade].bar}`}
                        style={{ width: `${persen}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-xs text-slate-500">Mendekati jatuh tempo</span>
              <span className="text-sm font-bold text-amber-600">
                {updateSmkhp.akanKedaluwarsa} unit
              </span>
            </div>
          </div>

          {/* Log Pembaruan Terakhir */}
          <div className="rounded-xl border border-slate-100 bg-white">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-700">
                Log Pembaruan Terakhir
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 font-medium text-slate-500">
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5">Diperbarui</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {updateSmkhp.logPembaruan.map((log) => (
                    <tr key={log.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{log.namaUnit}</p>
                        <p className="text-xs font-mono text-slate-400">{log.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-600">{formatTanggal(log.tanggal)}</p>
                        <p className="text-xs text-slate-400">
                          s.d. {formatTanggal(log.berlakuHingga)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${logStatusStyles[log.status]}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section Uji Laboratorium UPT Jakarta */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Uji Laboratorium UPT Jakarta
            </h2>
            <p className="text-sm text-slate-500">
              Rekapitulasi pengujian sampel perikanan dan status cemaran.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Sumber: UPT Laboratorium Jakarta
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
          {/* Rasio Lulus */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/60 p-5">
            <div className="relative h-40 w-40">
              <div
                className="h-40 w-40 rounded-full"
                style={{
                  background: `conic-gradient(#0d9488 ${ujiLabJakarta.lulusUjiPersen}%, #e2e8f0 0)`,
                }}
              />
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-800">
                  {ujiLabJakarta.lulusUjiPersen}%
                </span>
                <span className="text-xs text-slate-400">Lulus Syarat</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              dari {ujiLabJakarta.totalSampel.toLocaleString('id-ID')} sampel diuji
            </p>
          </div>

          {/* Parameter + Alert */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 font-medium text-slate-500">
                    <th className="px-4 py-2.5">Parameter Uji</th>
                    <th className="px-4 py-2.5">Jumlah Sampel</th>
                    <th className="px-4 py-2.5">Lulus Syarat</th>
                    <th className="px-4 py-2.5">Deviasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ujiLabJakarta.parameterUji.map((param) => (
                    <tr key={param.parameter} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {param.parameter}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {param.jumlahSampel.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${param.lulusPersen}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">
                            {param.lulusPersen}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            param.deviasi > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {param.deviasi}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ujiLabJakarta.deviasiKasus > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-rose-500" />
                <div>
                  <p className="text-sm font-semibold text-rose-800">
                    Alert Cemaran Aktif
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-rose-600">
                    Terdapat {ujiLabJakarta.deviasiKasus} kasus deviasi dari{' '}
                    {ujiLabJakarta.totalSampel.toLocaleString('id-ID')} sampel.
                    Prioritaskan penelusuran pada parameter dengan deviasi
                    tertinggi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
