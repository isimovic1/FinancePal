import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { CategoryIcon } from '../components/TransactionRow';
import { Button, Card, Field, Row, Screen, Segmented, styles } from '../components/ui';
import { addDays, friendlyDate, todayKey } from '../lib/dates';
import { parseAmount } from '../lib/finance';
import { useStore } from '../lib/store';
import type { TxType } from '../lib/types';
import { colors, spacing } from '../theme';

export default function TransactionScreen() {
  const params = useLocalSearchParams<{ id?: string; type?: TxType }>();
  const { state, saveTransaction, removeTransaction } = useStore();
  const existing = params.id ? state.transactions.find((t) => t.id === params.id) : undefined;

  const [type, setType] = useState<TxType>(existing?.type ?? params.type ?? 'expense');
  const [amount, setAmount] = useState(existing ? existing.amount.toFixed(2).replace('.', ',') : '');
  const [date, setDate] = useState(existing?.date ?? todayKey());
  const [note, setNote] = useState(existing?.note ?? '');
  const categories = state.categories.filter((c) => c.type === type);
  const defaultCategory = (t: TxType) => (t === 'income' ? 'salary' : undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(existing?.categoryId ?? defaultCategory(type));

  const color = type === 'income' ? colors.income : colors.expense;
  const value = parseAmount(amount);
  const valid = Number.isFinite(value) && value > 0 && !!categoryId && categories.some((c) => c.id === categoryId);

  const save = () => {
    if (!(Number.isFinite(value) && value > 0)) return Alert.alert('Iznos', 'Unesi iznos veći od nule.');
    if (!valid) return Alert.alert('Kategorija', 'Odaberi kategoriju.');
    saveTransaction({
      id: existing?.id,
      createdAt: existing?.createdAt,
      type,
      amount: Math.round(value * 100) / 100,
      categoryId: categoryId!,
      date,
      note: note.trim() || undefined,
    });
    router.back();
  };

  const remove = () =>
    Alert.alert('Obrisati transakciju?', 'Stanje računa će se ažurirati.', [
      { text: 'Odustani', style: 'cancel' },
      {
        text: 'Obriši',
        style: 'destructive',
        onPress: () => {
          removeTransaction(existing!.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen>
      <Segmented
        options={[
          { value: 'expense', label: 'Trošak' },
          { value: 'income', label: 'Prihod' },
        ]}
        value={type}
        onChange={(t) => {
          setType(t);
          setCategoryId(defaultCategory(t));
        }}
      />

      <Card>
        <Text style={styles.label}>Iznos</Text>
        <Row>
          <Text style={{ fontSize: 34, fontWeight: '800', color }}>{type === 'income' ? '+' : '−'}</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={colors.border}
            keyboardType="decimal-pad"
            autoFocus={!existing}
            style={{ flex: 1, fontSize: 34, fontWeight: '800', color, paddingVertical: 4 }}
          />
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.muted }}>{state.settings.currency}</Text>
        </Row>
      </Card>

      <Card title="Kategorija">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {categories.map((c) => {
            const active = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={{
                  width: '31%',
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: spacing.sm,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: active ? c.color : 'transparent',
                  backgroundColor: active ? c.color + '14' : 'transparent',
                }}
              >
                <CategoryIcon category={c} size={36} />
                <Text style={{ fontSize: 12, color: colors.text, textAlign: 'center' }} numberOfLines={2}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => router.push({ pathname: '/category', params: { type } })}
            style={{ width: '31%', alignItems: 'center', gap: 4, paddingVertical: spacing.sm }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add" size={20} color={colors.muted} />
            </View>
            <Text style={{ fontSize: 12, color: colors.muted }}>Nova</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>Datum</Text>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => setDate(addDays(date, -1))} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => setDate(todayKey())}>
            <Text style={[styles.text, { fontWeight: '700' }]}>{friendlyDate(date)}</Text>
          </Pressable>
          <Pressable onPress={() => setDate(addDays(date, 1))} hitSlop={12}>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>
        </Row>
        <Field label="Opis (nije obavezno)" value={note} onChangeText={setNote} placeholder={type === 'income' ? 'npr. Plaća za listopad' : 'npr. Struja, Konzum…'} />
      </Card>

      <Button title={existing ? 'Spremi promjene' : type === 'income' ? 'Dodaj prihod' : 'Dodaj trošak'} onPress={save} disabled={!valid} />
      {existing && <Button title="Obriši" variant="danger" onPress={remove} />}
    </Screen>
  );
}
