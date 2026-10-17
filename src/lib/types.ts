/** ISO date without time, e.g. "2026-10-17". */
export type DateKey = string;

export type TxType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TxType;
  /** Ionicons glyph name. */
  icon: string;
  color: string;
  /** Optional monthly spending limit for expense categories. */
  monthlyBudget?: number;
  /** Money put aside rather than spent; reported as savings. */
  isSavings?: boolean;
}

export interface Transaction {
  id: string;
  type: TxType;
  /** Always positive; the type decides the sign. */
  amount: number;
  categoryId: string;
  date: DateKey;
  note?: string;
  createdAt: string;
}

export interface Settings {
  currency: string;
  /** Account balance before the first transaction in the app. */
  startingBalance: number;
  setupDone: boolean;
}

export interface AppState {
  settings: Settings;
  categories: Category[];
  transactions: Transaction[];
}
