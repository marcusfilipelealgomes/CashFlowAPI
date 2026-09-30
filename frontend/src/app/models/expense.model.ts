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

/** `date` sempre no formato `yyyy-MM-dd`, sem fuso horário. */
export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
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
}
