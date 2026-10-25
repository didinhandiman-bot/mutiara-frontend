import React, { useState } from 'react';

// --- INLINE SVG ICONS (Aman dari missing package / runtime crash) ---
const IconShield = () => (
  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconBuilding = () => (
  <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconAward = () => (
  <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const IconAlert = () => (
  <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconGlobe = () => (
  <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconFile = () => (
  <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const EksekutifPage: React.FC = () => {
  const [periode, setPeriode] = useState('2025 - 2026');
  const [provinsi, setProvinsi] = useState('Semua Provinsi (Nasional)');

  // 6 KPI Strip (Persis Sesuai Mockup)
  const kpiTop = [
    {
      title: 'Kinerja Penjaminan Mutu',
      value: '92,4%',
      trend: '+ 2,1%',
      trendUp: true,
      sub: 'Kepatuhan SISJAMU',
      icon: <IconShield />,
      borderColor: 'border-blue-200',
      bgGrad: 'bg-gradient-to-br from-blue-50/40 to-white',
      valueColor: 'text-blue-900',
      bgIcon: 'bg-blue-50',
    },
    {
      title: 'Penjaminan Lembaga & Kesiapan Audit',
      value: '1.236',
      trend: '+ 6,8%',
      trendUp: true,
      sub: 'Lembaga Terverifikasi',
      icon: <IconBuilding />,
      borderColor: 'border-teal-200',
      bgGrad: 'bg-gradient-to-br from-teal-50/40 to-white',
      valueColor: 'text-teal-900',
      bgIcon: 'bg-teal-50',
    },
    {
      title: 'Sertifikasi, Produk & Ketertelusuran',
      value: '5.432',
      trend: '+ 4,5%',
      trendUp: true,
      sub: 'Sertifikat Aktif',
      icon: <IconAward />,
      borderColor: 'border-amber-200',
      bgGrad: 'bg-gradient-to-br from-amber-50/40 to-white',
      valueColor: 'text-amber-900',
      bgIcon: 'bg-amber-50',
    },
    {
      title: 'Risiko & Tindak Lanjut',
      value: '28',
      trend: '- 12,5%',
      trendUp: false,
      sub: 'Temuan Risiko Tinggi',
      icon: <IconAlert />,
      borderColor: 'border-rose-200',
      bgGrad: 'bg-gradient-to-br from-rose-50/40 to-white',
      valueColor: 'text-rose-900',
      bgIcon: 'bg-rose-50',
    },
    {
      title: 'Akses Pasar & Rantai Dingin',
      value: '42',
      trend: '+ 7,7%',
      trendUp: true,
      sub: 'Negara Tujuan Ekspor',
      icon: <IconGlobe />,
      borderColor: 'border-indigo-200',
      bgGrad: 'bg-gradient-to-br from-indigo-50/40 to-white',
      valueColor: 'text-indigo-900',
      bgIcon: 'bg-indigo-50',
    },
    {
      title: 'Executive Alert & Keputusan Pimpinan',
      value: '5',
      trend: '- 28,6%',
      trendUp: false,
      sub: 'Isu Prioritas',
      icon: <IconFile />,
      borderColor: 'border-orange-200',
      bgGrad: 'bg-gradient-to-br from-orange-50/40 to-white',
      valueColor: 'text-orange-900',
      bgIcon: 'bg-orange-50',
    },
  ];

  // Daftar Isu Prioritas
  const isuPrioritas = [
    {
      no: 1,
      isu: 'Residu obat di produk udang ekspor',
      kategori: 'Keamanan Pangan',
      lokasi: 'Jawa Timur',
      status: 'Tindak Lanjut',
      tindakLanjut: 'Investigasi & tindakan korektif pengetatan sertifikasi obat',
      target: '30 Jun 2026',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      no: 2,
      isu: 'Ketidaksesuaian suhu rantai dingin logistik',
      kategori: 'Rantai Dingin',
      lokasi: 'DKI Jakarta',
      status: 'Proses',
      tindakLanjut: 'Peningkatan pengawasan pelabuhan & sensor real-time',
      target: '15 Jun 2026',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      no: 3,
      isu: 'Sertifikat HACCP jatuh tempo ekspor',
      kategori: 'Sertifikasi',
      lokasi: 'Bali',
      status: 'Perlu Perhatian',
      tindakLanjut: 'Percepatan perpanjangan dan pendampingan inspektur UPT',
      target: '20 Jun 2026',
      statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      no: 4,
      isu: 'Akses pasar Uni Eropa (high risk)',
      kategori: 'Akses Pasar',
      lokasi: 'Nasional',
      status: 'Tindak Lanjut',
      tindakLanjut: 'Koordinasi harmonisasi standar dengan Otoritas UE',
      target: '30 Jun 2026',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      no: 5,
      isu: 'Implementasi traceability belum optimal',
      kategori: 'Ketertelusuran',
      lokasi: 'Sulawesi Selatan',
      status: 'Proses',
      tindakLanjut: 'Pendampingan pelaku usaha UPI hulu-hilir barcode',
      target: '31 Jul 2026',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  // Feed Executive Alert
  const executiveAlerts = [
    {
      id: 1,
      title: 'Tindak lanjut temuan residu obat pada produk udang ekspor',
      desc: 'Instruksikan penguatan pengawasan dan tindakan korektif di Jawa Timur. Minta percepatan proses perbaikan hasil uji ke UPT.',
      level: 'Kritis',
      date: '24 Okt 2026',
      levelBg: 'bg-rose-600 text-white',
    },
    {
      id: 2,
      title: 'Percepatan perpanjangan sertifikat HACCP yang akan jatuh tempo',
      desc: 'Minta percepatan proses dan pendampingan kepada pelaku usaha UPI yang masuk status peringatan tempo 60 hari.',
      level: 'Penting',
      date: '22 Okt 2026',
      levelBg: 'bg-amber-500 text-white',
    },
    {
      id: 3,
      title: 'Antisipasi isu akses pasar Uni Eropa (high risk products)',
      desc: 'Siapkan langkah diplomasi teknis dan pemenuhan persyaratan audit otoritas kompeten negara mitra.',
      level: 'Penting',
      date: '20 Okt 2026',
      levelBg: 'bg-amber-500 text-white',
    },
    {
      id: 4,
      title: 'Peningkatan kepatuhan rantai dingin pada pengiriman ekspor',
      desc: 'Perkuat monitoring suhu pelabuhan dan kalibrasi perangkat cold chain kapal.',
      level: 'Perhatian',
      date: '18 Okt 2026',
      levelBg: 'bg-blue-600 text-white',
    },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. HEADER SECTION (Style Identik Dashboard Pembinaan) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Beranda</span>
            <span>/</span>
            <span className="font-semibold text-slate-600">Dashboard Pimpinan MUTIARA</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Pimpinan MUTIARA
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring Jaminan Mutu Perikanan Terintegrasi Hulu-Hilir (Eselon I &amp; Pimpinan KKP)
          </p>
        </div>

        {/* Quick Filter Bar Kanan Atas */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Periode:</label>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
            >
              <option value="2025 - 2026">Tahun 2025 - 2026</option>
              <option value="2026">Tahun 2026</option>
              <option value="3-tahun">3 Tahun Terakhir</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Provinsi:</label>
            <select
              value={provinsi}
              onChange={(e) => setProvinsi(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition-colors focus:border-blue-500"
            >
              <option value="Semua Provinsi (Nasional)">Semua Provinsi (Nasional)</option>
              <option value="Jawa Barat">Jawa Barat</option>
              <option value="Jawa Timur">Jawa Timur</option>
              <option value="DKI Jakarta">DKI Jakarta</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. TOP KPI CARDS (6 Strip dengan aksen warna halus & border rapi khas Pembinaan) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpiTop.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-2xl border ${item.borderColor} ${item.bgGrad} p-4 shadow-xs transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`rounded-xl p-2 shadow-2xs ${item.bgIcon}`}>
                {item.icon}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.trendUp
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {item.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                {item.title}
              </p>
              <p className={`mt-1.5 text-3xl font-extrabold tracking-tight ${item.valueColor}`}>
                {item.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-400 truncate font-medium">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. ANALITIK VISUAL (Tren, Peta Sebaran, Donut Distribusi) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Tren Kinerja Penjaminan Mutu */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-semibold text-slate-800 text-sm">Tren Kinerja Penjaminan Mutu</h2>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                2025 - 2026
              </span>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Kepatuhan SISJAMU
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Sertifikat Aktif
              </span>
            </div>
          </div>

          <div className="mt-6 flex h-48 flex-col justify-end">
            <svg viewBox="0 0 300 120" className="h-full w-full overflow-visible">
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,95 45,80 90,75 140,60 190,45 240,35 290,28"
              />
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,105 45,95 90,85 140,75 190,65 240,55 290,45"
              />
            </svg>
            <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-400 border-t border-slate-100 pt-2">
              <span>Jan</span>
              <span>Mar</span>
              <span>Mei</span>
              <span>Jul</span>
              <span>Sep</span>
              <span>Nov</span>
              <span>Des</span>
            </div>
          </div>
        </section>

        {/* Sebaran Kinerja di Indonesia */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-semibold text-slate-800 text-sm">Sebaran Kinerja di Indonesia</h2>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                38 Provinsi
              </span>
            </div>

            <div className="relative mt-4 flex h-48 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-2.5 text-xs font-bold text-slate-700">
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">34 UPT</span>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">1.236 Pelaku Usaha</span>
                  <span className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 shadow-2xs text-rose-700">28 Temuan</span>
                </div>
                <p className="mt-4 text-xs text-slate-400 italic">
                  Peta Klaster Interaktif UPT &amp; Sebaran Sertifikasi Terpetakan
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> Kinerja Baik
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Perlu Perhatian
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Risiko Tinggi
            </span>
          </div>
        </section>

        {/* Distribusi Sertifikasi Mutu */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-semibold text-slate-800 text-sm">Distribusi Sertifikasi Mutu</h2>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-blue-500 border-t-teal-400 border-r-amber-400 border-b-indigo-500 shadow-inner">
              <div className="text-center">
                <span className="text-base font-extrabold text-slate-900">5.432</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sertifikat</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-blue-600">● Produk Pascapanen (SKP/HACCP)</span>
              <span className="font-bold text-slate-700">58%</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-teal-600">● Budidaya (CBIB/CPIB)</span>
              <span className="font-bold text-slate-700">18%</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-amber-600">● Penangkapan (CPIB Kapal)</span>
              <span className="font-bold text-slate-700">12%</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-indigo-600">● Obat &amp; Pakan</span>
              <span className="font-bold text-slate-700">12%</span>
            </div>
          </div>
        </section>
      </div>

      {/* 4. EMPAT PILAR INDIKATOR (Dengan Card Berwarna Lembut Khas Dashboard Pembinaan) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pilar 1: Penjaminan Lembaga & Kesiapan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
            Penjaminan Lembaga &amp; Kesiapan
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-400">QMS Lembaga</span>
              <p className="mt-1 text-xl font-bold text-slate-900">87%</p>
              <p className="mt-0.5 text-[10px] text-slate-500">210 dari 241 UPT</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-400">Lab Akreditasi</span>
              <p className="mt-1 text-xl font-bold text-slate-900">76%</p>
              <p className="mt-0.5 text-[10px] text-slate-500">38 dari 50 Lab</p>
            </div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs">
            <span className="text-[11px] font-semibold text-blue-800">Kesiapan Audit Nasional</span>
            <p className="mt-0.5 text-sm font-bold text-blue-900">82% (Siap Menerima Inspeksi)</p>
          </div>
        </div>

        {/* Pilar 2: Sertifikasi & Ketertelusuran */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
            Sertifikasi &amp; Ketertelusuran
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
              <span className="text-[11px] font-medium text-emerald-800">Hasil Uji Sesuai</span>
              <p className="mt-1 text-xl font-bold text-emerald-700">96,3%</p>
              <p className="mt-0.5 text-[10px] text-emerald-600">Standar SNI &amp; Mitra</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3">
              <span className="text-[11px] font-medium text-teal-800">Traceability</span>
              <p className="mt-1 text-xl font-bold text-teal-700">78%</p>
              <p className="mt-0.5 text-[10px] text-teal-600">+6,2% terdata</p>
            </div>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-xs">
            <span className="text-[11px] font-semibold text-teal-800">Volume Produksi Dijamin Mutu</span>
            <p className="mt-0.5 text-sm font-bold text-teal-900">1,24 Juta Ton Ekspor</p>
          </div>
        </div>

        {/* Pilar 3: Akses Pasar & Rantai Dingin */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
            Akses Pasar &amp; Rantai Dingin
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
              <span className="text-[11px] font-medium text-indigo-800">Registrasi Eksportir</span>
              <p className="mt-1 text-xl font-bold text-indigo-700">1.028</p>
              <p className="mt-0.5 text-[10px] text-indigo-600">Noreg Aktif Mitra</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-400">Rantai Dingin</span>
              <p className="mt-1 text-xl font-bold text-slate-900">91%</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Suhu &le; -18°C Terjaga</p>
            </div>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs">
            <span className="text-[11px] font-semibold text-indigo-800">Deviasi Suhu Pengiriman</span>
            <p className="mt-0.5 text-sm font-bold text-indigo-900">2,8% (Ditoleransi &amp; Terkendali)</p>
          </div>
        </div>

        {/* Pilar 4: Risiko & Tindak Lanjut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2.5">
            Risiko &amp; Tindak Lanjut
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-3">
              <span className="text-[11px] font-medium text-rose-800">Temuan Terbuka</span>
              <p className="mt-1 text-xl font-bold text-rose-700">56</p>
              <p className="mt-0.5 text-[10px] text-rose-600">-18,8% dari bulan lalu</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
              <span className="text-[11px] font-medium text-emerald-800">Progres CAPA</span>
              <p className="mt-1 text-xl font-bold text-emerald-700">72%</p>
              <p className="mt-0.5 text-[10px] text-emerald-600">Selesai diperbaiki</p>
            </div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-xs">
            <span className="text-[11px] font-semibold text-rose-800">Kasus Penolakan Ekspor (3 Thn)</span>
            <p className="mt-0.5 text-sm font-bold text-rose-900">23 Kasus (Terkendali &lt; 2%)</p>
          </div>
        </div>
      </div>

      {/* 5. LEVEL 4: TABEL ISU PRIORITAS & FEED EXECUTIVE ALERT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Tabel Isu Prioritas (7 Kolom) */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-800">Daftar Isu Prioritas &amp; Tindak Lanjut</h2>
              <p className="text-xs text-slate-500">
                Langkah strategis penanganan kasus mutu perikanan lintas wilayah.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              5 Isu Utama
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-medium text-slate-500">
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Isu / Temuan</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isuPrioritas.map((i) => (
                  <tr key={i.no} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-400">{i.no}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{i.isu}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{i.tindakLanjut}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{i.kategori}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{i.lokasi}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${i.statusColor}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{i.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Kolom Kanan: Executive Alert & Keputusan Pimpinan (5 Kolom) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-semibold text-slate-800">Executive Alert &amp; Keputusan Pimpinan</h2>
              <p className="text-xs text-slate-500">Arahan tindak cepat berdasarkan data real-time.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Perlu Arahan
            </span>
          </div>

          <div className="space-y-3">
            {executiveAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${alert.levelBg}`}>
                    {alert.level}
                  </span>
                  <span className="text-[11px] text-slate-400">{alert.date}</span>
                </div>
                <h3 className="mt-2 text-xs font-bold text-slate-900 leading-snug">{alert.title}</h3>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">{alert.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EksekutifPage;