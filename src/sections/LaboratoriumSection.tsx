import { useEffect, useRef, useState, type MouseEvent } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { SectionHeading } from '../components/common/SectionHeading';
import {
  getDetailLaboratorium,
  getPetaLaboratorium,
  type LabDetail,
  type LabMarker,
} from '../services/laboratoriumService';

// Perbaikan ikon marker default Leaflet untuk bundler Vite:
// Vite tidak otomatis meresolve path gambar milik Leaflet, jadi asetnya diimpor manual.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const INDONESIA_CENTER: L.LatLngTuple = [-2.5, 118.0];
const INDONESIA_ZOOM = 5;

const formatNumber = (value: number | string): string => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? new Intl.NumberFormat('id-ID').format(parsed) : String(value);
};

// kategori_uji dapat berupa string dipisah koma atau array dari backend
const toCategoryList = (value: LabMarker['kategori_uji']): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toWhatsAppNumber = (value: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
};

const statusBadgeClass = (status: string | null): string => {
  const normalized = (status ?? '').toLowerCase();
  if (!normalized) {
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }
  if (normalized.includes('tidak') || normalized.includes('non')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  }
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
};

export const LaboratoriumSection = () => {
  const [labs, setLabs] = useState<LabMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labsReloadKey, setLabsReloadKey] = useState(0);

  const [selectedLab, setSelectedLab] = useState<LabMarker | null>(null);
  const [activeLabDetail, setActiveLabDetail] = useState<LabDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailReloadKey, setDetailReloadKey] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const isModalOpen = selectedLab !== null;
  const lab = activeLabDetail ?? selectedLab;
  const categories = lab ? toCategoryList(lab.kategori_uji) : [];
  const parameters = activeLabDetail?.daftar_parameter ?? [];
  const whatsappNumber = lab ? toWhatsAppNumber(lab.pic_kontak ?? lab.telepon) : null;
  const phoneHref = lab?.telepon ? `tel:${lab.telepon.replace(/[^\d+]/g, '')}` : null;

  // Ambil daftar laboratorium untuk marker peta
  useEffect(() => {
    let active = true;

    getPetaLaboratorium()
      .then((data) => {
        if (active) setLabs(data);
      })
      .catch((err) => {
        console.error('Gagal memuat peta laboratorium:', err);
        if (active) {
          setError('Tidak dapat memuat data laboratorium. Pastikan backend sudah berjalan.');
          setLabs([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [labsReloadKey]);

  // Inisialisasi peta Leaflet + render marker setiap laboratorium
  useEffect(() => {
    if (!mapContainerRef.current || labs.length === 0) return;

    const map = L.map(mapContainerRef.current, {
      center: INDONESIA_CENTER,
      zoom: INDONESIA_ZOOM,
      minZoom: 3,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    labs.forEach((item) => {
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindTooltip(item.nama_lab);

      marker.on('click', () => {
        setSelectedLab(item);
        setActiveLabDetail(null);
        setDetailError(null);
        setDetailLoading(true);
      });
    });

    return () => {
      map.remove();
    };
  }, [labs]);

  // Ambil detail laboratorium saat marker dipilih
  useEffect(() => {
    if (!selectedLab) return;

    let active = true;

    getDetailLaboratorium(selectedLab.kd_unit)
      .then((data) => {
        if (active) setActiveLabDetail(data);
      })
      .catch((err) => {
        console.error('Gagal memuat detail laboratorium:', err);
        if (active) setDetailError('Rincian laboratorium belum dapat dimuat.');
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedLab, detailReloadKey]);

  // Kunci scroll halaman + tutup modal dengan tombol Escape
  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedLab(null);
        setActiveLabDetail(null);
        setDetailError(null);
        setDetailLoading(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const handleRetryLabs = () => {
    setLoading(true);
    setError(null);
    setLabsReloadKey((key) => key + 1);
  };

  const handleRetryDetail = () => {
    setDetailLoading(true);
    setDetailError(null);
    setDetailReloadKey((key) => key + 1);
  };

  const closeModal = () => {
    setSelectedLab(null);
    setActiveLabDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeModal();
  };

  return (
    <section
      id="laboratorium"
      className="bg-white dark:bg-slate-950 py-16 px-4 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto w-full">
        <SectionHeading
          eyebrow="Laboratorium Badan Mutu"
          title="Peta Sebar Laboratorium"
          description="Jelajahi laboratorium penguji hasil perikanan yang tersebar di seluruh Indonesia. Klik penanda pada peta untuk melihat profil, kontak PIC, dan rincian parameter uji."
        />

        {/* Peta full-width */}
        <div className="relative isolate w-full h-[550px] md:h-[600px] overflow-hidden rounded-2xl border border-slate-200 shadow-md transition-colors dark:border-slate-800">
          {loading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400" />
              <p className="text-sm">Memuat peta laboratorium…</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-100 px-6 text-center dark:bg-slate-800">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={handleRetryLabs}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && labs.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100 px-6 text-center dark:bg-slate-800">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Belum ada data laboratorium
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data peta sebar laboratorium belum tersedia saat ini.
              </p>
            </div>
          )}

          {!loading && !error && labs.length > 0 && (
            <div
              ref={mapContainerRef}
              className="h-full w-full"
              aria-label="Peta sebar laboratorium di Indonesia"
            />
          )}

          {!loading && !error && labs.length > 0 && (
            <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-slate-900/95 dark:text-slate-200">
              <span className="font-semibold">{labs.length}</span> laboratorium · klik penanda
              untuk melihat profil
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors">
          Sumber data: Basis data laboratorium BPPMHKP. Peta menggunakan OpenStreetMap.
        </p>
      </div>

      {/* Modal profil laboratorium */}
      {isModalOpen && lab && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={handleBackdropClick}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lab-modal-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-colors dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Header modal */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 transition-colors dark:border-slate-700">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Profil Laboratorium
                </p>
                <h3
                  id="lab-modal-title"
                  className="mt-1 text-lg font-bold leading-snug text-slate-900 dark:text-white md:text-xl"
                >
                  {lab.nama_lab}
                </h3>
                {lab.nama_lengkap && lab.nama_lengkap !== lab.nama_lab && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {lab.nama_lengkap}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    📍 {lab.kota || 'Kota belum tersedia'}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    Kode Unit: {lab.kd_unit || '-'}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    KAN: {lab.nomor_akreditasi || '-'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Tutup profil laboratorium"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* Body modal */}
            <div className="overflow-y-auto p-5">
              {detailLoading && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400" />
                  <p className="text-sm">Memuat profil laboratorium…</p>
                </div>
              )}

              {!detailLoading && detailError && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{detailError}</p>
                  <button
                    type="button"
                    onClick={handleRetryDetail}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {!detailLoading && !detailError && (
                <div className="space-y-6">
                  {/* Grid ringkasan */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4 transition-colors dark:bg-slate-800/70">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Total Parameter Uji
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                        {formatNumber(lab.total_parameter)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 transition-colors dark:bg-slate-800/70">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Masa Akreditasi
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        {activeLabDetail?.masa_akreditasi || 'Belum tersedia'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 transition-colors dark:bg-slate-800/70">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Kategori Pengujian
                      </p>
                      {categories.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {categories.map((category) => (
                            <span
                              key={category}
                              className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          Belum tersedia
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informasi kontak */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Informasi Kontak
                    </h4>
                    <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Alamat</dt>
                        <dd className="mt-0.5 text-slate-800 dark:text-slate-200">
                          {activeLabDetail?.alamat || 'Alamat belum tersedia'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">
                          Penanggung Jawab (PIC)
                        </dt>
                        <dd className="mt-0.5 text-slate-800 dark:text-slate-200">
                          {lab.pic_nama || 'Belum tersedia'}
                          {lab.pic_kontak && (
                            <span className="block text-xs text-slate-500 dark:text-slate-400">
                              {lab.pic_kontak}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Telepon</dt>
                        <dd className="mt-0.5">
                          {lab.telepon ? (
                            <a
                              href={phoneHref ?? '#'}
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {lab.telepon}
                            </a>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              Belum tersedia
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Email</dt>
                        <dd className="mt-0.5">
                          {lab.email ? (
                            <a
                              href={`mailto:${lab.email}`}
                              className="break-all text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {lab.email}
                            </a>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              Belum tersedia
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {whatsappNumber && (
                      <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.06s.89 2.39 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z" />
                        </svg>
                        Hubungi via WhatsApp
                      </a>
                    )}
                  </div>

                  {/* Tabel parameter uji */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Parameter Uji
                    </h4>
                    {parameters.length === 0 ? (
                      <p className="mt-3 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                        Belum ada data parameter uji untuk laboratorium ini.
                      </p>
                    ) : (
                      <div className="mt-3 max-h-60 overflow-y-auto rounded-lg border border-slate-200 transition-colors dark:border-slate-700">
                        <table className="w-full min-w-[36rem] text-left text-sm">
                          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 transition-colors dark:bg-slate-800 dark:text-slate-400">
                            <tr>
                              <th scope="col" className="px-4 py-3 font-semibold">
                                Kategori
                              </th>
                              <th scope="col" className="px-4 py-3 font-semibold">
                                Nama Parameter
                              </th>
                              <th scope="col" className="px-4 py-3 font-semibold">
                                Standar / Metode Uji
                              </th>
                              <th scope="col" className="px-4 py-3 font-semibold">
                                Status Akreditasi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                            {parameters.map((parameter, index) => (
                              <tr
                                key={`${parameter.nama_kategori}-${parameter.nama_parameter}-${index}`}
                                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                                  {parameter.nama_kategori || '-'}
                                </td>
                                <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">
                                  {parameter.nama_parameter || '-'}
                                </td>
                                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                                  {parameter.metode_uji || '-'}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span
                                    className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(
                                      parameter.status_akreditasi
                                    )}`}
                                  >
                                    {parameter.status_akreditasi || 'Belum diketahui'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
