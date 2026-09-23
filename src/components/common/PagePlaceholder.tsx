import type { ReactNode } from 'react';

interface PagePlaceholderProps {
  title: string;
  description: string;
  breadcrumb: string[];
  children?: ReactNode;
}

export const PagePlaceholder = ({
  title,
  description,
  breadcrumb,
  children,
}: PagePlaceholderProps) => {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        {breadcrumb.map((crumb, index) => (
          <span key={crumb} className="flex items-center gap-1.5">
            {index > 0 && <span>/</span>}
            <span
              className={
                index === breadcrumb.length - 1
                  ? 'font-medium text-slate-600'
                  : undefined
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium text-slate-500">
          Halaman ini sedang dalam tahap pengembangan.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Konten dashboard akan ditambahkan pada tahap berikutnya.
        </p>
      </div>

      {children}
    </div>
  );
};
