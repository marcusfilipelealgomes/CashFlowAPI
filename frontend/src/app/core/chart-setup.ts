import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#8b93b0';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 20, 40, 0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.titleFont = { weight: 600 };

export const CHART_COLORS = {
  primary: '#7c5cff',
  accent: '#22d3ee',
  success: '#34d399',
  danger: '#f87171',
  warning: '#fbbf24',
  track: 'rgba(255, 255, 255, 0.06)',
  grid: 'rgba(255, 255, 255, 0.05)',
};

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const brlCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export { Chart };
