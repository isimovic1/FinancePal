import { useState } from 'react';
import { Text, View } from 'react-native';

import { BarChart, Donut } from '../../components/charts';
import { MonthSwitcher } from '../../components/MonthSwitcher';
import { CategoryIcon, TransactionRow } from '../../components/TransactionRow';
import { Card, Row, Screen, styles } from '../../components/ui';
import { addMonths, fromDateKey, todayKey } from '../../lib/dates';
import { formatMoney, monthReport } from '../../lib/finance';
import { useStore } from '../../lib/store';
import { colors, spacing } from '../../theme';

export default function Report() {
  const { state } = useStore();
  const today = todayKey();
  const [month, setMonth] = useState(today);
  const cur = state.settings.currency;
  const money = (n: number, sign = false) => formatMoney(n, cur, { sign });
  const r = monthReport(state, month, today);
  const prev = monthReport(state, addMonths(month, -1), today);
  const prevByCategory = new Map(prev.expenseByCategory.map((c) => [c.category.id, c.total]));

  return (
    <Screen>
      <MonthSwitcher month={month} onChange={setMonth} />

      <Card title="Sažetak">
        <Line label="Prihodi" value={money(r.income)} color={colors.income} />
        <Line label="Troškovi (bez štednje)" value={money(-r.spending)} color={colors.expense} />
        <Line label="Uplaćeno u štednju" value={money(-r.savings)} color={colors.savings} />
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
        <Line label="Razlika u mjesecu" value={money(r.net, true)} color={r.net >= 0 ? colors.income : colors.expense} bold />
        <Line label="Stanje na početku mjeseca" value={money(r.openingBalance)} />
        <Line label="Stanje na kraju mjeseca" value={money(r.closingBalance)} bold />
        {r.savingsRate !== null && (
          <Text style={[styles.muted, { marginTop: 4 }]}>
            Od prihoda ti je ostalo (ili ušteđeno) {Math.round(r.savingsRate * 100)} %.
          </Text>
        )}
        {prev.transactionCount > 0 && (
          <Text style={styles.muted}>
            Potrošnja u odnosu na prošli mjesec: {money(r.spending - prev.spending, true)}
          </Text>
        )}
      </Card>

      {r.expenseByCategory.length > 0 ? (
        <Card title="Troškovi po kategorijama">
          <View style={{ alignItems: 'center', marginVertical: spacing.sm }}>
            <Donut segments={r.expenseByCategory.map((c) => ({ value: c.total, color: c.category.color }))}>
              <Text style={styles.muted}>Ukupno</Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{money(r.expenses)}</Text>
            </Donut>
          </View>
          {r.expenseByCategory.map((c) => {
            const before = prevByCategory.get(c.category.id);
            const diff = before !== undefined ? c.total - before : null;
            return (
              <Row key={c.category.id} style={{ paddingVertical: 4 }}>
                <CategoryIcon category={c.category} size={34} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.text}>{c.category.name}</Text>
                  <Text style={[styles.muted, { fontSize: 12 }]}>
                    {Math.round(c.share * 100)} % · {c.count}×
                    {diff !== null && Math.abs(diff) >= 0.01 ? ` · ${money(diff, true)} vs prošli mj.` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.text, { fontWeight: '700' }]}>{money(c.total)}</Text>
                  {c.category.monthlyBudget ? (
                    <Text style={{ fontSize: 12, color: c.total > c.category.monthlyBudget ? colors.danger : colors.muted }}>
                      budžet {money(c.category.monthlyBudget)}
                    </Text>
                  ) : null}
                </View>
              </Row>
            );
          })}
        </Card>
      ) : (
        <Card>
          <Text style={styles.muted}>U ovom mjesecu nema troškova.</Text>
        </Card>
      )}

      {r.dailySpending.length > 0 && (
        <Card title="Potrošnja po danima">
          <BarChart
            data={r.dailySpending.map((d) => ({ label: String(fromDateKey(d.date).getDate()), value: Math.round(d.amount) }))}
            average={r.avgDailySpending}
          />
          <Text style={[styles.muted, { fontSize: 12 }]}>
            Isprekidana linija: prosjek {money(r.avgDailySpending)} dnevno (bez štednje).
          </Text>
        </Card>
      )}

      {r.incomeByCategory.length > 0 && (
        <Card title="Prihodi">
          {r.incomeByCategory.map((c) => (
            <Row key={c.category.id} style={{ paddingVertical: 4 }}>
              <CategoryIcon category={c.category} size={34} />
              <Text style={[styles.text, { flex: 1 }]}>{c.category.name}</Text>
              <Text style={[styles.text, { fontWeight: '700', color: colors.income }]}>{money(c.total)}</Text>
            </Row>
          ))}
        </Card>
      )}

      {r.biggestExpenses.length > 0 && (
        <Card title="Najveći troškovi">
          {r.biggestExpenses.map((t) => (
            <TransactionRow key={t.id} tx={t} showDate />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Line({ label, value, color = colors.text, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Text style={styles.text}>{label}</Text>
      <Text style={{ fontSize: 15, color, fontWeight: bold ? '800' : '600' }}>{value}</Text>
    </Row>
  );
}
