import axios from 'axios';

// ==========================================================================
// Service Peta Sebar Laboratorium
// Base URL backend utama. Prioritas:
// 1. VITE_API_BASE_URL
// 2. Turunan dari VITE_API_URL_AUTH (akhiran /auth dibuang)
// 3. Fallback backend lokal
// ==========================================================================
const AUTH_URL = import.meta.env.VITE_API_URL_AUTH as string | undefined;

export const LAB_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  AUTH_URL?.replace(/\/auth\/?$/, '') ||
  'http://localhost:5007';

// --------------------------------------------------------------------------
// Tipe data
// --------------------------------------------------------------------------

// Data ringkas satu laboratorium untuk penanda (marker) pada peta
export interface LabMarker {
  kd_unit: string;
  nama_lab: string;
  nama_lengkap: string;
  kota: string;
  latitude: number | string;
  longitude: number | string;
  telepon: string | null;
  email: string | null;
  pic_nama: string | null;
  pic_kontak: string | null;
  nomor_akreditasi: string | null;
  total_parameter: number | string;
  kategori_uji: string | string[] | null;
}

// Satu parameter uji pada tabel rincian laboratorium
export interface LabParameter {
  nama_kategori: string;
  nama_parameter: string;
  metode_uji: string;
  status_akreditasi: string | null;
}

// Detail lengkap laboratorium (dipakai saat marker diklik)
export interface LabDetail extends LabMarker {
  alamat: string | null;
  masa_akreditasi: string | null;
  daftar_parameter: LabParameter[];
}

// Backend dapat mengembalikan data langsung atau dibungkus { success, data }
type ApiEnvelope<T> = T | { success?: boolean; data: T };

const labApi = axios.create({
  baseURL: LAB_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tempel token JWT bila tersedia (endpoint tetap bisa diakses publik)
labApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const unwrapData = <T>(payload: ApiEnvelope<T>): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

// --------------------------------------------------------------------------
// Endpoint
// --------------------------------------------------------------------------

// Ambil seluruh laboratorium untuk ditampilkan sebagai marker di peta
export const getPetaLaboratorium = async (): Promise<LabMarker[]> => {
  const { data } = await labApi.get<ApiEnvelope<LabMarker[]>>('/laboratorium/peta');
  const list = unwrapData(data);
  return Array.isArray(list) ? list : [];
};

// Ambil detail satu laboratorium berdasarkan kode unit
export const getDetailLaboratorium = async (kdUnit: string): Promise<LabDetail> => {
  const { data } = await labApi.get<ApiEnvelope<LabDetail>>(
    `/laboratorium/${encodeURIComponent(kdUnit)}`
  );
  return unwrapData(data);
};
