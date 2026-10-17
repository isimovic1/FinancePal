import { useMemo, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

import { MonthSwitcher } from '../../components/MonthSwitcher';
import { TransactionRow } from '../../components/TransactionRow';
import { Row, Segmented, styles } from '../../components/ui';
import { endOfMonth, friendlyDate, startOfMonth, todayKey } from '../../lib/dates';
import { formatMoney, inRange, signed } from '../../lib/finance';
import { useStore } from '../../lib/store';
import type { TxType } from '../../lib/types';
import { colors, spacing } from '../../theme';

type Filter = 'all' | TxType;

export default function Transactions() {
  const { state } = useStore();
  const [month, setMonth] = useState(todayKey());
  const [filter, setFilter] = useState<Filter>('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const cur = state.settings.currency;

  const txs = useMemo(
    () =>
      inRange(state.transactions, startOfMonth(month), endOfMonth(month)).filter(
        (t) => (filter === 'all' || t.type === filter) && (!categoryId || t.categoryId === categoryId),
      ),
    [state.transactions, month, filter, categoryId],
  );

  const sections = useMemo(() => {
    const byDate = new Map<string, typeof txs>();
    for (const t of txs) byDate.set(t.date, [...(byDate.get(t.date) ?? []), t]);
    return [...byDate.entries()].map(([date, data]) => ({ date, data, total: data.reduce((a, t) => a + signed(t), 0) }));
  }, [txs]);

  const usedCategories = state.categories.filter(
    (c) => (filter === 'all' || c.type === filter) && state.transactions.some((t) => t.categoryId === c.id),
  );
  const sum = txs.reduce((a, t) => a + signed(t), 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.sm }}>
        <MonthSwitcher month={month} onChange={setMonth} />
        <Segmented
          options={[
            { value: 'all', label: 'Sve' },
            { value: 'income', label: 'Prihodi' },
            { value: 'expense', label: 'Troškovi' },
          ]}
          value={filter}
          onChange={(f) => {
            setFilter(f);
            setCategoryId(null);
          }}
        />
        {usedCategories.length > 0 && (
          <Row style={{ flexWrap: 'wrap', gap: 6 }}>
            {usedCategories.map((c) => {
              const active = categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(active ? null : c.id)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 14,
                    backgroundColor: active ? c.color : c.color + '1F',
                  }}
                >
                  <Text style={{ color: active ? '#fff' : c.color, fontWeight: '600', fontSize: 12 }}>{c.name}</Text>
                </Pressable>
              );
            })}
          </Row>
        )}
        <Text style={styles.muted}>
          {txs.length} transakcija · ukupno {formatMoney(sum, cur, { sign: true })}
        </Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Row style={{ justifyContent: 'space-between', marginTop: spacing.md, marginBottom: 2 }}>
            <Text style={[styles.label, { fontSize: 13 }]}>{friendlyDate(section.date)}</Text>
            <Text style={[styles.muted, { fontSize: 12 }]}>{formatMoney(section.total, cur, { sign: true })}</Text>
          </Row>
        )}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: colors.card, paddingHorizontal: spacing.md, borderRadius: 12, marginTop: 4 }}>
            <TransactionRow tx={item} />
          </View>
        )}
        ListEmptyComponent={<Text style={[styles.muted, { textAlign: 'center', marginTop: spacing.xl }]}>Nema transakcija.</Text>}
      />
    </View>
  );
}
