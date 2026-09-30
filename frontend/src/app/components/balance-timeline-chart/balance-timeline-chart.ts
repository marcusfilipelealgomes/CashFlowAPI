import { AfterViewInit, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import type { ChartConfiguration, ScriptableContext } from 'chart.js';
import { CHART_COLORS, Chart, brl, brlCompact } from '../../core/chart-setup';
import type { DailySeries } from '../../services/budget.store';

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
  private chart?: TimelineChart;

  constructor() {
    effect(() => {
      const series = this.series();
      if (!this.chart) return;
      this.applySeries(this.chart, series);
      this.chart.update();
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
              gradient.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
              gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
              return gradient;
            },
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: CHART_COLORS.accent,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            segment: {
              borderColor: (ctx) => ((ctx.p1.parsed.y ?? 0) < 0 ? CHART_COLORS.danger : undefined),
            },
          },
          {
            type: 'bar',
            label: 'Gasto do dia',
            data: [],
            yAxisID: 'y1',
            order: 2,
            backgroundColor: 'rgba(124, 92, 255, 0.55)',
            hoverBackgroundColor: CHART_COLORS.primary,
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
            grid: { display: false },
            border: { display: false },
            ticks: { maxRotation: 0, autoSkipPadding: 12 },
          },
          y: {
            grid: { color: CHART_COLORS.grid },
            border: { display: false },
            ticks: { callback: (value) => brlCompact.format(Number(value)), maxTicksLimit: 6 },
          },
          y1: { display: false, beginAtZero: true },
        },
        plugins: {
          tooltip: {
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
    this.applySeries(this.chart, this.series());
    this.chart.update();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private applySeries(chart: TimelineChart, series: DailySeries) {
    chart.data.labels = series.labels;
    chart.data.datasets[0].data = series.balance;
    chart.data.datasets[1].data = series.spentPerDay;

    // Mantém as barras na parte inferior do gráfico, sem competir com a linha de saldo.
    const maxDaily = Math.max(0, ...series.spentPerDay);
    const y1 = chart.options.scales?.['y1'];
    if (y1) y1.max = maxDaily > 0 ? maxDaily * 3 : 1;
  }
}
