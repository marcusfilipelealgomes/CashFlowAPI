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
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  CHART_COLORS,
  CHART_PALETTES,
  Chart,
  ChartPalette,
  applyTooltipPalette,
  brl,
} from '../../core/chart-setup';
import { ThemeService } from '../../services/theme.service';

interface Segment {
  label: string;
  value: number;
  color: string;
  /** Aparece só na legenda: o anel representa o total previsto, não o excedente. */
  legendOnly?: boolean;
}

@Component({
  selector: 'app-balance-donut-chart',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './balance-donut-chart.html',
  styleUrl: './balance-donut-chart.scss',
})
export class BalanceDonutChart implements AfterViewInit, OnDestroy {
  readonly salary = input.required<number>();
  readonly paid = input.required<number>();
  readonly pending = input(0);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly theme = inject(ThemeService);
  private readonly palette = computed(() => CHART_PALETTES[this.theme.theme()]);
  private chart?: Chart<'doughnut'>;

  readonly planned = computed(() => this.paid() + this.pending());
  readonly overBudget = computed(() => this.planned() > this.salary());
  readonly percent = computed(() => (this.salary() > 0 ? (this.planned() / this.salary()) * 100 : 0));

  readonly segments = computed<Segment[]>(() => {
    const salary = this.salary();
    const pending = this.pending();
    const segments: Segment[] = [{ label: 'Pago', value: this.paid(), color: CHART_COLORS.primary }];
    if (pending > 0) segments.push({ label: 'A vencer', value: pending, color: CHART_COLORS.warning });

    if (this.overBudget()) {
      segments.push({
        label: 'Acima do salário',
        value: this.planned() - salary,
        color: CHART_COLORS.danger,
        legendOnly: true,
      });
    } else {
      segments.push({ label: 'Disponível', value: salary - this.planned(), color: CHART_COLORS.success });
    }
    return segments;
  });

  constructor() {
    effect(() => {
      const segments = this.segments();
      const palette = this.palette();
      if (!this.chart) return;
      this.render(this.chart, segments, palette);
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
    this.render(this.chart, this.segments(), this.palette());
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  private render(chart: Chart<'doughnut'>, segments: Segment[], palette: ChartPalette) {
    const visible = segments.filter((s) => s.value > 0 && !s.legendOnly);
    const hasData = visible.length > 0;
    const multiple = visible.length > 1;
    chart.data.labels = hasData ? visible.map((s) => s.label) : [''];
    chart.data.datasets[0] = {
      data: hasData ? visible.map((s) => s.value) : [1],
      backgroundColor: hasData ? visible.map((s) => s.color) : [palette.track],
      borderWidth: 0,
      borderRadius: multiple ? 8 : 0,
      spacing: multiple ? 3 : 0,
      hoverOffset: hasData ? 6 : 0,
    };
    applyTooltipPalette(chart, palette);
    chart.update();
  }
}
