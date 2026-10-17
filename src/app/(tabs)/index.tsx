import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CategoryIcon, TransactionRow } from '../../components/TransactionRow';
import { Card, ProgressBar, Row, Screen, styles } from '../../components/ui';
import { monthName, todayKey } from '../../lib/dates';
import { balance, budgetStatus, formatMoney, monthReport } from '../../lib/finance';
import { useStore } from '../../lib/store';
import { colors, spacing } from '../../theme';

export default function Overview() {
  const { state } = useStore();
  const today = todayKey();
  const cur = state.settings.currency;
  const money = (n: number, sign = false) => formatMoney(n, cur, { sign });
  const total = balance(state);
  const month = monthReport(state, today, today);
  const budgeted = state.categories.filter((c) => c.type === 'expense' && c.monthlyBudget);

  return (
    <Screen>
      <View style={{ backgroundColor: colors.primary, borderRadius: 20, padding: spacing.xl, gap: spacing.xs }}>
        <Text style={{ color: '#ffffffcc', fontWeight: '600' }}>Trenutno stanje</Text>
        <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>{money(total)}</Text>
        <Text style={{ color: '#ffffffcc' }}>
          {monthName(today)}: {money(month.net, true)}
        </Text>
      </View>

      <Row>
        <QuickButton label="Prihod" icon="add" color={colors.income} onPress={() => router.push({ pathname: '/transaction', params: { type: 'income' } })} />
        <QuickButton label="Trošak" icon="remove" color={colors.expense} onPress={() => router.push({ pathname: '/transaction', params: { type: 'expense' } })} />
      </Row>

      <Card title={`Ovaj mjesec (${monthName(today)})`}>
        <Row>
          <Amount label="Prihodi" value={money(month.income)} color={colors.income} />
          <Amount label="Potrošeno" value={money(month.spending)} color={colors.expense} />
        </Row>
        <Row>
          <Amount label="Ušteđeno" value={money(month.savings)} color={colors.savings} />
          <Amount label="Prosječno dnevno" value={money(month.avgDailySpending)} />
        </Row>
        {month.income > 0 && (
          <View style={{ gap: 4, marginTop: spacing.xs }}>
            <Text style={[styles.muted, { fontSize: 12 }]}>
              Potrošeno {Math.round((month.spending / month.income) * 100)} % prihoda
            </Text>
            <ProgressBar value={month.spending} max={month.income} color={colors.primary} />
          </View>
        )}
      </Card>

      {month.expenseByCategory.length > 0 && (
        <Card title="Gdje odlazi novac" right={<Pressable onPress={() => router.push('/report')}><Text style={{ color: colors.primary }}>Izvještaj</Text></Pressable>}>
          {month.expenseByCategory.slice(0, 5).map((c) => (
            <Row key={c.category.id} style={{ paddingVertical: 2 }}>
              <CategoryIcon category={c.category} size={32} />
              <View style={{ flex: 1, gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={styles.text}>{c.category.name}</Text>
                  <Text style={styles.text}>{money(c.total)}</Text>
                </Row>
                <ProgressBar value={c.share * 100} max={100} color={c.category.color} />
              </View>
            </Row>
          ))}
        </Card>
      )}

      {budgeted.length > 0 && (
        <Card title="Budžeti">
          {budgeted.map((c) => {
            const b = budgetStatus(state, c, today);
            return (
              <View key={c.id} style={{ gap: 4 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={styles.text}>{c.name}</Text>
                  <Text style={{ color: b.over ? colors.danger : colors.muted }}>
                    {money(b.spent)} / {money(b.budget)}
                  </Text>
                </Row>
                <ProgressBar value={b.spent} max={b.budget} color={c.color} />
                <Text style={[styles.muted, { fontSize: 12 }]}>
                  {b.over ? `Prekoračeno za ${money(-b.remaining)}` : `Preostalo ${money(b.remaining)}`}
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      <Card title="Zadnje transakcije" right={<Pressable onPress={() => router.push('/transactions')}><Text style={{ color: colors.primary }}>Sve</Text></Pressable>}>
        {state.transactions.length === 0 ? (
          <Text style={styles.muted}>Još nema transakcija. Dodaj plaću ili prvi trošak gumbima iznad.</Text>
        ) : (
          state.transactions.slice(0, 8).map((t) => <TransactionRow key={t.id} tx={t} showDate />)
        )}
      </Card>
    </Screen>
  );
}

function QuickButton({ label, icon, color, onPress }: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.card,
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: color,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={{ color, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function Amount({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={[styles.muted, { fontSize: 12 }]}>{label}</Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color }}>{value}</Text>
    </View>
  );
}
