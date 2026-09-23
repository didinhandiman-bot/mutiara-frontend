import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface BarChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  max?: number;
}

export const BarChart = ({ labels, data, colors, max }: BarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = colors ?? ['#2563eb'];
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: labels.map(
              (_, index) => palette[index % palette.length]
            ),
            borderRadius: 6,
            maxBarThickness: 44,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', maxRotation: 0 },
            grid: { display: false },
            border: { color: 'rgba(100, 116, 139, 0.12)' },
          },
          y: {
            max,
            beginAtZero: true,
            ticks: { color: '#64748b', maxTicksLimit: 5 },
            grid: { color: 'rgba(100, 116, 139, 0.12)' },
            border: { display: false },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, data, colors, max]);

  return <canvas ref={canvasRef} />;
};
