export enum PaymentType {
  Cash = 0,
  CreditCard = 1,
  DebitCard = 2,
  EletronicTransfer = 3,
}

export const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string; icon: string }[] = [
  { value: PaymentType.EletronicTransfer, label: 'Pix / Transferência', icon: 'bolt' },
  { value: PaymentType.DebitCard, label: 'Cartão de débito', icon: 'credit_card' },
  { value: PaymentType.CreditCard, label: 'Cartão de crédito', icon: 'credit_score' },
  { value: PaymentType.Cash, label: 'Dinheiro', icon: 'payments' },
];

export function paymentTypeLabel(type: PaymentType): string {
  return PAYMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? '—';
}

export function paymentTypeIcon(type: PaymentType): string {
  return PAYMENT_TYPE_OPTIONS.find((o) => o.value === type)?.icon ?? 'receipt_long';
}

export enum ExpenseStatus {
  Paid = 0,
  Pending = 1,
}

/** `date` sempre no formato `yyyy-MM-dd`, sem fuso horário. */
export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
  status: ExpenseStatus;
}

/**
 * Uma despesa só fica "A vencer" enquanto a data de vencimento não chegou;
 * a partir do dia do vencimento ela passa a contar como realizada.
 */
export function isPending(expense: Expense, today: string): boolean {
  return expense.status === ExpenseStatus.Pending && expense.date > today;
}

export interface ExpenseDetail extends Expense {
  description: string;
}

export interface ExpenseRequest {
  title: string;
  description: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
  status: ExpenseStatus;
}
