import { useState, useEffect } from 'react';
import { getUsersApi, createUserApi, updateUserApi, deleteUserApi, type UserFormData, type User as UserType } from '../services/api';

export const UsersPage = () => {
  // Data state
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Add User Form state
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserFormData>({
    nama: '',
    email: '',
    password: '',
    role: 'operator'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit state
  const [editUser, setEditUser] = useState<UserType | null>(null);
  const [editData, setEditData] = useState<UserFormData>({
    nama: '',
    email: '',
    password: '',
    role: 'operator'
  });
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; user: UserType | null }>({
    show: false,
    user: null
  });
  const [deleting, setDeleting] = useState<boolean>(false);

  // Toast notification state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch users dari API
  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsersApi(page, pageSize);
      
      if (response.success) {
        setUsers(response.data.users);
        setTotalItems(response.data.pagination.totalItems);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError('Gagal memuat data user');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // Load awal + setiap page berubah
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Reset halaman ke 1 saat data direfresh
  const handleRefresh = () => {
    setCurrentPage(1);
    fetchUsers(1);
  };

  // Handle perubahan form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit form tambah user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (!formData.nama || !formData.email || !formData.password) {
      setFormError('Nama, email, dan password wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createUserApi(formData);
      
      if (result.success) {
        setFormSuccess(`User "${formData.nama}" berhasil ditambahkan!`);
        
        // Reset form & refresh list
        setFormData({ nama: '', email: '', password: '', role: 'operator' });
        setShowForm(false);
        setCurrentPage(1);
        fetchUsers(1);
        
        // Auto-hide success message after 3 detik
        setTimeout(() => setFormSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setFormError(err.response?.data?.message || 'Gagal menambahkan user. Email mungkin sudah terdaftar.');
    } finally {
      setSubmitting(false);
    }
  };

  // Buka modal edit
  const openEditModal = (user: UserType) => {
    setEditUser(user);
    setEditData({
      nama: user.nama,
      email: user.email,
      password: '', // Kosongkan untuk keamanan
      role: user.role as 'admin' | 'operator' | 'viewer'
    });
    setEditError(null);
  };

  // Close modal edit
  const closeEditModal = () => {
    setEditUser(null);
    setEditData({ nama: '', email: '', password: '', role: 'operator' });
    setEditError(null);
  };

  // Handle perubahan form edit
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Simpan perubahan edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;

    setEditError(null);

    if (!editData.nama || !editData.email) {
      setEditError('Nama dan email wajib diisi!');
      return;
    }

    try {
      setSavingEdit(true);
      const updatePayload: Partial<UserFormData> = {
        nama: editData.nama,
        email: editData.email,
        role: editData.role
      };
      
      // Hanya kirim password jika diisi
      if (editData.password) {
        updatePayload.password = editData.password;
      }

      const result = await updateUserApi(editUser.id, updatePayload);
      
      if (result.success) {
        showToast('success', `User "${editData.nama}" berhasil diupdate!`);
        closeEditModal();
        fetchUsers(currentPage);
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setEditError(err.response?.data?.message || 'Gagal mengupdate user');
    } finally {
      setSavingEdit(false);
    }
  };

  // Konfirmasi delete user
  const confirmDelete = (user: UserType) => {
    setDeleteConfirm({ show: true, user });
  };

  // Hapus user
  const handleDelete = async () => {
    if (!deleteConfirm.user) return;

    try {
      setDeleting(true);
      const result = await deleteUserApi(deleteConfirm.user.id);
      
      if (result.success) {
        showToast('success', `User "${deleteConfirm.user.nama}" berhasil dihapus!`);
        setDeleteConfirm({ show: false, user: null });
        fetchUsers(currentPage);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showToast('error', err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setDeleting(false);
    }
  };

  // Show toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper untuk warna badge role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'operator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Format tanggal lebih human-readable
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? '⟳ Memuat...' : '🔄 Refresh'}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            Tambah User
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border max-w-md animate-slide-in-right ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{toast.type === 'success' ? '✅' : '⚠️'}</span>
            <p className="text-sm font-medium">{toast.message}</p>
            <button 
              onClick={() => setToast(null)}
              className="ml-auto text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Form Tambah User */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-blue-100 bg-blue-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
              Form Tambah User Baru
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-5">
            {/* Success/Error Messages */}
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
                ✓ {formSuccess}
              </div>
            )}
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                ⚠ {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contoh@bppmhkp.go.id"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 karakter"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="operator">Operator</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menyimpan...
                  </>
                ) : (
                  '✓ Simpan User'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                  setFormSuccess(null);
                  setFormData({ nama: '', email: '', password: '', role: 'operator' });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

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
                <th className="py-3 px-4 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></span>
                      Memuat data user...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-red-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">⚠️</span>
                      {error}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada data user.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {user.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md border ${getRoleBadge(user.role)}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md border bg-emerald-100 text-emerald-800 border-emerald-200">
                        Aktif
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(user.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Hapus User"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-slate-500">
            Menampilkan {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, totalItems)} dari {totalItems} user
          </p>
          <div className="flex items-center gap-2">
            {/* Tombol Prev */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                currentPage <= 1
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                currentPage >= totalPages
                  ? 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Modal Edit User */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                Edit User
              </h2>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-5">
              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  ⚠ {editError}
                </div>
              )}

              <div className="space-y-4">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={editData.nama}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                {/* Password (opsional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password Baru <span className="text-slate-400">(kosongkan jika tidak diubah)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editData.password}
                    onChange={handleEditChange}
                    placeholder="Min. 6 karakter"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    minLength={6}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={editData.role}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                    required
                  >
                    <option value="admin">Administrator</option>
                    <option value="operator">Operator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingEdit ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Menyimpan...
                    </>
                  ) : (
                    '✓ Simpan Perubahan'
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Delete */}
      {deleteConfirm.show && deleteConfirm.user && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full animate-scale-in">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-lg">
                  ⚠️
                </div>
                <h3 className="font-semibold text-slate-800">Konfirmasi Hapus User</h3>
              </div>
              
              <p className="text-sm text-slate-600 mb-1">
                Apakah Anda yakin ingin menghapus user berikut?
              </p>
              <p className="text-sm font-semibold text-slate-800 mb-4">
                {deleteConfirm.user.nama} ({deleteConfirm.user.email})
              </p>
              
              <p className="text-xs text-red-600 mb-4">
                ⚠ Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-slate-200 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Menghapus...
                  </>
                ) : (
                  '🗑️ Ya, Hapus'
                )}
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: false, user: null })}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                disabled={deleting}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
