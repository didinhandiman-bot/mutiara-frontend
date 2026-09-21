import { SectionHeading } from '../components/common/SectionHeading';
import { certifications, noregInfo } from '../data/landingData';

export const SertifikasiSection = () => {
  const totalSertifikat = certifications.length;

  return (
    <section
      id="sertifikasi"
      className="bg-white dark:bg-slate-950 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Sertifikasi"
          title="Jumlah Sertifikasi BPPMHKP"
          description="Rekapitulasi jenis sertifikat yang diterbitkan BPPMHKP — 9 jenis sertifikat dan 1 Nomor Registrasi (Noreg)."
        />

        {/* Highlight total */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-blue-600 text-white rounded-xl p-6 shadow-md">
            <p className="text-4xl font-extrabold">{totalSertifikat}</p>
            <p className="mt-1 text-sm text-blue-100">Jenis Sertifikat</p>
          </div>
          <div className="bg-emerald-600 text-white rounded-xl p-6 shadow-md">
            <p className="text-4xl font-extrabold">1</p>
            <p className="mt-1 text-sm text-emerald-100">Nomor Registrasi (Noreg)</p>
          </div>
          <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-6 shadow-md">
            <p className="text-sm text-slate-300">Sumber Data</p>
            <p className="mt-1 text-lg font-semibold">SIAP MUTU &amp; Pus Manajemen Mutu</p>
          </div>
        </div>

        {/* Grid 9 sertifikat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certifications.map((cert, index) => (
            <div
              key={cert.nama}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 p-5 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                  {cert.singkatan}
                </span>
              </div>
              <h4 className="mt-3 font-semibold text-sm text-slate-900 dark:text-white transition-colors">
                {cert.nama}
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                {cert.jumlah}
              </p>
            </div>
          ))}
        </div>

        {/* Noreg */}
        <div className="mt-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 flex items-center justify-between flex-wrap gap-3 transition-colors">
          <div>
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 transition-colors">
              {noregInfo.nama}
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 transition-colors">
              {noregInfo.jumlah}
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1 rounded-full">
            {noregInfo.singkatan}
          </span>
        </div>

        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 text-center transition-colors">
          *) Data sementara (contoh) dari SIAP MUTU dan Pus Manajemen Mutu.
        </p>
      </div>
    </section>
  );
};
