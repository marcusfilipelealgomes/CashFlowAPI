import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BudgetStore } from '../../services/budget.store';
import { Expense, paymentTypeIcon, paymentTypeLabel } from '../../models/expense.model';
import { parseIsoDate } from '../../core/month';

@Component({
  selector: 'app-expense-list',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss',
})
export class ExpenseList {
  protected readonly store = inject(BudgetStore);

  protected readonly search = signal('');
  protected readonly pendingDeleteId = signal<number | null>(null);

  protected readonly paymentTypeLabel = paymentTypeLabel;
  protected readonly paymentTypeIcon = paymentTypeIcon;
  protected readonly parseDate = parseIsoDate;

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.store.monthExpenses();
    return term ? list.filter((e) => e.title.toLowerCase().includes(term)) : list;
  });

  protected shareOfSalary(expense: Expense): number {
    const salary = this.store.salary();
    return salary > 0 ? Math.min((expense.amount / salary) * 100, 100) : 0;
  }

  protected askDelete(expense: Expense) {
    this.pendingDeleteId.set(expense.id);
  }

  protected async confirmDelete(expense: Expense) {
    this.pendingDeleteId.set(null);
    await this.store.remove(expense);
  }

  protected edit(expense: Expense) {
    this.pendingDeleteId.set(null);
    this.store.startEdit(expense.id);
    if (window.matchMedia('(max-width: 1100px)').matches) {
      document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
