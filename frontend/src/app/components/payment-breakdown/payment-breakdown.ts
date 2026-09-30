import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { BudgetStore } from '../../services/budget.store';

@Component({
  selector: 'app-payment-breakdown',
  imports: [CurrencyPipe, DecimalPipe],
  template: `
    @if (store.byPaymentType().length) {
      <h3>Por forma de pagamento</h3>
      <ul>
        @for (item of store.byPaymentType(); track item.value) {
          <li>
            <div class="row">
              <span class="material-symbols-rounded">{{ item.icon }}</span>
              <span class="label">{{ item.label }}</span>
              <span class="amount">{{ item.amount | currency }}</span>
            </div>
            <div class="bar">
              <div class="bar__fill" [style.width.%]="item.percent"></div>
            </div>
            <span class="percent">{{ item.percent | number: '1.0-0' }}% dos gastos</span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host { display: block; }
    h3 {
      margin: 1.5rem 0 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; }
    .row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .row .material-symbols-rounded { font-size: 18px; color: var(--primary-light); }
    .label { flex: 1; }
    .amount { font-weight: 600; font-variant-numeric: tabular-nums; }
    .bar { height: 6px; margin: 0.45rem 0 0.3rem; border-radius: 999px; background: var(--surface-2); overflow: hidden; }
    .bar__fill {
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .percent { font-size: 0.75rem; color: var(--text-muted); }
  `,
})
export class PaymentBreakdown {
  protected readonly store = inject(BudgetStore);
}
