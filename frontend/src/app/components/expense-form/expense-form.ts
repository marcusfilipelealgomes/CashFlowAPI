import { Component, effect, inject, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetStore } from '../../services/budget.store';
import { PAYMENT_TYPE_OPTIONS, PaymentType } from '../../models/expense.model';
import { daysInMonth, monthKey, todayIso } from '../../core/month';

@Component({
  selector: 'app-expense-form',
  imports: [ReactiveFormsModule],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.scss',
})
export class ExpenseForm {
  protected readonly store = inject(BudgetStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly paymentOptions = PAYMENT_TYPE_OPTIONS;
  protected readonly maxDate = todayIso();

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    date: [todayIso(), Validators.required],
    paymentType: [PaymentType.EletronicTransfer],
    description: [''],
  });

  constructor() {
    effect(() => {
      const editing = this.store.editing();
      untracked(() => {
        if (editing) {
          this.form.setValue({
            title: editing.title,
            amount: editing.amount,
            date: editing.date,
            paymentType: editing.paymentType,
            description: editing.description,
          });
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
    });
    if (saved) this.resetForm();
  }

  protected cancel() {
    this.store.cancelEdit();
  }

  /** Sugere uma data dentro do mês selecionado, respeitando o limite de hoje. */
  private defaultDate(): string {
    const today = todayIso();
    const month = this.store.selectedMonth();
    const key = monthKey(month);
    if (today.startsWith(key)) return today;
    const lastDay = `${key}-${String(daysInMonth(month)).padStart(2, '0')}`;
    return lastDay < today ? lastDay : today;
  }

  private resetForm() {
    this.form.reset({
      title: '',
      amount: null,
      date: this.defaultDate(),
      paymentType: PaymentType.EletronicTransfer,
      description: '',
    });
  }
}
