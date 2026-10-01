import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BudgetStore } from '../../services/budget.store';
import { Expense, ExpenseStatus, isPending, paymentTypeIcon, paymentTypeLabel } from '../../models/expense.model';
import { parseIsoDate } from '../../core/month';

type StatusFilter = 'all' | 'pending' | 'paid';

interface StatusInfo {
  kind: 'pending' | 'early' | 'paid';
  label: string;
  icon: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-expense-list',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.scss',
})
export class ExpenseList {
  protected readonly store = inject(BudgetStore);

  protected readonly search = signal('');
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly pendingDeleteId = signal<number | null>(null);

  protected readonly paymentTypeLabel = paymentTypeLabel;
  protected readonly paymentTypeIcon = paymentTypeIcon;
  protected readonly parseDate = parseIsoDate;
  protected readonly ExpenseStatus = ExpenseStatus;

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    // Os filtros só aparecem quando há contas a vencer; sem elas a lista volta a mostrar tudo.
    const filter = this.store.pendingExpenses().length > 0 ? this.statusFilter() : 'all';
    const today = this.store.today();
    return this.store.monthExpenses().filter((e) => {
      if (term && !e.title.toLowerCase().includes(term)) return false;
      if (filter === 'pending') return isPending(e, today);
      if (filter === 'paid') return !isPending(e, today);
      return true;
    });
  });

  protected statusOf(expense: Expense): StatusInfo {
    const today = this.store.today();
    if (isPending(expense, today)) {
      const days = Math.round((parseIsoDate(expense.date).getTime() - parseIsoDate(today).getTime()) / DAY_MS);
      return { kind: 'pending', label: days === 1 ? 'Vence amanhã' : `Vence em ${days} dias`, icon: 'schedule' };
    }
    if (expense.date > today) return { kind: 'early', label: 'Paga antecipada', icon: 'task_alt' };
    if (expense.status === ExpenseStatus.Pending) return { kind: 'paid', label: 'Realizada', icon: 'event_available' };
    return { kind: 'paid', label: 'Paga', icon: 'check_circle' };
  }

  /** Só despesas com vencimento futuro podem alternar entre "A vencer" e "Paga". */
  protected canToggleStatus(expense: Expense): boolean {
    return expense.date > this.store.today();
  }

  protected toggleStatus(expense: Expense) {
    const next = expense.status === ExpenseStatus.Pending ? ExpenseStatus.Paid : ExpenseStatus.Pending;
    this.store.setStatus(expense, next);
  }

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
