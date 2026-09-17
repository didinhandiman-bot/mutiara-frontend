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

export default API;