import { SectionHeading } from '../components/common/SectionHeading';
import { noregRequirements, upiNoreg } from '../data/landingData';

export const RegistrasiSection = () => {
  return (
    <section
      id="registrasi"
      className="bg-white dark:bg-slate-950 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Registrasi Mitra"
          title="Persyaratan Pengajuan Nomor Registrasi"
          description="Ketentuan pengajuan Nomor Registrasi (Noreg) ke negara mitra serta daftar UPI yang telah memperoleh Noreg."
        />

        {/* Persyaratan per Negara Mitra */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 transition-colors">
          Persyaratan per Negara Mitra
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {noregRequirements.map((req) => (
            <div
              key={req.negara}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white transition-colors">
                  {req.negara}
                </h4>
                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                  {req.lembaga}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {req.persyaratan.map((p) => (
                  <li
                    key={p}
                    className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 transition-colors"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tabel UPI dengan Noreg */}
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-12 mb-6 transition-colors">
          Informasi UPI yang Telah Mendapatkan Noreg
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama UPI</th>
                <th className="px-5 py-3 font-semibold">Jenis</th>
                <th className="px-5 py-3 font-semibold">Negara Mitra</th>
                <th className="px-5 py-3 font-semibold">No. Registrasi</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {upiNoreg.map((upi) => (
                <tr key={upi.nomor} className="bg-white dark:bg-slate-900/40">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {upi.nama}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{upi.jenis}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{upi.negara}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{upi.nomor}</td>
                  <td className="px-5 py-3">
                    <span className="inline-block bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {upi.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
          *) Data akan dilampirkan dari Pus Manajemen Mutu (Pus MM).
        </p>
      </div>
    </section>
  );
};
