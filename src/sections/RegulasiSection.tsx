import { SectionHeading } from '../components/common/SectionHeading';
import { regulations } from '../data/landingData';

export const RegulasiSection = () => {
  const nasional = regulations.filter((r) => r.jenis === 'Nasional');
  const internasional = regulations.filter((r) => r.jenis === 'Internasional');

  const groups = [
    { label: 'Regulasi Nasional', items: nasional, badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' },
    { label: 'Regulasi Internasional', items: internasional, badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300' },
  ];

  return (
    <section
      id="regulasi"
      className="bg-slate-50 dark:bg-slate-900/50 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Landasan Hukum"
          title="Regulasi Nasional & Internasional"
          description="Acuan hukum dan standar yang menjadi dasar penyelenggaraan jaminan mutu hasil kelautan dan perikanan."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 transition-colors">
                {group.label}
              </h3>
              <div className="space-y-4">
                {group.items.map((reg) => (
                  <div
                    key={reg.kode}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs hover:shadow-md transition-all"
                  >
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md ${group.badge}`}>
                      {reg.kode}
                    </span>
                    <h4 className="mt-3 font-semibold text-slate-900 dark:text-white transition-colors">
                      {reg.judul}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed transition-colors">
                      {reg.deskripsi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
          *) Data akan dilampirkan dari Pus Manajemen Mutu (Pus MM).
        </p>
      </div>
    </section>
  );
};
