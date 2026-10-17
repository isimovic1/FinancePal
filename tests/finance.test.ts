import assert from 'node:assert/strict';
import { test } from 'node:test';

import { balance, budgetStatus, formatMoney, monthReport, parseAmount } from '../src/lib/finance';
import { EMPTY_STATE, reducer } from '../src/lib/store';
import type { AppState, Transaction } from '../src/lib/types';

let n = 0;
const tx = (type: Transaction['type'], amount: number, categoryId: string, date: string): Transaction => ({
  id: String(++n), type, amount, categoryId, date, createdAt: `2026-01-01T00:00:0${n % 10}Z`,
});

const state: AppState = {
  ...EMPTY_STATE,
  settings: { currency: '€', startingBalance: 500, setupDone: true },
  categories: EMPTY_STATE.categories.map((c) => (c.id === 'food' ? { ...c, monthlyBudget: 300 } : c)),
  transactions: [
    tx('income', 1800, 'salary', '2026-09-10'),
    tx('expense', 400, 'housing', '2026-09-12'),
    tx('income', 2000, 'salary', '2026-10-10'),
    tx('expense', 150, 'housing', '2026-10-11'),
    tx('expense', 320.5, 'food', '2026-10-12'),
    tx('expense', 200, 'savings', '2026-10-12'),
    tx('expense', 50, 'fun', '2026-10-15'),
  ],
};

test('balance adds income and subtracts expenses from the starting balance', () => {
  assert.equal(balance(state), 500 + 1800 - 400 + 2000 - 150 - 320.5 - 200 - 50);
  assert.equal(balance(state, '2026-09-30'), 1900);
});

test('month report separates savings from spending', () => {
  const r = monthReport(state, '2026-10-17', '2026-10-17');
  assert.equal(r.income, 2000);
  assert.equal(r.expenses, 720.5);
  assert.equal(r.savings, 200);
  assert.equal(r.spending, 520.5);
  assert.equal(r.net, 1279.5);
  assert.equal(r.openingBalance, 1900);
  assert.equal(r.closingBalance, 1900 + 1279.5);
  assert.equal(r.expenseByCategory[0].category.id, 'food');
  assert.equal(r.dailySpending.length, 17); // stops at today
  assert.ok(Math.abs(r.savingsRate! - (2000 - 520.5) / 2000) < 1e-9);
});

test('budget status flags overspending', () => {
  const food = state.categories.find((c) => c.id === 'food')!;
  const b = budgetStatus(state, food, '2026-10-01');
  assert.equal(b.spent, 320.5);
  assert.equal(b.over, true);
});

test('formatMoney uses Croatian separators', () => {
  assert.equal(formatMoney(1234.5, '€'), '1.234,50 €');
  assert.equal(formatMoney(-20, 'KM'), '−20,00 KM');
  assert.equal(formatMoney(5, '€', { sign: true }), '+5,00 €');
});

test('parseAmount accepts local and international formats', () => {
  assert.equal(parseAmount('1.234,56'), 1234.56);
  assert.equal(parseAmount('1234.56'), 1234.56);
  assert.equal(parseAmount('12,5'), 12.5);
  assert.equal(parseAmount('1.500'), 1500);
  assert.equal(parseAmount('1,234.5'), 1234.5);
  assert.ok(Number.isNaN(parseAmount('abc')));
  assert.ok(Number.isNaN(parseAmount('')));
});

test('removing a category moves its transactions', () => {
  const s = reducer(state, { type: 'removeCategory', id: 'fun', moveTo: 'other-expense' });
  assert.ok(!s.categories.some((c) => c.id === 'fun'));
  assert.equal(s.transactions.filter((t) => t.categoryId === 'other-expense').length, 1);
});

test('saving a transaction keeps the list newest first and replaces edits', () => {
  let s = reducer(EMPTY_STATE, { type: 'saveTransaction', tx: tx('expense', 10, 'food', '2026-10-01') });
  s = reducer(s, { type: 'saveTransaction', tx: tx('expense', 20, 'food', '2026-10-05') });
  assert.equal(s.transactions[0].amount, 20);
  s = reducer(s, { type: 'saveTransaction', tx: { ...s.transactions[1], amount: 15 } });
  assert.equal(s.transactions.length, 2);
  assert.equal(s.transactions[1].amount, 15);
});
