import { useState, useEffect } from 'react';

// Interface tipe data aktivitas
interface ActivityItem {
  id: string;
  layanan: string;
  pemohon: string;
  tanggal: string;
  status: 'Diproses' | 'Disetujui' | 'Ditolak';
}

export const DashboardPage = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Data mock awal (bisa diganti dengan API dashboardService nanti)
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities([
        {
          id: 'REQ-001',
          layanan: 'Sertifikasi Mutu',
          pemohon: 'PT Fishery Utama',
          tanggal: '2026-08-20',
          status: 'Diproses',
        },
        {
          id: 'REQ-002',
          layanan: 'Izin Ekspor Hasil Laut',
          pemohon: 'CV Bahari Nusantara',
          tanggal: '2026-08-19',
          status: 'Disetujui',
        },
        {
          id: 'REQ-003',
          layanan: 'Inspeksi Karantina',
          pemohon: 'UD Sea Product',
          tanggal: '2026-08-18',
          status: 'Ditolak',
        },
        {
          id: 'REQ-004',
          layanan: 'Pengujian Laboratorium',
          pemohon: 'PT Samudra Jaya',
          tanggal: '2026-08-17',
          status: 'Disetujui',
        },
      ]);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Helper untuk warna badge status
  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'Disetujui':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Diproses':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ditolak':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Ringkasan</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau status layanan dan pengajuan terkini di BPPMHKP.
        </p>
      </div>

      {/* Ringkasan Statistik (Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Total Pengajuan</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-slate-800">128</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +12%
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Sedang Diproses</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-amber-600">24</span>
            <span className="text-xs font-medium text-slate-400">Aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Disetujui</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-emerald-600">96</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              75% Rate
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-sm font-medium text-slate-500">Ditolak</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-bold text-rose-600">8</span>
            <span className="text-xs font-medium text-slate-400">Revisi</span>
          </div>
        </div>
      </div>

      {/* Tabel Aktivitas Terakhir */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Aktivitas Pengajuan Terbaru</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Lihat Semua
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">Jenis Layanan</th>
                <th className="py-3 px-4">Pemohon</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Memuat data aktivitas...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada aktivitas transaksi.
                  </td>
                </tr>
              ) : (
                activities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.layanan}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{item.pemohon}</td>
                    <td className="py-3 px-4 text-slate-500">{item.tanggal}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};