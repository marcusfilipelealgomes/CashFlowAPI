import { Component, computed, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { startWith } from 'rxjs';
import { BudgetStore } from '../../services/budget.store';
import { ExpenseStatus, PAYMENT_TYPE_OPTIONS, PaymentType } from '../../models/expense.model';
import { daysInMonth, monthKey, parseIsoDate } from '../../core/month';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseForm {
  protected readonly store = inject(BudgetStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly paymentOptions = PAYMENT_TYPE_OPTIONS;
  protected readonly ExpenseStatus = ExpenseStatus;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [this.store.today(), Validators.required],
    status: [ExpenseStatus.Paid],
    paymentType: [PaymentType.EletronicTransfer],
    description: [''],
  });

  private readonly dateValue = toSignal(
    this.form.controls.date.valueChanges.pipe(startWith(this.form.controls.date.value)),
    { requireSync: true },
  );
  private readonly statusValue = toSignal(
    this.form.controls.status.valueChanges.pipe(startWith(this.form.controls.status.value)),
    { requireSync: true },
  );

  /** Só datas futuras podem ficar "A vencer"; hoje ou antes a despesa já é considerada paga. */
  protected readonly isFuture = computed(() => !!this.dateValue() && this.dateValue() > this.store.today());
  protected readonly scheduling = computed(() => this.isFuture() && this.statusValue() === ExpenseStatus.Pending);
  protected readonly dueDate = computed(() => (this.isFuture() ? parseIsoDate(this.dateValue()) : null));

  constructor() {
    // Ao escolher uma data futura sugere "A vencer", a menos que o usuário já tenha escolhido o status.
    this.form.controls.date.valueChanges.pipe(takeUntilDestroyed()).subscribe((date) => {
      const status = this.form.controls.status;
      if (!status.dirty) status.setValue(this.statusFor(date));
    });

    effect(() => {
      const editing = this.store.editing();
      untracked(() => {
        if (editing) {
          this.form.setValue({
            title: editing.title,
            amount: editing.amount,
            date: editing.date,
            status: editing.status,
            paymentType: editing.paymentType,
            description: editing.description,
          });
          this.form.controls.status.markAsDirty();
        } else {
          this.resetForm();
        }
      });
    });

    effect(() => {
      this.store.selectedMonth();
      untracked(() => {
        if (!this.store.editing() && !this.form.controls.date.dirty) {
          this.form.controls.date.setValue(this.defaultDate());
        }
      });
    });
  }

  protected isInvalid(control: 'title' | 'amount' | 'date'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const saved = await this.store.save({
      title: value.title.trim(),
      description: value.description.trim(),
      amount: Number(value.amount),
      date: value.date,
      paymentType: Number(value.paymentType),
      status: this.isFuture() ? Number(value.status) : ExpenseStatus.Paid,
    });
    if (saved) this.resetForm();
  }

  protected cancel() {
    this.store.cancelEdit();
  }

  private statusFor(date: string): ExpenseStatus {
    return date > this.store.today() ? ExpenseStatus.Pending : ExpenseStatus.Paid;
  }

  /** Sugere hoje no mês atual; em outros meses, o mesmo dia de hoje dentro do mês selecionado. */
  private defaultDate(): string {
    const today = this.store.today();
    const month = this.store.selectedMonth();
    const key = monthKey(month);
    if (today.startsWith(key)) return today;
    const day = Math.min(Number(today.substring(8, 10)), daysInMonth(month));
    return `${key}-${String(day).padStart(2, '0')}`;
  }

  private resetForm() {
    const date = this.defaultDate();
    this.form.reset({
      title: '',
      amount: null,
      date,
      status: this.statusFor(date),
      paymentType: PaymentType.EletronicTransfer,
      description: '',
    });
  }
}
