import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { DEFAULT_CATEGORIES, SAVINGS_DEPOSIT_ID, SAVINGS_WITHDRAWAL_ID } from './categories';
import type { AppState, Category, Settings, Transaction } from './types';

const STORAGE_KEY = 'financepal:state:v1';

export const EMPTY_STATE: AppState = {
  settings: { currency: '€', startingBalance: 0, startingSavings: 0, setupDone: false },
  categories: DEFAULT_CATEGORIES,
  transactions: [],
};

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type Action =
  | { type: 'load'; state: AppState }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'saveTransaction'; tx: Transaction }
  | { type: 'removeTransaction'; id: string }
  | { type: 'saveCategory'; category: Category }
  | { type: 'removeCategory'; id: string; moveTo: string }
  | { type: 'reset' };

const byDateDesc = (a: Transaction, b: Transaction) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'load':
      return action.state;
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'saveTransaction': {
      const others = state.transactions.filter((t) => t.id !== action.tx.id);
      return { ...state, transactions: [...others, action.tx].sort(byDateDesc) };
    }
    case 'removeTransaction':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'saveCategory': {
      const exists = state.categories.some((c) => c.id === action.category.id);
      return {
        ...state,
        categories: exists
          ? state.categories.map((c) => (c.id === action.category.id ? action.category : c))
          : [...state.categories, action.category],
      };
    }
    case 'removeCategory':
      // Transactions keep their history under the replacement category.
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        transactions: state.transactions.map((t) => (t.categoryId === action.id ? { ...t, categoryId: action.moveTo } : t)),
      };
    case 'reset':
      return EMPTY_STATE;
  }
}

/** Fills in fields and categories added after the data was first saved. */
export function migrate(saved: Partial<AppState>): AppState {
  const categories = [...(saved.categories ?? EMPTY_STATE.categories)];
  // Savings transfers need both savings categories, even if an older version
  // of the app saved its category list without them.
  for (const id of [SAVINGS_DEPOSIT_ID, SAVINGS_WITHDRAWAL_ID]) {
    if (!categories.some((c) => c.id === id)) categories.push(DEFAULT_CATEGORIES.find((c) => c.id === id)!);
  }
  return {
    ...EMPTY_STATE,
    ...saved,
    categories,
    settings: { ...EMPTY_STATE.settings, ...saved.settings },
  };
}

function useActions(dispatch: React.Dispatch<Action>) {
  return useMemo(
    () => ({
      updateSettings: (patch: Partial<Settings>) => dispatch({ type: 'updateSettings', patch }),
      saveTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) =>
        dispatch({
          type: 'saveTransaction',
          tx: { ...tx, id: tx.id ?? newId(), createdAt: tx.createdAt ?? new Date().toISOString() },
        }),
      removeTransaction: (id: string) => dispatch({ type: 'removeTransaction', id }),
      saveCategory: (category: Category) => dispatch({ type: 'saveCategory', category }),
      removeCategory: (id: string, moveTo: string) => dispatch({ type: 'removeCategory', id, moveTo }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [dispatch],
  );
}

type Store = { state: AppState; ready: boolean } & ReturnType<typeof useActions>;

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const actions = useActions(dispatch);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Partial<AppState>;
        dispatch({ type: 'load', state: migrate(saved) });
      })
      .catch((e) => console.warn('Učitavanje podataka nije uspjelo', e))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
        console.warn('Spremanje podataka nije uspjelo', e),
      );
    }, 300);
  }, [state, ready]);

  const value = useMemo(() => ({ state, ready, ...actions }), [state, ready, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

export function useCategory(id: string): Category | undefined {
  return useStore().state.categories.find((c) => c.id === id);
}
