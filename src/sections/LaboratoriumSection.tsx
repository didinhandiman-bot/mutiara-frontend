import { SectionHeading } from '../components/common/SectionHeading';
import {
  labContacts,
  labLocation,
  testParameters,
  accreditations,
} from '../data/landingData';

export const LaboratoriumSection = () => {
  return (
    <section
      id="laboratorium"
      className="bg-white dark:bg-slate-950 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Profil Laboratorium"
          title="Laboratorium Badan Mutu"
          description="Laboratorium penguji hasil perikanan yang terakreditasi untuk mendukung penjaminan mutu dan keamanan produk."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Peta & Titik Lokasi */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden shadow-xs transition-colors">
            <iframe
              title={`Peta lokasi ${labLocation.nama}`}
              src={labLocation.embedUrl}
              className="w-full h-80 border-0"
              loading="lazy"
            />
            <div className="p-5">
              <p className="font-semibold text-slate-900 dark:text-white transition-colors">
                {labLocation.nama}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                Koordinat: {labLocation.koordinat}
              </p>
              <a
                href={labLocation.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Buka di peta ↗
              </a>
            </div>
          </div>

          {/* Alamat, Kontak & Akreditasi */}
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 transition-colors">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 transition-colors">
                Alamat & Kontak
              </h3>
              <dl className="space-y-3">
                {labContacts.map((item) => (
                  <div key={item.label} className="grid grid-cols-3 gap-3 text-sm">
                    <dt className="text-slate-500 dark:text-slate-400 transition-colors">
                      {item.label}
                    </dt>
                    <dd className="col-span-2 text-slate-800 dark:text-slate-200 transition-colors">
                      {item.href ? (
                        <a href={item.href} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 transition-colors">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 transition-colors">
                Akreditasi
              </h3>
              <ul className="space-y-4">
                {accreditations.map((acc) => (
                  <li key={acc.nomor} className="border-l-2 border-blue-500 pl-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white transition-colors">
                      {acc.lembaga}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors">
                      {acc.nomor}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">
                      {acc.ruangLingkup} · {acc.berlaku}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Kemampuan Uji / Parameter Uji */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 transition-colors">
            Profil Kemampuan Uji / Parameter Uji
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testParameters.map((tp) => (
              <div
                key={tp.kategori}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs transition-colors"
              >
                <h4 className="font-semibold text-slate-900 dark:text-white transition-colors">
                  {tp.kategori}
                </h4>
                <ul className="mt-3 space-y-1">
                  {tp.parameter.map((p) => (
                    <li
                      key={p}
                      className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 transition-colors"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 transition-colors">
                  Metode: {tp.metode}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
          *) Data sementara (contoh). Akan diperbarui dari Pus Manajemen Mutu.
        </p>
      </div>
    </section>
  );
};
