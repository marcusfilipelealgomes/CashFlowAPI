import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetStore } from '../../services/budget.store';
import { parseIsoDate } from '../../core/month';

@Component({
  selector: 'app-summary-cards',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './summary-cards.html',
  styleUrl: './summary-cards.scss',
})
export class SummaryCards {
  protected readonly store = inject(BudgetStore);

  protected readonly editingSalary = signal(false);
  protected salaryDraft: number | null = null;

  protected readonly inheritedFromDate = computed(() => {
    const from = this.store.salaryInfo().inheritedFrom;
    return from ? parseIsoDate(`${from}-01`) : null;
  });

  protected readonly progressLevel = computed(() => {
    const p = this.store.usedPercent();
    if (p >= 100) return 'danger';
    if (p >= 75) return 'warning';
    return 'ok';
  });

  protected startSalaryEdit() {
    this.salaryDraft = this.store.salary() || null;
    this.editingSalary.set(true);
  }

  protected saveSalary() {
    const value = Number(this.salaryDraft);
    if (!Number.isFinite(value) || value < 0) return;
    this.store.setSalary(Math.round(value * 100) / 100);
    this.editingSalary.set(false);
  }

  protected cancelSalaryEdit() {
    this.editingSalary.set(false);
  }
}
