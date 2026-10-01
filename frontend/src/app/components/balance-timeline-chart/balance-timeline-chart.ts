import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import type { ChartConfiguration, ScriptableContext } from 'chart.js';
import {
  CHART_COLORS,
  CHART_PALETTES,
  Chart,
  ChartPalette,
  applyTooltipPalette,
  brl,
  brlCompact,
} from '../../core/chart-setup';
import type { DailySeries } from '../../services/budget.store';
import { ThemeService } from '../../services/theme.service';

type TimelineChart = Chart<'bar' | 'line', (number | null)[], string>;

@Component({
  selector: 'app-balance-timeline-chart',
  template: `<div class="chart-wrap"><canvas #canvas aria-label="Evolução do saldo no mês" role="img"></canvas></div>`,
  styles: `
    :host { display: block; position: relative; min-height: 300px; }
    .chart-wrap { position: absolute; inset: 0; }
    @media (max-width: 640px) { :host { min-height: 240px; } }
  `,
})
export class BalanceTimelineChart implements AfterViewInit, OnDestroy {
  readonly series = input.required<DailySeries>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly theme = inject(ThemeService);
  private readonly palette = computed(() => CHART_PALETTES[this.theme.theme()]);
  private chart?: TimelineChart;

  private readonly lastRealizedIndex = computed(() => {
    const balance = this.series().balance;
    for (let i = balance.length - 1; i >= 0; i--) if (balance[i] !== null) return i;
    return -1;
  });
  private readonly hasProjection = computed(() => this.series().projected.some((v) => v !== null));

  constructor() {
    effect(() => {
      const series = this.series();
      const palette = this.palette();
      if (!this.chart) return;
      this.render(this.chart, series, palette);
    });
  }

  ngAfterViewInit() {
    const config: ChartConfiguration<'bar' | 'line', (number | null)[], string> = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            type: 'line',
            label: 'Saldo',
            data: [],
            yAxisID: 'y',
            order: 1,
            borderColor: CHART_COLORS.accent,
            borderWidth: 3,
            cubicInterpolationMode: 'monotone',
            fill: true,
            backgroundColor: (ctx: ScriptableContext<'line'>) => {
              const { ctx: c, chartArea } = ctx.chart;
              if (!chartArea) return 'transparent';
              const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(34, 211, 238, 0.3)');
              gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
              return gradient;
            },
            // Marca o ponto de hoje, onde o saldo realizado encontra a linha prevista.
            pointRadius: (ctx: ScriptableContext<'line'>) =>
              ctx.dataIndex === this.lastRealizedIndex() && this.hasProjection() ? 5 : 0,
            pointBackgroundColor: CHART_COLORS.accent,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: CHART_COLORS.accent,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            segment: {
              borderColor: (ctx) => ((ctx.p1.parsed.y ?? 0) < 0 ? CHART_COLORS.danger : undefined),
            },
          },
          {
            type: 'line',
            label: 'Previsto',
            data: [],
            yAxisID: 'y',
            order: 1,
            borderColor: 'rgba(34, 211, 238, 0.75)',
            borderWidth: 2,
            borderDash: [6, 6],
            cubicInterpolationMode: 'monotone',
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: CHART_COLORS.accent,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            segment: {
              borderColor: (ctx) => ((ctx.p1.parsed.y ?? 0) < 0 ? 'rgba(248, 113, 113, 0.85)' : undefined),
            },
          },
          {
            type: 'bar',
            label: 'Pago',
            data: [],
            yAxisID: 'y1',
            stack: 'day',
            order: 2,
            backgroundColor: 'rgba(124, 92, 255, 0.55)',
            hoverBackgroundColor: CHART_COLORS.primary,
            borderRadius: 6,
            maxBarThickness: 14,
          },
          {
            type: 'bar',
            label: 'A vencer',
            data: [],
            yAxisID: 'y1',
            stack: 'day',
            order: 2,
            backgroundColor: 'rgba(251, 191, 36, 0.55)',
            hoverBackgroundColor: CHART_COLORS.warning,
            borderRadius: 6,
            maxBarThickness: 14,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { display: false },
            ticks: { maxRotation: 0, autoSkipPadding: 12 },
          },
          y: {
            border: { display: false },
            ticks: { callback: (value) => brlCompact.format(Number(value)), maxTicksLimit: 6 },
          },
          y1: { display: false, beginAtZero: true, stacked: true },
        },
        plugins: {
          tooltip: {
            filter: (item) => {
              if (item.parsed.y === null) return false;
              if (item.dataset.type === 'bar') return item.parsed.y !== 0;
              // No dia de hoje as duas linhas se encontram; mostra só o saldo realizado.
              return !(item.datasetIndex === 1 && this.series().balance[item.dataIndex] !== null);
            },
            callbacks: {
              title: (items) => `Dia ${items[0]?.label}`,
              label: (item) =>
                item.parsed.y === null ? '' : ` ${item.dataset.label}: ${brl.format(item.parsed.y)}`,
            },
          },
        },
      },
    };

    this.chart = new Chart(this.canvas().nativeElement, config) as TimelineChart;
    this.render(this.chart, this.series(), this.palette());
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private render(chart: TimelineChart, series: DailySeries, palette: ChartPalette) {
    chart.data.labels = series.labels;
    chart.data.datasets[0].data = series.balance;
    chart.data.datasets[1].data = series.projected;
    chart.data.datasets[2].data = series.paidPerDay;
    chart.data.datasets[3].data = series.pendingPerDay;

    const { x, y, y1 } = chart.options.scales ?? {};
    // Mantém as barras na parte inferior do gráfico, sem competir com a linha de saldo.
    const maxDaily = Math.max(0, ...series.paidPerDay.map((paid, i) => paid + series.pendingPerDay[i]));
    if (y1) y1.max = maxDaily > 0 ? maxDaily * 3 : 1;

    if (x?.ticks) x.ticks.color = palette.text;
    if (y?.ticks) y.ticks.color = palette.text;
    if (y?.grid) y.grid.color = palette.grid;
    applyTooltipPalette(chart, palette);

    chart.update();
  }
}
