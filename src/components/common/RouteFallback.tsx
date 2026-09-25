interface RouteFallbackProps {
  /** Teks status yang ditampilkan di bawah spinner. */
  label?: string;
}

/**
 * Fallback loading untuk rute yang di-lazy-load (React.lazy + Suspense).
 *
 * Sengaja dibuat minimal & tanpa dependency agar bundle-nya tetap di chunk utama
 * (tidak menambah request baru saat halaman sedang dimuat).
 */
export const RouteFallback = ({
  label = 'Memuat halaman…',
}: RouteFallbackProps) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3"
    >
      {/* Spinner */}
      <span
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400"
      />

      {/* Teks status */}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>

      {/* Skeleton bar tipis sebagai indikator progres halus */}
      <span
        aria-hidden="true"
        className="h-1 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700"
      />
    </div>
  );
};

export default RouteFallback;
