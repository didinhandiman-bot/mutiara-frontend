import { useEffect, useState } from 'react';
import { LineChart } from '../components/iot/LineChart';
import {
  createIotSocket,
  getSensorsAll,
  IOT_BACKEND_URL,
  type SensorReading,
} from '../services/iotService';

const MAX_POINTS = 20;
const POLL_INTERVAL_MS = 5000;

interface ChartPoint {
  time: string;
  temperature: number;
  ph: number;
}

type SocketState = 'connecting' | 'connected' | 'disconnected';

const formatTime = (value: string | number | Date) =>
  new Date(value).toLocaleTimeString('id-ID');

const isSameReading = (a?: SensorReading, b?: SensorReading) =>
  !!a &&
  !!b &&
  a.timestamp === b.timestamp &&
  a.temperature === b.temperature &&
  a.ph === b.ph;

const getInsight = (reading?: SensorReading) => {
  if (!reading) {
    return {
      label: 'Menunggu Data Sensor',
      tone: 'neutral' as const,
      description:
        'Belum ada pembacaan yang masuk. Pastikan perangkat ESP32 aktif dan terhubung ke jaringan.',
    };
  }

  const tempIdeal = reading.temperature >= 25 && reading.temperature <= 30;
  const phIdeal = reading.ph >= 6.5 && reading.ph <= 8.5;

  if (tempIdeal && phIdeal) {
    return {
      label: 'Kualitas Air Optimal',
      tone: 'good' as const,
      description:
        'Suhu dan tingkat pH berada pada rentang ideal untuk budidaya. Tidak ada tindakan yang diperlukan saat ini.',
    };
  }

  if (!tempIdeal && !phIdeal) {
    return {
      label: 'Kualitas Air Perlu Perhatian',
      tone: 'bad' as const,
      description:
        'Suhu dan pH berada di luar rentang ideal. Segera periksa kondisi kolam dan sistem aerasi.',
    };
  }

  return {
    label: tempIdeal ? 'pH Air Perlu Dicek' : 'Suhu Air Perlu Dicek',
    tone: 'warn' as const,
    description: tempIdeal
      ? 'Suhu air normal, namun tingkat pH di luar rentang ideal 6,5 - 8,5. Lakukan penyesuaian pH.'
      : 'Tingkat pH normal, namun suhu air di luar rentang ideal 25 - 30°C. Periksa sumber panas atau pendinginan.',
  };
};

const toneStyles = {
  good: {
    hero: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  warn: {
    hero: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  bad: {
    hero: 'from-rose-500 to-red-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  neutral: {
    hero: 'from-slate-500 to-slate-700',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export const IotMonitoringPage = () => {
  const [socketState, setSocketState] = useState<SocketState>('connecting');
  const [restOnline, setRestOnline] = useState(false);
  const [readings, setReadings] = useState<Record<string, SensorReading>>({});
  const [history, setHistory] = useState<Record<string, ChartPoint[]>>({});
  const [preferredDevice, setPreferredDevice] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    const applyReading = (reading: SensorReading) => {
      if (!reading || !reading.deviceId) return;

      setReadings((prev) =>
        isSameReading(prev[reading.deviceId], reading)
          ? prev
          : { ...prev, [reading.deviceId]: reading }
      );

      setHistory((prev) => {
        const points = prev[reading.deviceId] ?? [];
        const time = formatTime(reading.timestamp);
        const last = points[points.length - 1];
        if (
          last &&
          last.time === time &&
          last.temperature === reading.temperature &&
          last.ph === reading.ph
        ) {
          return prev;
        }
        const next = [
          ...points,
          { time, temperature: reading.temperature, ph: reading.ph },
        ].slice(-MAX_POINTS);
        return { ...prev, [reading.deviceId]: next };
      });

      setLastSyncedAt(new Date());
    };

    const socket = createIotSocket();

    socket.on('connect', () => setSocketState('connected'));
    socket.on('disconnect', () => setSocketState('disconnected'));
    socket.on('connect_error', () => setSocketState('disconnected'));
    socket.on('sensor-data', (reading: SensorReading) => applyReading(reading));

    const syncFromRest = async () => {
      try {
        const data = await getSensorsAll();
        data.forEach(applyReading);
        setRestOnline(true);
      } catch {
        setRestOnline(false);
      }
    };

    syncFromRest();
    const timer = setInterval(syncFromRest, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      socket.off();
      socket.disconnect();
    };
  }, []);

  const devices = Object.keys(readings).sort();
  const selectedDevice =
    preferredDevice && readings[preferredDevice] ? preferredDevice : devices[0] ?? null;
  const active = selectedDevice ? readings[selectedDevice] : undefined;
  const points = selectedDevice ? history[selectedDevice] ?? [] : [];
  const labels = points.map((point) => point.time);
  const tempData = points.map((point) => point.temperature);
  const phData = points.map((point) => point.ph);

  const insight = getInsight(active);
  const tone = toneStyles[insight.tone];

  const status =
    socketState === 'connected'
      ? { label: 'Realtime Aktif', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' }
      : restOnline
        ? { label: 'Tersinkron via REST', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' }
        : socketState === 'connecting'
          ? { label: 'Menghubungkan...', className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' }
          : { label: 'Terputus', className: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">IoT Monitoring</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pemantauan kualitas air kolam secara realtime dari perangkat sensor terhubung.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="device-select" className="text-sm font-medium text-slate-500">
            Perangkat
          </label>
          <select
            id="device-select"
            value={selectedDevice ?? ''}
            onChange={(event) => setPreferredDevice(event.target.value || null)}
            disabled={devices.length === 0}
            className="min-w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-xs outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {devices.length === 0 ? (
              <option value="">Belum ada perangkat</option>
            ) : (
              devices.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <section className={`rounded-2xl bg-gradient-to-br ${tone.hero} p-6 text-white shadow-sm md:p-8`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80">
              <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
              Ringkasan Kualitas Air
            </div>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">{insight.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85">{insight.description}</p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:min-w-56">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/75">Status Jaringan</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {socketState === 'connected' ? 'Realtime' : 'REST'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/75">Perangkat Aktif</span>
              <span className="text-sm font-semibold">{devices.length}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/75">Pembaruan Terakhir</span>
              <span className="text-sm font-semibold">
                {lastSyncedAt ? formatTime(lastSyncedAt) : '--:--:--'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Suhu Air</p>
              <p className="mt-1 text-3xl font-bold text-rose-600">
                {active ? `${active.temperature.toFixed(1)}°C` : '--'}
              </p>
              <p className="mt-1 text-xs text-slate-400">Rentang ideal 25 - 30°C</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {active && active.temperature >= 25 && active.temperature <= 30 ? 'Normal' : 'Pantau'}
            </span>
          </div>
          <div className="relative mt-5 h-52">
            {points.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                Menunggu data suhu...
              </div>
            ) : (
              <LineChart labels={labels} data={tempData} color="#e11d48" min={20} max={35} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tingkat pH</p>
              <p className="mt-1 text-3xl font-bold text-sky-600">
                {active ? active.ph.toFixed(2) : '--'}
              </p>
              <p className="mt-1 text-xs text-slate-400">Rentang ideal 6,5 - 8,5</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
              {active && active.ph >= 6.5 && active.ph <= 8.5 ? 'Normal' : 'Pantau'}
            </span>
          </div>
          <div className="relative mt-5 h-52">
            {points.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
                Menunggu data pH...
              </div>
            ) : (
              <LineChart labels={labels} data={phData} color="#0284c7" min={0} max={14} />
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-800">Perangkat Sensor</h2>
            <p className="text-sm text-slate-500">
              Daftar perangkat beserta pembacaan terakhirnya.
            </p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500">
                <th className="px-6 py-3">Perangkat</th>
                <th className="px-6 py-3">Suhu</th>
                <th className="px-6 py-3">pH</th>
                <th className="px-6 py-3">Pembaruan</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Belum ada perangkat yang mengirim data.
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const reading = readings[device];
                  const isSelected = device === selectedDevice;
                  const tempOk = reading.temperature >= 25 && reading.temperature <= 30;
                  const phOk = reading.ph >= 6.5 && reading.ph <= 8.5;
                  return (
                    <tr
                      key={device}
                      onClick={() => setPreferredDevice(device)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="px-6 py-3 font-medium text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${toneStyles[toneFromBooleans(tempOk, phOk)].dot}`} />
                          {device}
                        </span>
                      </td>
                      <td className={`px-6 py-3 font-semibold ${tempOk ? 'text-slate-700' : 'text-rose-600'}`}>
                        {reading.temperature.toFixed(1)}°C
                      </td>
                      <td className={`px-6 py-3 font-semibold ${phOk ? 'text-slate-700' : 'text-rose-600'}`}>
                        {reading.ph.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-slate-500">{formatTime(reading.timestamp)}</td>
                      <td className="px-6 py-3">
                        <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Online
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-slate-400">
        Sumber data: <span className="font-medium text-slate-500">{IOT_BACKEND_URL}</span>
      </p>
    </div>
  );
};

const toneFromBooleans = (tempOk: boolean, phOk: boolean) => {
  if (tempOk && phOk) return 'good' as const;
  if (!tempOk && !phOk) return 'bad' as const;
  return 'warn' as const;
};
