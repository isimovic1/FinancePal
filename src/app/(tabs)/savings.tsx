import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { BarChart } from '../../components/charts';
import { TransactionRow } from '../../components/TransactionRow';
import { Button, Card, Field, ProgressBar, Row, Screen, styles } from '../../components/ui';
import { SAVINGS_DEPOSIT_ID, SAVINGS_WITHDRAWAL_ID } from '../../lib/categories';
import { fromDateKey, monthName, todayKey } from '../../lib/dates';
import {
  balance, formatMoney, isSavingsTransaction, monthReport, parseAmount, savingsBalance, savingsByMonth,
} from '../../lib/finance';
import { useStore } from '../../lib/store';
import { colors, spacing } from '../../theme';

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];

export default function Savings() {
  const { state, saveTransaction, updateSettings } = useStore();
  const today = todayKey();
  const cur = state.settings.currency;
  const money = (n: number, sign = false) => formatMoney(n, cur, { sign });
  const onAccount = balance(state);
  const saved = savingsBalance(state);
  const goal = state.settings.savingsGoal;
  const month = monthReport(state, today, today);
  const history = state.transactions.filter((t) => isSavingsTransaction(state, t));
  const byMonth = savingsByMonth(state, today, 6);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [goalText, setGoalText] = useState(goal ? String(goal).replace('.', ',') : '');

  const value = parseAmount(amount);
  const valid = Number.isFinite(value) && value > 0;

  const transfer = (direction: 'deposit' | 'withdraw') => {
    if (!valid) return Alert.alert('Iznos', 'Upiši iznos veći od nule.');
    const rounded = Math.round(value * 100) / 100;
    const save = () => {
      saveTransaction({
        type: direction === 'deposit' ? 'expense' : 'income',
        amount: rounded,
        categoryId: direction === 'deposit' ? SAVINGS_DEPOSIT_ID : SAVINGS_WITHDRAWAL_ID,
        date: today,
        note: note.trim() || undefined,
      });
      setAmount('');
      setNote('');
    };
    if (direction === 'withdraw' && rounded > saved + 0.001) {
      return Alert.alert('Nema dovoljno na štednji', `Na štednji je ${money(saved)}.`);
    }
    if (direction === 'deposit' && rounded > onAccount + 0.001) {
      return Alert.alert('Više od stanja računa', `Na računu je ${money(onAccount)}. Svejedno prebaciti?`, [
        { text: 'Odustani', style: 'cancel' },
        { text: 'Prebaci', onPress: save },
      ]);
    }
    save();
  };

  const saveGoal = () => {
    if (!goalText.trim()) return updateSettings({ savingsGoal: undefined });
    const g = parseAmount(goalText);
    if (!(g > 0)) return Alert.alert('Cilj', 'Upiši ispravan iznos ili ostavi prazno.');
    updateSettings({ savingsGoal: g });
  };

  return (
    <Screen>
      <View style={{ backgroundColor: colors.savings, borderRadius: 20, padding: spacing.xl, gap: spacing.xs }}>
        <Text style={{ color: '#ffffffcc', fontWeight: '600' }}>Na štednji</Text>
        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{money(saved)}</Text>
        <Text style={{ color: '#ffffffcc' }}>Na računu: {money(onAccount)}</Text>
        {goal ? (
          <View style={{ gap: 4, marginTop: spacing.sm }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: '#ffffff40', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${Math.min(100, Math.max(0, (saved / goal) * 100))}%`, backgroundColor: '#fff' }} />
            </View>
            <Text style={{ color: '#ffffffcc', fontSize: 12 }}>
              {saved >= goal
                ? `Cilj od ${money(goal)} je postignut! 🎉`
                : `${Math.round((saved / goal) * 100)} % cilja od ${money(goal)} · još ${money(goal - saved)}`}
            </Text>
          </View>
        ) : null}
      </View>

      <Card title="Prebaci">
        <Row>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={colors.border}
            keyboardType="decimal-pad"
            style={{ flex: 1, fontSize: 30, fontWeight: '800', color: colors.text, paddingVertical: 4 }}
          />
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.muted }}>{cur}</Text>
        </Row>
        <Row style={{ flexWrap: 'wrap', gap: spacing.sm }}>
          {QUICK_AMOUNTS.map((q) => (
            <Pressable
              key={q}
              onPress={() => setAmount(String(q))}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.bg }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>{q} {cur}</Text>
            </Pressable>
          ))}
        </Row>
        <Field label="Opis (nije obavezno)" value={note} onChangeText={setNote} placeholder="npr. Za ljeto" />
        <Row>
          <Button title="↓ Na štednju" onPress={() => transfer('deposit')} disabled={!valid} style={{ flex: 1, backgroundColor: colors.savings }} />
          <Button title="↑ Na račun" variant="secondary" onPress={() => transfer('withdraw')} disabled={!valid} style={{ flex: 1 }} />
        </Row>
        <Text style={[styles.muted, { fontSize: 12 }]}>
          Prebacivanje na štednju skida iznos sa stanja računa; povlačenje ga vraća na račun. Ne računa se kao trošak ni prihod.
        </Text>
      </Card>

      <Card title={`Ovaj mjesec (${monthName(today)})`}>
        <Row>
          <Amount label="Uplaćeno" value={money(month.savings)} color={colors.savings} />
          <Amount label="Povučeno" value={money(month.savingsWithdrawn)} color={colors.expense} />
          <Amount label="Neto" value={money(month.savings - month.savingsWithdrawn, true)} />
        </Row>
        {month.income > 0 && (
          <Text style={styles.muted}>
            Na štednju ide {Math.round(((month.savings - month.savingsWithdrawn) / month.income) * 100)} % prihoda ovog mjeseca.
          </Text>
        )}
      </Card>

      {history.length > 0 && (
        <Card title="Stanje štednje (zadnjih 6 mjeseci)">
          <BarChart
            color={colors.savings}
            data={byMonth.map((m) => ({ label: monthName(m.month).slice(0, 3), value: Math.max(0, Math.round(m.balance)) }))}
          />
          <Text style={[styles.muted, { fontSize: 12 }]}>
            Stanje na kraju mjeseca; za {monthName(today)} {fromDateKey(today).getFullYear()}. trenutno stanje.
          </Text>
        </Card>
      )}

      <Card title="Cilj štednje">
        <Row style={{ alignItems: 'flex-end' }}>
          <Field label="Koliko želiš uštedjeti" suffix={cur} value={goalText} onChangeText={setGoalText} keyboardType="decimal-pad" placeholder="npr. 5000" />
          <Button title="Spremi" variant="secondary" onPress={saveGoal} style={{ paddingVertical: 10 }} />
        </Row>
        {goal && saved < goal && month.savings - month.savingsWithdrawn > 0 ? (
          <Text style={styles.muted}>
            Ovim tempom ({money(month.savings - month.savingsWithdrawn)} ovaj mjesec) do cilja treba još oko{' '}
            {Math.ceil((goal - saved) / (month.savings - month.savingsWithdrawn))} mj.
          </Text>
        ) : null}
      </Card>

      <Card title="Povijest">
        {history.length === 0 ? (
          <Text style={styles.muted}>Još nema prebacivanja. Upiši iznos gore i pritisni "Na štednju".</Text>
        ) : (
          history.slice(0, 30).map((t) => <TransactionRow key={t.id} tx={t} showDate />)
        )}
      </Card>
    </Screen>
  );
}

function Amount({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[styles.muted, { fontSize: 12 }]}>{label}</Text>
      <Text style={{ fontSize: 16, fontWeight: '700', color }}>{value}</Text>
    </View>
  );
}
