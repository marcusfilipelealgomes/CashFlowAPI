import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BudgetStore, UpcomingExpense } from '../../services/budget.store';
import { ExpenseStatus } from '../../models/expense.model';
import { parseIsoDate } from '../../core/month';

const DUE_SOON_DAYS = 3;

@Component({
  selector: 'app-upcoming-expenses',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './upcoming-expenses.html',
  styleUrl: './upcoming-expenses.scss',
})
export class UpcomingExpenses {
  protected readonly store = inject(BudgetStore);
  protected readonly parseDate = parseIsoDate;

  protected isDueSoon(expense: UpcomingExpense): boolean {
    return expense.daysUntil <= DUE_SOON_DAYS;
  }

  protected countdown(expense: UpcomingExpense): string {
    return expense.daysUntil === 1 ? 'Vence amanhã' : `Vence em ${expense.daysUntil} dias`;
  }

  protected markAsPaid(expense: UpcomingExpense) {
    this.store.setStatus(expense, ExpenseStatus.Paid);
  }
}
