import { Link } from 'react-router-dom';

export const AccessDeniedPage = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <p className="text-4xl font-bold text-rose-500">403</p>
        <h1 className="mt-3 text-xl font-bold text-slate-800">
          Akses Ditolak
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Role akun Anda tidak memiliki hak akses untuk membuka halaman ini.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};
