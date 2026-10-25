import axios from 'axios';

// ==========================================================================
// Service Regulasi (Nasional & Internasional)
// Base URL backend utama. Prioritas:
// 1. VITE_API_BASE_URL
// 2. Turunan dari VITE_API_URL_AUTH (akhiran /auth dibuang)
// 3. Fallback backend lokal
// ==========================================================================
const AUTH_URL = import.meta.env.VITE_API_URL_AUTH as string | undefined;

export const REGULASI_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  AUTH_URL?.replace(/\/auth\/?$/, '') ||
  'http://localhost:5007';

// --------------------------------------------------------------------------
// Tipe data
// --------------------------------------------------------------------------

export type JenisRegulasi = 'Nasional' | 'Internasional';

// Satu dokumen regulasi yang dikembalikan backend
export interface RegulationItem {
  id: number;
  kode: string;
  judul: string;
  deskripsi: string | null;
  jenis: JenisRegulasi;
  kategori: string | null;
  tahun: number | string | null;
  file_url: string | null;
  file_size: number | string | null;
  download_count: number | string;
  is_featured: boolean | number;
}

// Query string yang didukung endpoint GET /regulasi
export interface RegulasiParams {
  jenis?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RegulasiListResult {
  items: RegulationItem[];
  total: number;
}

// Bentuk respons backend: { success, data: { data: RegulationItem[], total } }
interface RegulasiListPayload {
  data?: RegulationItem[];
  total?: number;
}

interface RegulasiEnvelope {
  success?: boolean;
  data?: RegulasiListPayload;
}

const regulasiApi = axios.create({
  baseURL: REGULASI_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tempel token JWT bila tersedia (endpoint tetap bisa diakses publik)
regulasiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------------------------------------------------------------
// Endpoint
// --------------------------------------------------------------------------

// Ambil daftar regulasi; mendukung filter jenis, pencarian, dan pagination
export const getRegulasi = async (params?: RegulasiParams): Promise<RegulasiListResult> => {
  const { data } = await regulasiApi.get<RegulasiEnvelope>('/regulasi', { params });
  const payload = data?.data;

  return {
    items: Array.isArray(payload?.data) ? payload.data : [],
    total: Number(payload?.total) || 0,
  };
};

// Catat satu unduhan regulasi (counter di backend)
export const trackDownload = async (id: number): Promise<void> => {
  await regulasiApi.post(`/regulasi/${id}/download`);
};

// Susun URL file PDF dari path relatif yang dikembalikan backend
export const getRegulasiFileUrl = (fileUrl: string): string => {
  // Backend terkadang sudah mengirim URL absolut, pakai apa adanya
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${REGULASI_API_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};
