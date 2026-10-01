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
  parseIsoDate,
  toIsoDate,
  todayIso,
} from '../core/month';
import {
  Expense,
  ExpenseDetail,
  ExpenseRequest,
  ExpenseStatus,
  PAYMENT_TYPE_OPTIONS,
  isPending,
} from '../models/expense.model';
import { ExpenseApiService, extractApiError } from './expense-api.service';
import { ToastService } from './toast.service';

const SALARIES_STORAGE_KEY = 'cashflow.salaries';
const DUE_SOON_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface SalaryInfo {
  value: number;
  /** Mês (`yyyy-MM`) de onde o valor foi herdado, quando não definido para o mês atual. */
  inheritedFrom: string | null;
}

export interface DailySeries {
  labels: string[];
  paidPerDay: number[];
  pendingPerDay: number[];
  /** Saldo já realizado (até hoje). */
  balance: (number | null)[];
  /** Saldo previsto considerando as despesas a vencer (de hoje em diante). */
  projected: (number | null)[];
}

export interface UpcomingExpense extends Expense {
  daysUntil: number;
}

function loadSalaries(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SALARIES_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function sum(list: Expense[]): number {
  return list.reduce((total, e) => total + e.amount, 0);
}

@Injectable({ providedIn: 'root' })
export class BudgetStore {
  private readonly api = inject(ExpenseApiService);
  private readonly toast = inject(ToastService);

  private readonly salaries = signal<Record<string, number>>(loadSalaries());
  private dueSoonNotified = false;

  /** Atualizado a cada minuto para que as despesas virem "realizadas" no dia do vencimento sem recarregar. */
  readonly today = signal(todayIso());

  readonly expenses = signal<Expense[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly apiOffline = signal(false);
  readonly selectedMonth = signal<MonthRef>(currentMonth());
  readonly editing = signal<ExpenseDetail | null>(null);

  readonly selectedKey = computed(() => monthKey(this.selectedMonth()));
  readonly isCurrentMonth = computed(() => isSameMonth(this.selectedMonth(), monthFromIsoDate(this.today())));

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

  readonly pendingExpenses = computed(() => this.monthExpenses().filter((e) => isPending(e, this.today())));
  readonly paidExpenses = computed(() => this.monthExpenses().filter((e) => !isPending(e, this.today())));

  readonly totalPaid = computed(() => sum(this.paidExpenses()));
  readonly totalPending = computed(() => sum(this.pendingExpenses()));
  readonly totalPlanned = computed(() => this.totalPaid() + this.totalPending());

  /** Quanto sobra hoje, descontando só o que já foi pago. */
  readonly balance = computed(() => this.salary() - this.totalPaid());
  /** Quanto vai sobrar no fim do mês, depois de pagar também as contas a vencer. */
  readonly projectedBalance = computed(() => this.salary() - this.totalPlanned());

  readonly usedPercent = computed(() => (this.salary() > 0 ? (this.totalPlanned() / this.salary()) * 100 : 0));
  readonly paidPercent = computed(() => (this.salary() > 0 ? (this.totalPaid() / this.salary()) * 100 : 0));

  readonly biggestExpense = computed(() =>
    this.monthExpenses().reduce<Expense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null),
  );

  readonly upcoming = computed<UpcomingExpense[]>(() => {
    const today = parseIsoDate(this.today()).getTime();
    return this.pendingExpenses()
      .map((e) => ({ ...e, daysUntil: Math.round((parseIsoDate(e.date).getTime() - today) / DAY_MS) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  /** Contas a vencer nos próximos dias, em qualquer mês. */
  readonly dueSoon = computed(() => {
    const today = this.today();
    const limitIso = toIsoDate(new Date(parseIsoDate(today).getTime() + DUE_SOON_DAYS * DAY_MS));
    return this.expenses()
      .filter((e) => isPending(e, today) && e.date <= limitIso)
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly dailySeries = computed<DailySeries>(() => {
    const month = this.selectedMonth();
    const today = this.today();
    const totalDays = daysInMonth(month);
    const key = this.selectedKey();
    const currentKey = today.substring(0, 7);

    // Quantos dias do mês já aconteceram: todos (mês passado), até hoje (mês atual) ou nenhum (mês futuro).
    const elapsedDays = key < currentKey ? totalDays : key > currentKey ? 0 : Number(today.substring(8, 10));

    const paidPerDay = Array<number>(totalDays).fill(0);
    const pendingPerDay = Array<number>(totalDays).fill(0);
    for (const e of this.monthExpenses()) {
      const index = Number(e.date.substring(8, 10)) - 1;
      if (isPending(e, today)) pendingPerDay[index] += e.amount;
      else paidPerDay[index] += e.amount;
    }

    let running = this.salary();
    const balance: (number | null)[] = [];
    const projected: (number | null)[] = [];
    for (let i = 0; i < totalDays; i++) {
      running -= paidPerDay[i] + pendingPerDay[i];
      balance.push(i < elapsedDays ? running : null);
      projected.push(elapsedDays < totalDays && i >= elapsedDays - 1 ? running : null);
    }

    const labels = paidPerDay.map((_, i) => String(i + 1).padStart(2, '0'));
    return { labels, paidPerDay, pendingPerDay, balance, projected };
  });

  readonly byPaymentType = computed(() => {
    const total = this.totalPlanned();
    return PAYMENT_TYPE_OPTIONS.map((option) => {
      const amount = sum(this.monthExpenses().filter((e) => e.paymentType === option.value));
      return { ...option, amount, percent: total > 0 ? (amount / total) * 100 : 0 };
    }).filter((item) => item.amount > 0);
  });

  constructor() {
    effect(() => localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(this.salaries())));

    setInterval(() => {
      const today = todayIso();
      if (today !== this.today()) this.today.set(today);
    }, 60_000);
  }

  async load() {
    this.loading.set(true);
    try {
      this.expenses.set(await firstValueFrom(this.api.getAll()));
      this.apiOffline.set(false);
      this.notifyDueSoon();
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
    this.selectedMonth.set(monthFromIsoDate(this.today()));
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
        this.toast.success(
          request.status === ExpenseStatus.Pending ? 'Conta a vencer agendada!' : 'Despesa cadastrada!',
        );
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

  async setStatus(expense: Expense, status: ExpenseStatus) {
    try {
      await firstValueFrom(this.api.updateStatus(expense.id, status));
      this.expenses.update((list) => list.map((e) => (e.id === expense.id ? { ...e, status } : e)));
      this.toast.success(
        status === ExpenseStatus.Paid ? `"${expense.title}" marcada como paga.` : `"${expense.title}" voltou para a vencer.`,
      );
    } catch (err) {
      this.toast.error(extractApiError(err));
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

  private notifyDueSoon() {
    if (this.dueSoonNotified) return;
    this.dueSoonNotified = true;

    const due = this.dueSoon();
    if (due.length === 0) return;
    const names = due.map((e) => e.title).join(', ');
    this.toast.info(
      due.length === 1
        ? `Lembrete: "${names}" vence nos próximos ${DUE_SOON_DAYS} dias.`
        : `Lembrete: ${due.length} contas vencem nos próximos ${DUE_SOON_DAYS} dias (${names}).`,
      8000,
    );
  }
}
