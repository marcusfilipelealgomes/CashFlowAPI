import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { CHART_COLORS, Chart, brl } from '../../core/chart-setup';

interface Segment {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-balance-donut-chart',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './balance-donut-chart.html',
  styleUrl: './balance-donut-chart.scss',
})
export class BalanceDonutChart implements AfterViewInit, OnDestroy {
  readonly salary = input.required<number>();
  readonly spent = input.required<number>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart<'doughnut'>;

  readonly overBudget = computed(() => this.spent() > this.salary());
  readonly percent = computed(() => (this.salary() > 0 ? (this.spent() / this.salary()) * 100 : 0));
  readonly remaining = computed(() => this.salary() - this.spent());

  readonly segments = computed<Segment[]>(() => {
    const salary = this.salary();
    const spent = this.spent();
    if (this.overBudget()) {
      return [
        { label: 'Salário comprometido', value: salary, color: CHART_COLORS.primary },
        { label: 'Acima do salário', value: spent - salary, color: CHART_COLORS.danger },
      ];
    }
    return [
      { label: 'Gasto', value: spent, color: CHART_COLORS.primary },
      { label: 'Disponível', value: salary - spent, color: CHART_COLORS.success },
    ];
  });

  constructor() {
    effect(() => {
      const segments = this.segments();
      if (!this.chart) return;
      this.applySegments(this.chart, segments);
      this.chart.update();
    });
  }

  ngAfterViewInit() {
    this.chart = new Chart(this.canvas().nativeElement, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [] }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '78%',
        animation: { animateRotate: true, duration: 900 },
        plugins: {
          tooltip: {
            filter: (item) => item.label !== '',
            callbacks: { label: (item) => ` ${item.label}: ${brl.format(item.parsed)}` },
          },
        },
      },
    });
    this.applySegments(this.chart, this.segments());
    this.chart.update();
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private applySegments(chart: Chart<'doughnut'>, segments: Segment[]) {
    const visible = segments.filter((s) => s.value > 0);
    const hasData = visible.length > 0;
    const multiple = visible.length > 1;
    chart.data.labels = hasData ? visible.map((s) => s.label) : [''];
    chart.data.datasets[0] = {
      data: hasData ? visible.map((s) => s.value) : [1],
      backgroundColor: hasData ? visible.map((s) => s.color) : [CHART_COLORS.track],
      borderWidth: 0,
      borderRadius: multiple ? 8 : 0,
      spacing: multiple ? 3 : 0,
      hoverOffset: hasData ? 6 : 0,
    };
  }
}
