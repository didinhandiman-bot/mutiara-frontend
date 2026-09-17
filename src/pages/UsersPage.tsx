import { useState } from 'react';

// Interface tipe data user
interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
  status: 'Aktif' | 'Nonaktif';
  created_at: string;
}

// Data mock awal
const MOCK_USERS: User[] = [
  { id: 1, nama: 'Ahmad Fauzi', email: 'ahmad@bppmhkp.go.id', role: 'Administrator', status: 'Aktif', created_at: '2026-01-15' },
  { id: 2, nama: 'Siti Nurhaliza', email: 'siti@bppmhkp.go.id', role: 'Operator', status: 'Aktif', created_at: '2026-02-20' },
  { id: 3, nama: 'Budi Santoso', email: 'budi@bppmhkp.go.id', role: 'Viewer', status: 'Nonaktif', created_at: '2026-03-10' },
  { id: 4, nama: 'Dewi Lestari', email: 'dewi@bppmhkp.go.id', role: 'Operator', status: 'Aktif', created_at: '2026-04-05' },
  { id: 5, nama: 'Rizky Pratama', email: 'rizky@bppmhkp.go.id', role: 'Administrator', status: 'Aktif', created_at: '2026-05-18' },
  { id: 6, nama: 'Maya Indah', email: 'maya@bppmhkp.go.id', role: 'Viewer', status: 'Aktif', created_at: '2026-06-22' },
  { id: 7, nama: 'Hendra Wijaya', email: 'hendra@bppmhkp.go.id', role: 'Operator', status: 'Nonaktif', created_at: '2026-07-01' },
  { id: 8, nama: 'Fitri Handayani', email: 'fitri@bppmhkp.go.id', role: 'Administrator', status: 'Aktif', created_at: '2026-07-15' },
  { id: 9, nama: 'Andi Kurniawan', email: 'andi@bppmhkp.go.id', role: 'Viewer', status: 'Aktif', created_at: '2026-08-03' },
  { id: 10, nama: 'Putri Rahayu', email: 'putri@bppmhkp.go.id', role: 'Operator', status: 'Aktif', created_at: '2026-08-20' },
  { id: 11, nama: 'Doni Saputra', email: 'doni@bppmhkp.go.id', role: 'Viewer', status: 'Nonaktif', created_at: '2026-09-01' },
  { id: 12, nama: 'Lina Marlina', email: 'lina@bppmhkp.go.id', role: 'Administrator', status: 'Aktif', created_at: '2026-09-10' },
  { id: 13, nama: 'Agus Setiawan', email: 'agus@bppmhkp.go.id', role: 'Operator', status: 'Aktif', created_at: '2026-09-15' },
];

export const UsersPage = () => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Hitung total halaman
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // Slice data untuk halaman saat ini
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);

  // Handle next/prev page
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Badge warna berdasarkan role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Operator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Viewer':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Badge warna berdasarkan status
  const getStatusBadge = (status: string) => {
    return status === 'Aktif'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh akun pengguna sistem BPPMHKP.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-2">
          <span className="text-lg leading-none">+</span>
          Tambah User
        </button>
      </div>

      {/* Tabel User */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {user.nama}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getRoleBadge(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusBadge(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{user.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-slate-500">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + itemsPerPage, users.length)} dari {users.length} user
          </p>
          <div className="flex items-center gap-2">
            {/* Tombol Prev */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                currentPage === 1
                  ? 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              ← Prev
            </button>

            {/* Nomor Halaman */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 text-sm font-semibold rounded-lg border transition-colors cursor-pointer ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Tombol Next */}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                currentPage === totalPages
                  ? 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
