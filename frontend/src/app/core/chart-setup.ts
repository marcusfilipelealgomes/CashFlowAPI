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
import type { Theme } from '../services/theme.service';

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
};

export interface ChartPalette {
  text: string;
  grid: string;
  track: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipTitle: string;
  tooltipBody: string;
}

export const CHART_PALETTES: Record<Theme, ChartPalette> = {
  dark: {
    text: '#8e8e93',
    grid: 'rgba(255, 255, 255, 0.06)',
    track: 'rgba(255, 255, 255, 0.08)',
    tooltipBg: 'rgba(18, 18, 20, 0.97)',
    tooltipBorder: 'rgba(255, 255, 255, 0.1)',
    tooltipTitle: '#ffffff',
    tooltipBody: '#e4e4e7',
  },
  light: {
    text: '#71717a',
    grid: 'rgba(0, 0, 0, 0.06)',
    track: 'rgba(0, 0, 0, 0.07)',
    tooltipBg: 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: 'rgba(0, 0, 0, 0.1)',
    tooltipTitle: '#18181b',
    tooltipBody: '#3f3f46',
  },
};

export function applyTooltipPalette(chart: Chart<any>, palette: ChartPalette) {
  const tooltip = chart.options.plugins?.tooltip;
  if (!tooltip) return;
  tooltip.backgroundColor = palette.tooltipBg;
  tooltip.borderColor = palette.tooltipBorder;
  tooltip.titleColor = palette.tooltipTitle;
  tooltip.bodyColor = palette.tooltipBody;
}

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const brlCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export { Chart };
