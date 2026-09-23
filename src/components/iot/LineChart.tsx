import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface LineChartProps {
  labels: string[];
  data: number[];
  color: string;
  min?: number;
  max?: number;
}

export const LineChart = ({ labels, data, color, min, max }: LineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#64748b', maxTicksLimit: 5, maxRotation: 0 },
            grid: { display: false },
            border: { color: 'rgba(100, 116, 139, 0.12)' },
          },
          y: {
            min,
            max,
            ticks: { color: '#64748b', maxTicksLimit: 5 },
            grid: { color: 'rgba(100, 116, 139, 0.12)' },
            border: { display: false },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, data, color, min, max]);

  return <canvas ref={canvasRef} />;
};
