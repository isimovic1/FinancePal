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
  /**
   * Savings transfer rather than real spending or income: an expense in such a
   * category moves money to savings, an income moves it back to the account.
   */
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
  /** Savings held before the first transfer in the app. */
  startingSavings: number;
  savingsGoal?: number;
  setupDone: boolean;
}

export interface AppState {
  settings: Settings;
  categories: Category[];
  transactions: Transaction[];
}
