import { BarChart } from '../components/common/BarChart';
import { pembinaanData } from '../mocks/dashboardData';
import type { JenisUnitUsaha } from '../types/dashboard';

const jenisUnitStyles: Record<JenisUnitUsaha, string> = {
  Kapal: 'bg-sky-50 text-sky-700 border-sky-200',
  'Unit Pengolahan': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Tambak: 'bg-teal-50 text-teal-700 border-teal-200',
};

const statusRekomendasi = (score: number) => {
  if (score >= 85) {
    return {
      label: 'Direkomendasikan',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (score >= 70) {
    return {
      label: 'Siap Diverifikasi',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  return {
    label: 'Perlu Pendampingan',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  };
};

const readinessColor = (score: number) => {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  return 'bg-amber-500';
};

const toPersen = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

export const PembinaanPage = () => {
  const { kpi, primer, pengolahan, potensiUnitUsaha } = pembinaanData;

  const primerTotal = primer.budidaya + primer.tangkap + primer.obatIkan;
  const pengolahanTotal = pengolahan.skp + pengolahan.haccp + pengolahan.spdi;
  const realisasiTotal = kpi.realisasiPrimer + kpi.realisasiPengolahan;
  const sebaranTotal = primerTotal + pengolahanTotal;

  const unitSorted = [...potensiUnitUsaha].sort(
    (a, b) => b.readinessScore - a.readinessScore
  );
  const unitDirekomendasikan = unitSorted.filter(
    (unit) => unit.readinessScore >= 85
  ).length;

  const kpiCards = [
    {
      label: 'Total Unit Usaha Dibina',
      value: kpi.totalDibina,
      note: `${toPersen(realisasiTotal, kpi.totalDibina)}% sudah direalisasikan`,
      accent: 'text-slate-800',
    },
    {
      label: 'Realisasi Pembinaan Primer',
      value: kpi.realisasiPrimer,
      note: `${toPersen(kpi.realisasiPrimer, kpi.totalDibina)}% dari total unit dibina`,
      accent: 'text-blue-600',
    },
    {
      label: 'Realisasi Pembinaan Pengolahan',
      value: kpi.realisasiPengolahan,
      note: `${toPersen(kpi.realisasiPengolahan, kpi.totalDibina)}% dari total unit dibina`,
      accent: 'text-teal-600',
    },
    {
      label: 'Total Potensi Siap Sertifikasi',
      value: kpi.potensiSertifikasi,
      note: 'Masuk pipeline verifikasi',
      accent: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Halaman + Quick Filter Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Beranda</span>
            <span>/</span>
            <span className="font-medium text-slate-600">Pembinaan</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">Pembinaan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring capaian pembinaan sertifikasi hulu (primer) dan hilir
            (pengolahan), serta pipeline unit usaha potensial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-tahun" className="text-xs font-semibold text-slate-500">
              Tahun Anggaran
            </label>
            <select
              id="filter-tahun"
              defaultValue="2026"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-provinsi" className="text-xs font-semibold text-slate-500">
              Provinsi
            </label>
            <select
              id="filter-provinsi"
              defaultValue="nasional"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="nasional">Nasional</option>
              <option value="jawa-barat">Jawa Barat</option>
              <option value="jawa-tengah">Jawa Tengah</option>
              <option value="sulawesi-selatan">Sulawesi Selatan</option>
              <option value="dki-jakarta">DKI Jakarta</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="filter-sektor" className="text-xs font-semibold text-slate-500">
              Sektor
            </label>
            <select
              id="filter-sektor"
              defaultValue="semua"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="semua">Semua Sektor</option>
              <option value="budidaya">Budidaya</option>
              <option value="tangkap">Tangkap</option>
              <option value="pengolahan">Pengolahan</option>
              <option value="obat-ikan">Obat Ikan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.accent}`}>
              {card.value.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-xs text-slate-400">{card.note}</p>
          </div>
        ))}
      </div>

      {/* Sebaran Pembinaan Primer vs Pengolahan */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              Sebaran Pembinaan: Primer vs Pengolahan
            </h2>
            <p className="text-sm text-slate-500">
              Distribusi realisasi pembinaan berdasarkan skema sertifikasi.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            Total {sebaranTotal.toLocaleString('id-ID')} unit
          </span>
        </div>

        {/* Perbandingan Primer vs Pengolahan */}
        <div className="mt-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${(primerTotal / sebaranTotal) * 100}%` }}
            />
            <div
              className="h-full bg-teal-500"
              style={{ width: `${(pengolahanTotal / sebaranTotal) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Primer · {primerTotal.toLocaleString('id-ID')} unit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Pengolahan · {pengolahanTotal.toLocaleString('id-ID')} unit
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Sertifikasi Primer
              </h3>
              <span className="text-sm font-bold text-blue-600">
                {primerTotal.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Budidaya, tangkap, dan obat ikan
            </p>
            <div className="relative mt-4 h-52">
              <BarChart
                labels={['Budidaya', 'Tangkap', 'Obat Ikan']}
                data={[primer.budidaya, primer.tangkap, primer.obatIkan]}
                colors={['#2563eb', '#3b82f6', '#60a5fa']}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-700">
                Sertifikasi Pengolahan
              </h3>
              <span className="text-sm font-bold text-teal-600">
                {pengolahanTotal.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              SKP, HACCP, dan SPDI
            </p>
            <div className="relative mt-4 h-52">
              <BarChart
                labels={['SKP', 'HACCP', 'SPDI']}
                data={[pengolahan.skp, pengolahan.haccp, pengolahan.spdi]}
                colors={['#0d9488', '#14b8a6', '#5eead4']}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tabel Potensi Unit Usaha Siap Sertifikasi */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Potensi Unit Usaha / Kapal Siap Sertifikasi
            </h2>
            <p className="text-sm text-slate-500">
              Pipeline unit dengan skor kesiapan tertinggi beserta pembina PIC.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {unitDirekomendasikan} Direkomendasikan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                <th className="px-6 py-3">Nama Usaha / Kapal</th>
                <th className="px-6 py-3">Jenis Unit</th>
                <th className="px-6 py-3">Lokasi UPT</th>
                <th className="px-6 py-3">Skor Kesiapan</th>
                <th className="px-6 py-3">Status Rekomendasi</th>
                <th className="px-6 py-3">PIC Pembina</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitSorted.map((unit) => {
                const status = statusRekomendasi(unit.readinessScore);
                return (
                  <tr
                    key={unit.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-800">{unit.namaUnit}</p>
                      <p className="text-xs font-mono text-slate-400">{unit.id}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${jenisUnitStyles[unit.jenis]}`}
                      >
                        {unit.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{unit.lokasi}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${readinessColor(unit.readinessScore)}`}
                            style={{ width: `${unit.readinessScore}%` }}
                          />
                        </div>
                        <span className="w-10 text-xs font-semibold text-slate-600">
                          {unit.readinessScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{unit.picPembina}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
          Sumber data: SIAP MUTU & mockup potensi unit usaha. Status rekomendasi
          diturunkan dari skor kesiapan.
        </p>
      </section>
    </div>
  );
};
