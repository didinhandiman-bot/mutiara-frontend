import axios from 'axios';

// Ambil URL API dari file .env (Vite), atau gunakan default URL Production jika .env tidak diisi
const API_URL = import.meta.env.VITE_API_URL_AUTH || 'https://api.bppmhkp.online/auth';

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Otomatis tempel Token JWT jika ada di localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== User Management Endpoints =====

export interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
  status: 'Aktif' | 'Nonaktif';
  created_at: string;
}

export interface UserFormData {
  nama: string;
  email: string;
  password: string;
  role: 'admin' | 'operator' | 'viewer';
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UsersApiResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: PaginationMeta;
  };
}

// Ambil semua user dengan pagination
export const getUsersApi = async (page: number = 1, limit: number = 10): Promise<UsersApiResponse> => {
  const response = await API.get(`/users?page=${page}&limit=${limit}`);
  return response.data;
};

// Buat user baru
export const createUserApi = async (userData: UserFormData): Promise<{ success: boolean; data: User }> => {
  const response = await API.post('/users', userData);
  return response.data;
};

export default API;