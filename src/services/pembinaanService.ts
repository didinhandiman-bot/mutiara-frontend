import axios from 'axios';

// ==========================================================================
// Service Pembinaan Mutu (Endpoint Publik)
// Base URL backend utama. Prioritas:
// 1. VITE_API_BASE_URL
// 2. Turunan dari VITE_API_URL_AUTH (akhiran /auth dibuang)
// 3. Fallback backend lokal
// ==========================================================================
const AUTH_URL = import.meta.env.VITE_API_URL_AUTH as string | undefined;

export const PEMBINAAN_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  AUTH_URL?.replace(/\/auth\/?$/, '') ||
  'http://localhost:5007';

const pembinaanApi = axios.create({
  baseURL: `${PEMBINAAN_API_BASE_URL}/api/v1/public/pembinaan`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --------------------------------------------------------------------------
// Tipe data
// --------------------------------------------------------------------------

// Breakdown 6 skema sektor primer
export interface PrimerBreakdown {
  CPIB?: number;
  CBIB?: number;
  CPIB_KAPAL?: number;
  CDOIB?: number;
  CPOIB?: number;
  CPPIB?: number;
}

// Breakdown 3 skema sektor pengolahan
export interface PengolahanBreakdown {
  SKP?: number;
  HACCP?: number;
  SPDI?: number;
}

export interface PembinaanKpi {
  total_unit: number;
  selesai_bina: number;
  primer: { total: number; breakdown: PrimerBreakdown };
  pengolahan: { total: number; breakdown: PengolahanBreakdown };
  potensi_siap_sertifikasi: number;
  selected_year: string;
}

export interface PembinaanKpiEnvelope {
  success?: boolean;
  data?: PembinaanKpi;
}

export type KategoriUnit = 'Primer' | 'Pengolahan';
export type StatusUnit = 'Selesai Pembinaan' | 'Sedang Didampingi' | 'Perbaikan CAPA';

// Satu unit bimbingan pada tabel master data
export interface UnitPembinaan {
  id: string;
  nama_unit: string;
  nib: string;
  kategori: KategoriUnit;
  skema: string;
  target_sertifikasi: string;
  upt_pembina: string;
  alamat: string;
  provinsi: string;
  tgl_bimbingan: string;
  status: StatusUnit;
  readiness_score: number;
}

export interface PembinaanPagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PembinaanUnitEnvelope {
  success?: boolean;
  data?: UnitPembinaan[];
  pagination?: PembinaanPagination;
}

export interface PembinaanUnitResult {
  items: UnitPembinaan[];
  pagination: PembinaanPagination;
}

export interface PembinaanUnitParams {
  year?: string;
  sektor?: string;
  skema?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// --------------------------------------------------------------------------
// Endpoint
// --------------------------------------------------------------------------

// KPI ringkasan pembinaan per tahun (mendukung year=all)
export const getPembinaanKpi = async (year: string = '2026'): Promise<PembinaanKpi> => {
  const { data } = await pembinaanApi.get<PembinaanKpiEnvelope>('/kpi', {
    params: { year },
  });

  const payload = data?.data;
  return {
    total_unit: Number(payload?.total_unit) || 0,
    selesai_bina: Number(payload?.selesai_bina) || 0,
    primer: { total: Number(payload?.primer?.total) || 0, breakdown: payload?.primer?.breakdown ?? {} },
    pengolahan: { total: Number(payload?.pengolahan?.total) || 0, breakdown: payload?.pengolahan?.breakdown ?? {} },
    potensi_siap_sertifikasi: Number(payload?.potensi_siap_sertifikasi) || 0,
    selected_year: payload?.selected_year ?? year,
  };
};

// Daftar unit bimbingan dengan filter tahun/sektor/skema/pencarian + pagination
export const getPembinaanUnits = async ({
  year = '2026',
  sektor = 'all',
  skema,
  search,
  page = 1,
  limit = 10,
}: PembinaanUnitParams = {}): Promise<PembinaanUnitResult> => {
  const { data } = await pembinaanApi.get<PembinaanUnitEnvelope>('/unit', {
    params: {
      year,
      sektor,
      ...(skema ? { skema } : {}),
      ...(search ? { search } : {}),
      page,
      limit,
    },
  });

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    pagination: {
      total: Number(data?.pagination?.total) || 0,
      page: Number(data?.pagination?.page) || page,
      limit: Number(data?.pagination?.limit) || limit,
      total_pages: Number(data?.pagination?.total_pages) || 0,
    },
  };
};
