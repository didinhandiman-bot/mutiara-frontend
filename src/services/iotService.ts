import axios from 'axios';
import { io, type Socket } from 'socket.io-client';

// URL backend IoT Fish Monitoring (REST + Socket.IO).
// Set VITE_IOT_BACKEND_URL di .env, fallback ke server produksi.
export const IOT_BACKEND_URL =
  import.meta.env.VITE_IOT_BACKEND_URL || 'https://iot.bppmhkp.online';

// Satu pembacaan sensor (bentuk data yang dipush lewat Socket.IO "sensor-data")
export interface SensorReading {
  deviceId: string;
  temperature: number;
  ph: number;
  timestamp: string;
  updatedAt?: string;
}

// Baris histori dari endpoint REST (nilai decimal MySQL dikirim sebagai string)
export interface SensorHistoryRow {
  id: number;
  device_id: string;
  temperature: string | number;
  ph: string | number;
  created_at: string;
}

interface SensorListResponse {
  success: boolean;
  count: number;
  data: SensorReading[];
}

const iotApi = axios.create({
  baseURL: IOT_BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Ambil data terakhir semua device
export const getSensorsAll = async (): Promise<SensorReading[]> => {
  const { data } = await iotApi.get<SensorListResponse>('/api/v1/sensors/all');
  return data.success ? data.data : [];
};

// Ambil histori pembacaan satu device
export const getSensorHistory = async (
  deviceId: string,
  limit: number = 100
): Promise<SensorHistoryRow[]> => {
  const { data } = await iotApi.get<{ success: boolean; data: SensorHistoryRow[] }>(
    `/api/v1/sensors/history/${encodeURIComponent(deviceId)}?limit=${limit}`
  );
  return data.success ? data.data : [];
};

// Buat koneksi Socket.IO realtime ke backend IoT
export const createIotSocket = (): Socket =>
  io(IOT_BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    withCredentials: true,
  });
