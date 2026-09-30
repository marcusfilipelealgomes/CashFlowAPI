export interface MonthRef {
  year: number;
  /** 1 a 12 */
  month: number;
}

export function currentMonth(): MonthRef {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthKey({ year, month }: MonthRef): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function addMonths({ year, month }: MonthRef, delta: number): MonthRef {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function daysInMonth({ year, month }: MonthRef): number {
  return new Date(year, month, 0).getDate();
}

export function monthFromIsoDate(date: string): MonthRef {
  const [year, month] = date.split('-').map(Number);
  return { year, month };
}

export function isSameMonth(a: MonthRef, b: MonthRef): boolean {
  return a.year === b.year && a.month === b.month;
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Converte `yyyy-MM-dd` em Date local (evita o deslocamento de fuso do `new Date(string)`). */
export function parseIsoDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}
