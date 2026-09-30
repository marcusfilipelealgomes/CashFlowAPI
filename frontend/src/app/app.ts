import { Component, OnInit, computed, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { BudgetStore } from './services/budget.store';
import { SummaryCards } from './components/summary-cards/summary-cards';
import { BalanceDonutChart } from './components/balance-donut-chart/balance-donut-chart';
import { BalanceTimelineChart } from './components/balance-timeline-chart/balance-timeline-chart';
import { PaymentBreakdown } from './components/payment-breakdown/payment-breakdown';
import { ExpenseForm } from './components/expense-form/expense-form';
import { ExpenseList } from './components/expense-list/expense-list';
import { ToastContainer } from './components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [
    DatePipe,
    TitleCasePipe,
    SummaryCards,
    BalanceDonutChart,
    BalanceTimelineChart,
    PaymentBreakdown,
    ExpenseForm,
    ExpenseList,
    ToastContainer,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly store = inject(BudgetStore);

  protected readonly monthDate = computed(() => {
    const { year, month } = this.store.selectedMonth();
    return new Date(year, month - 1, 1);
  });

  ngOnInit() {
    this.store.load();
  }
}
