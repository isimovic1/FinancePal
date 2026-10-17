import { addDays, dateRange, endOfMonth, startOfMonth } from './dates';
import type { AppState, Category, DateKey, Transaction } from './types';

export const CURRENCIES = [
  { value: '€', label: 'EUR €' },
  { value: 'KM', label: 'BAM KM' },
  { value: 'RSD', label: 'RSD' },
  { value: '$', label: 'USD $' },
];

export function signed(t: Transaction): number {
  return t.type === 'income' ? t.amount : -t.amount;
}

/** Balance after every transaction up to and including the date (all time when omitted). */
export function balance(state: AppState, upTo?: DateKey): number {
  let total = state.settings.startingBalance;
  for (const t of state.transactions) if (!upTo || t.date <= upTo) total += signed(t);
  return total;
}

export function inRange(txs: Transaction[], start: DateKey, end: DateKey): Transaction[] {
  return txs.filter((t) => t.date >= start && t.date <= end);
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  /** Share of all expenses (or income) in the period, 0–1. */
  share: number;
}

export function totalsByCategory(txs: Transaction[], categories: Category[], type: 'income' | 'expense'): CategoryTotal[] {
  const byId = new Map<string, { total: number; count: number }>();
  for (const t of txs) {
    if (t.type !== type) continue;
    const cur = byId.get(t.categoryId) ?? { total: 0, count: 0 };
    cur.total += t.amount;
    cur.count += 1;
    byId.set(t.categoryId, cur);
  }
  const sum = [...byId.values()].reduce((a, v) => a + v.total, 0);
  return [...byId.entries()]
    .map(([id, v]) => ({
      category: categories.find((c) => c.id === id) ?? UNKNOWN_CATEGORY(id, type),
      total: v.total,
      count: v.count,
      share: sum > 0 ? v.total / sum : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

const UNKNOWN_CATEGORY = (id: string, type: 'income' | 'expense'): Category => ({
  id,
  name: 'Obrisana kategorija',
  type,
  icon: 'help-circle-outline',
  color: '#9CA3AF',
});

export interface MonthReport {
  start: DateKey;
  end: DateKey;
  income: number;
  /** All expenses, savings included. */
  expenses: number;
  /** Money moved to savings categories. */
  savings: number;
  /** Expenses without savings. */
  spending: number;
  net: number;
  /** (income - spending) / income: share of income not spent. */
  savingsRate: number | null;
  openingBalance: number;
  closingBalance: number;
  expenseByCategory: CategoryTotal[];
  incomeByCategory: CategoryTotal[];
  dailySpending: { date: DateKey; amount: number }[];
  avgDailySpending: number;
  biggestExpenses: Transaction[];
  transactionCount: number;
}

export function monthReport(state: AppState, anyDayInMonth: DateKey, today: DateKey): MonthReport {
  const start = startOfMonth(anyDayInMonth);
  const end = endOfMonth(anyDayInMonth);
  const txs = inRange(state.transactions, start, end);
  const savingsIds = new Set(state.categories.filter((c) => c.isSavings).map((c) => c.id));

  let income = 0;
  let expenses = 0;
  let savings = 0;
  for (const t of txs) {
    if (t.type === 'income') income += t.amount;
    else {
      expenses += t.amount;
      if (savingsIds.has(t.categoryId)) savings += t.amount;
    }
  }
  const spending = expenses - savings;

  const lastDay = end < today ? end : today;
  const days = lastDay >= start ? dateRange(start, lastDay) : [];
  const dailySpending = days.map((date) => ({
    date,
    amount: txs
      .filter((t) => t.date === date && t.type === 'expense' && !savingsIds.has(t.categoryId))
      .reduce((a, t) => a + t.amount, 0),
  }));

  return {
    start,
    end,
    income,
    expenses,
    savings,
    spending,
    net: income - expenses,
    savingsRate: income > 0 ? (income - spending) / income : null,
    openingBalance: balance(state, addDays(start, -1)),
    closingBalance: balance(state, end),
    expenseByCategory: totalsByCategory(txs, state.categories, 'expense'),
    incomeByCategory: totalsByCategory(txs, state.categories, 'income'),
    dailySpending,
    avgDailySpending: days.length ? spending / days.length : 0,
    biggestExpenses: txs
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    transactionCount: txs.length,
  };
}

/** Spent this month in a category against its monthly budget. */
export function budgetStatus(state: AppState, category: Category, anyDayInMonth: DateKey) {
  const txs = inRange(state.transactions, startOfMonth(anyDayInMonth), endOfMonth(anyDayInMonth));
  const spent = txs
    .filter((t) => t.type === 'expense' && t.categoryId === category.id)
    .reduce((a, t) => a + t.amount, 0);
  const budget = category.monthlyBudget ?? 0;
  return { spent, budget, remaining: budget - spent, over: budget > 0 && spent > budget };
}

export function formatMoney(amount: number, currency: string, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const [int, dec] = abs.toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = amount < 0 ? '−' : opts.sign && amount > 0 ? '+' : '';
  return `${sign}${grouped},${dec} ${currency}`;
}

/** Parses "1.234,56", "1234.56" or "1234,5" into a number. */
export function parseAmount(text: string): number {
  const t = text.trim().replace(/\s/g, '');
  if (!t) return NaN;
  const lastComma = t.lastIndexOf(',');
  const lastDot = t.lastIndexOf('.');
  let normalized: string;
  if (lastComma > lastDot) normalized = t.replace(/\./g, '').replace(',', '.');
  else if (lastDot > lastComma && lastComma >= 0) normalized = t.replace(/,/g, '');
  else if (lastDot >= 0 && /^\d{1,3}(\.\d{3})+$/.test(t)) normalized = t.replace(/\./g, '');
  else normalized = t;
  return /^-?\d*\.?\d+$/.test(normalized) ? parseFloat(normalized) : NaN;
}
