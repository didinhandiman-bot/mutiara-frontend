import { SectionHeading } from '../components/common/SectionHeading';
import { shipStats, actorStats, upiStats } from '../data/landingData';

export const DataSection = () => {
  return (
    <section
      id="data"
      className="bg-slate-50 dark:bg-slate-900/50 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Ringkasan Data"
          title="Data Kapal, Pelaku Usaha & UPI Terdaftar"
          description="Rekapitulasi data kelautan dan perikanan dari berbagai sumber kementerian dan direktorat jenderal."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Kapal */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-xs transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-5 transition-colors">
              Data Kapal
            </h3>
            <div className="space-y-5">
              {shipStats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors">
                    {s.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">
                    Sumber: {s.sumber}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Jumlah Pelaku Usaha */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-xs transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-5 transition-colors">
              Jumlah Pelaku Usaha
            </h3>
            <div className="space-y-5">
              {actorStats.map((a) => (
                <div key={a.label}>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 transition-colors">
                    {a.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                    {a.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* UPI Terdaftar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 shadow-xs transition-colors">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-5 transition-colors">
              Jumlah UPI Terdaftar
            </h3>
            <div className="space-y-5">
              {upiStats.map((u) => (
                <div key={u.label}>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 transition-colors">
                    {u.value}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                    {u.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
          *) Data sementara (contoh) dari KKP, DJPT, DJPB, dan DJPDSKP. Akan diperbarui.
        </p>
      </div>
    </section>
  );
};
