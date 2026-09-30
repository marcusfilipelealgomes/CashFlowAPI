import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  MonthRef,
  addMonths,
  currentMonth,
  daysInMonth,
  isSameMonth,
  monthFromIsoDate,
  monthKey,
} from '../core/month';
import { Expense, ExpenseDetail, ExpenseRequest, PAYMENT_TYPE_OPTIONS } from '../models/expense.model';
import { ExpenseApiService, extractApiError } from './expense-api.service';
import { ToastService } from './toast.service';

const SALARIES_STORAGE_KEY = 'cashflow.salaries';

export interface SalaryInfo {
  value: number;
  /** Mês (`yyyy-MM`) de onde o valor foi herdado, quando não definido para o mês atual. */
  inheritedFrom: string | null;
}

export interface DailySeries {
  labels: string[];
  spentPerDay: number[];
  balance: (number | null)[];
}

function loadSalaries(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SALARIES_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

@Injectable({ providedIn: 'root' })
export class BudgetStore {
  private readonly api = inject(ExpenseApiService);
  private readonly toast = inject(ToastService);

  private readonly salaries = signal<Record<string, number>>(loadSalaries());

  readonly expenses = signal<Expense[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly apiOffline = signal(false);
  readonly selectedMonth = signal<MonthRef>(currentMonth());
  readonly editing = signal<ExpenseDetail | null>(null);

  readonly selectedKey = computed(() => monthKey(this.selectedMonth()));
  readonly isCurrentMonth = computed(() => isSameMonth(this.selectedMonth(), currentMonth()));

  readonly salaryInfo = computed<SalaryInfo>(() => {
    const key = this.selectedKey();
    const all = this.salaries();
    if (all[key] !== undefined) return { value: all[key], inheritedFrom: null };

    const previous = Object.keys(all)
      .filter((k) => k < key)
      .sort()
      .pop();
    return previous ? { value: all[previous], inheritedFrom: previous } : { value: 0, inheritedFrom: null };
  });

  readonly salary = computed(() => this.salaryInfo().value);

  readonly monthExpenses = computed(() => {
    const key = this.selectedKey();
    return this.expenses()
      .filter((e) => e.date.startsWith(key))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  });

  readonly totalSpent = computed(() => this.monthExpenses().reduce((sum, e) => sum + e.amount, 0));
  readonly balance = computed(() => this.salary() - this.totalSpent());
  readonly usedPercent = computed(() =>
    this.salary() > 0 ? (this.totalSpent() / this.salary()) * 100 : 0,
  );

  readonly biggestExpense = computed(() =>
    this.monthExpenses().reduce<Expense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null),
  );

  readonly dailySeries = computed<DailySeries>(() => {
    const month = this.selectedMonth();
    const totalDays = daysInMonth(month);
    const lastDayWithData = this.isCurrentMonth() ? new Date().getDate() : totalDays;

    const spentPerDay = Array<number>(totalDays).fill(0);
    for (const e of this.monthExpenses()) {
      spentPerDay[Number(e.date.substring(8, 10)) - 1] += e.amount;
    }

    let running = this.salary();
    const balance = spentPerDay.map((spent, i) => {
      running -= spent;
      return i < lastDayWithData ? running : null;
    });

    const labels = spentPerDay.map((_, i) => String(i + 1).padStart(2, '0'));
    return { labels, spentPerDay, balance };
  });

  readonly byPaymentType = computed(() => {
    const total = this.totalSpent();
    return PAYMENT_TYPE_OPTIONS.map((option) => {
      const amount = this.monthExpenses()
        .filter((e) => e.paymentType === option.value)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...option, amount, percent: total > 0 ? (amount / total) * 100 : 0 };
    }).filter((item) => item.amount > 0);
  });

  constructor() {
    effect(() => localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(this.salaries())));
  }

  async load() {
    this.loading.set(true);
    try {
      this.expenses.set(await firstValueFrom(this.api.getAll()));
      this.apiOffline.set(false);
    } catch (err) {
      this.apiOffline.set(true);
      this.toast.error(extractApiError(err));
    } finally {
      this.loading.set(false);
    }
  }

  setSalary(value: number) {
    const key = this.selectedKey();
    this.salaries.update((all) => ({ ...all, [key]: value }));
    this.toast.success('Salário atualizado!');
  }

  previousMonth() {
    this.selectedMonth.update((m) => addMonths(m, -1));
  }

  nextMonth() {
    this.selectedMonth.update((m) => addMonths(m, 1));
  }

  goToCurrentMonth() {
    this.selectedMonth.set(currentMonth());
  }

  async startEdit(id: number) {
    try {
      this.editing.set(await firstValueFrom(this.api.getById(id)));
    } catch (err) {
      this.toast.error(extractApiError(err));
    }
  }

  cancelEdit() {
    this.editing.set(null);
  }

  /** Retorna `true` quando a despesa foi salva com sucesso. */
  async save(request: ExpenseRequest): Promise<boolean> {
    const editing = this.editing();
    this.saving.set(true);
    try {
      if (editing) {
        await firstValueFrom(this.api.update(editing.id, request));
        this.toast.success('Despesa atualizada!');
      } else {
        await firstValueFrom(this.api.create(request));
        this.toast.success('Despesa cadastrada!');
      }
      this.editing.set(null);
      this.selectedMonth.set(monthFromIsoDate(request.date));
      await this.load();
      return true;
    } catch (err) {
      this.toast.error(extractApiError(err));
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  async remove(expense: Expense) {
    try {
      await firstValueFrom(this.api.delete(expense.id));
      this.expenses.update((list) => list.filter((e) => e.id !== expense.id));
      if (this.editing()?.id === expense.id) this.editing.set(null);
      this.toast.success(`"${expense.title}" removida.`);
    } catch (err) {
      this.toast.error(extractApiError(err));
    }
  }
}
