import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api.config';
import { Expense, ExpenseDetail, ExpenseRequest, PaymentType } from '../models/expense.model';

interface ApiExpense {
  id: number;
  title: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
  description?: string;
}

const toExpense = (e: ApiExpense): Expense => ({
  id: e.id,
  title: e.title,
  amount: Number(e.amount),
  date: e.date.substring(0, 10),
  paymentType: e.paymentType,
});

@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/expenses`;

  getAll(): Observable<Expense[]> {
    // A API responde 204 (sem corpo) quando não há despesas.
    return this.http
      .get<{ expenses: ApiExpense[] } | null>(this.url)
      .pipe(map((res) => (res?.expenses ?? []).map(toExpense)));
  }

  getById(id: number): Observable<ExpenseDetail> {
    return this.http
      .get<ApiExpense>(`${this.url}/${id}`)
      .pipe(map((e) => ({ ...toExpense(e), description: e.description ?? '' })));
  }

  create(request: ExpenseRequest): Observable<unknown> {
    return this.http.post(this.url, this.toBody(request));
  }

  update(id: number, request: ExpenseRequest): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, this.toBody(request));
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }

  private toBody(request: ExpenseRequest) {
    return { ...request, date: `${request.date}T00:00:00` };
  }
}

export function extractApiError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está rodando.';
    }
    const messages: string[] | undefined = err.error?.errorMessages;
    if (messages?.length) return messages.join(' ');
  }
  return 'Ocorreu um erro inesperado.';
}
