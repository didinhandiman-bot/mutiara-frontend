import { eksekutifData } from '../mocks/dashboardData';
import type { StatusMitigasiUpi } from '../types/dashboard';

const keberterimaanTone = (rate: number) => {
  if (rate >= 98) {
    return {
      status: 'Aman',
      hero: 'from-emerald-600 to-teal-700',
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (rate >= 95) {
    return {
      status: 'Waspada',
      hero: 'from-amber-500 to-orange-600',
      dot: 'bg-amber-400',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    status: 'Kritis',
    hero: 'from-rose-600 to-red-700',
    dot: 'bg-rose-400',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  };
};

const mitigasiStyles: Record<StatusMitigasiUpi, string> = {
  'Critical Alert': 'bg-rose-50 text-rose-700 border-rose-200',
  'Under Surveillance': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const kajiUlangStyles: Record<string, string> = {
  Selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Dalam Proses': 'bg-amber-50 text-amber-700 border-amber-200',
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const EksekutifPage = () => {
  const {
    keberterimaanRate,
    totalKasus,
    totalSmkhp,
    sertifikasiTarget,
    totalNegaraTujuan,
    topNegaraTujuan,
    upiKasusBerulang,
    jaminanMutuLembaga,
  } = eksekutifData;

  const tone = keberterimaanTone(keberterimaanRate);
  const criticalCount = upiKasusBerulang.filter(
    (upi) => upi.statusMitigasi === 'Critical Alert'
  ).length;
  const maxVolume = Math.max(...topNegaraTujuan.map((n) => n.volumeTon));

  return (
    <div className="space-y-6">
      {/* Header Halaman + Quick Filter Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Beranda</span>
            <span>/</span>
            <span className="font-medium text-slate-600">Dashboard Eksekutif</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">
            Dashboard Eksekutif
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan daya saing produk, jangkauan ekspor, dan mitigasi risiko mutu
            perikanan nasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-periode" className="text-xs font-semibold text-slate-500">
              Rentang Waktu
            </label>
            <select
              id="filter-periode"
              defaultValue="3-tahun"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="3-tahun">3 Tahun Terakhir</option>
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
              <option value="jawa">Jawa</option>
              <option value="sumatera">Sumatera</option>
              <option value="sulawesi">Sulawesi</option>
              <option value="kalimantan">Kalimantan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Baris Utama: Lead Insight + Indikator Kunci */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead Insight Card (Kiri Atas) */}
        <section
          className={`rounded-2xl bg-gradient-to-br ${tone.hero} p-6 text-white shadow-sm lg:col-span-2 md:p-8`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-white/80">
            <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
            Lead Insight
          </div>

          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-5xl font-bold tracking-tight md:text-6xl">
                {keberterimaanRate.toFixed(2)}%
              </p>
              <h2 className="mt-3 text-lg font-semibold md:text-xl">
                Keberterimaan Produk Perikanan Global
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
                Dihitung dari rasio kasus penolakan terhadap total SMKHP ekspor.
                Semakin tinggi nilainya, semakin baik penerimaan produk Indonesia di
                pasar internasional.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              Status: {tone.status}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs text-white/75">SMKHP Ekspor</p>
              <p className="mt-1 text-xl font-bold">{totalSmkhp.toLocaleString('id-ID')}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs text-white/75">Kasus Penolakan</p>
              <p className="mt-1 text-xl font-bold">{totalKasus}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xs text-white/75">Formula</p>
              <p className="mt-1 text-sm font-semibold">(1 - Kasus / SMKHP) x 100%</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/70">
            Sumber data: SIAP MUTU & Pusat Manajemen Mutu (Pus MM)
          </p>
        </section>

        {/* Indikator Kunci */}
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Indikator Kunci</h2>
            <span className="text-xs font-medium text-slate-400">Tahun 2026</span>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Kapal Tersertifikasi CPIB
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {sertifikasiTarget.cpibKapalPercent}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${sertifikasiTarget.cpibKapalPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Tambak Tersertifikasi CBIB
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {sertifikasiTarget.cbibTambakPercent}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-600"
                  style={{ width: `${sertifikasiTarget.cbibTambakPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-slate-600">
                Negara Tujuan Ekspor
              </span>
              <span className="text-2xl font-bold text-slate-800">
                {totalNegaraTujuan}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Top 5 destinasi berdasarkan volume kepatuhan
            </p>

            <ul className="mt-3 space-y-2.5">
              {topNegaraTujuan.map((negara) => (
                <li key={negara.negara}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{negara.negara}</span>
                    <span className="font-semibold text-slate-500">
                      {negara.volumeTon.toLocaleString('id-ID')} ton
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-700"
                      style={{ width: `${(negara.volumeTon / maxVolume) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Baris Kedua: Early Warning + Jaminan Mutu Lembaga */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Early Warning System */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-800">
                Early Warning: Kasus Berulang UPI
              </h2>
              <p className="text-sm text-slate-500">
                Unit Pengolahan Ikan dengan cemaran/penolakan berulang dalam 3 tahun
                terakhir.
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                criticalCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  criticalCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              {criticalCount} Critical Alert
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                  <th className="px-6 py-3">Nama UPI</th>
                  <th className="px-6 py-3">Wilayah</th>
                  <th className="px-6 py-3">Insiden (3 Thn)</th>
                  <th className="px-6 py-3">Status Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upiKasusBerulang.map((upi) => (
                  <tr key={upi.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-800">{upi.namaUpi}</p>
                      <p className="text-xs font-mono text-slate-400">{upi.id}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{upi.wilayah}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-base font-bold ${
                          upi.insiden3Tahun >= 4 ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {upi.insiden3Tahun}x
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${
                          mitigasiStyles[upi.statusMitigasi]
                        }`}
                      >
                        {upi.statusMitigasi}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
            Sumber data: Pusat Manajemen Mutu (Pus MM)
          </p>
        </section>

        {/* Jaminan Mutu Lembaga */}
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="font-semibold text-slate-800">Jaminan Mutu Lembaga</h2>
          <p className="mt-1 text-sm text-slate-500">
            Evaluasi & rekomendasi hasil verifikasi ke lembaga penjamin mutu.
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                Verifikasi Selesai
              </span>
              <span className="text-xl font-bold text-emerald-600">
                {jaminanMutuLembaga.verifikasiSelesai}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                Rekomendasi Open
              </span>
              <span className="text-xl font-bold text-amber-600">
                {jaminanMutuLembaga.rekomendasiOpen}
              </span>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                Kaji Ulang Manajemen
              </span>
              <span
                className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${
                  kajiUlangStyles[jaminanMutuLembaga.kajiUlangStatus] ??
                  kajiUlangStyles.Pending
                }`}
              >
                {jaminanMutuLembaga.kajiUlangStatus}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Tracker status laporan & data dukung Kaji Ulang Manajemen (Management
              Review).
            </p>
          </div>

          <p className="mt-auto pt-6 text-xs text-slate-400">
            Sumber data: Pusat Manajemen Mutu (Pus MM)
          </p>
        </section>
      </div>
    </div>
  );
};
