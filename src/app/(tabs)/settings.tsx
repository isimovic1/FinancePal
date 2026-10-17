import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { CategoryIcon } from '../../components/TransactionRow';
import { Button, Card, Field, Screen, Segmented, styles } from '../../components/ui';
import { CURRENCIES, formatMoney, parseAmount } from '../../lib/finance';
import { useStore } from '../../lib/store';
import type { TxType } from '../../lib/types';
import { colors, spacing } from '../../theme';

export default function Settings() {
  const { state, updateSettings, reset } = useStore();
  const { settings } = state;
  const [startText, setStartText] = useState(settings.startingBalance.toFixed(2).replace('.', ','));
  const [savingsText, setSavingsText] = useState(settings.startingSavings.toFixed(2).replace('.', ','));
  const [type, setType] = useState<TxType>('expense');

  const saveStart = () => {
    const v = parseAmount(startText);
    if (!Number.isFinite(v)) return Alert.alert('Iznos', 'Unesi ispravan iznos.');
    const s = parseAmount(savingsText);
    if (!Number.isFinite(s) || s < 0) return Alert.alert('Iznos', 'Unesi ispravan iznos štednje.');
    updateSettings({ startingBalance: v, startingSavings: s });
    Alert.alert('Spremljeno', `Račun: ${formatMoney(v, settings.currency)}\nŠtednja: ${formatMoney(s, settings.currency)}`);
  };

  return (
    <Screen>
      <Card title="Valuta">
        <Segmented
          options={CURRENCIES.some((c) => c.value === settings.currency) ? CURRENCIES : [...CURRENCIES, { value: settings.currency, label: settings.currency }]}
          value={settings.currency}
          onChange={(currency) => updateSettings({ currency })}
        />
      </Card>

      <Card title="Početno stanje">
        <Field label="Račun prije prve transakcije" suffix={settings.currency} value={startText} onChangeText={setStartText} keyboardType="decimal-pad" />
        <Field label="Štednja prije prvog prebacivanja" suffix={settings.currency} value={savingsText} onChangeText={setSavingsText} keyboardType="decimal-pad" />
        <Text style={styles.muted}>Promijeni ako stanje u aplikaciji ne odgovara stanju na računu ili štednji.</Text>
        <Button title="Spremi" variant="secondary" onPress={saveStart} />
      </Card>

      <Card title="Kategorije i budžeti" right={
        <Pressable onPress={() => router.push({ pathname: '/category', params: { type } })} hitSlop={10}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </Pressable>
      }>
        <Segmented
          options={[{ value: 'expense', label: 'Troškovi' }, { value: 'income', label: 'Prihodi' }]}
          value={type}
          onChange={setType}
        />
        {state.categories.filter((c) => c.type === type).map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/category', params: { id: c.id } })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 6 }}
          >
            <CategoryIcon category={c} size={34} />
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>{c.name}</Text>
              {(c.monthlyBudget || c.isSavings) && (
                <Text style={[styles.muted, { fontSize: 12 }]}>
                  {[c.monthlyBudget ? `budžet ${formatMoney(c.monthlyBudget, settings.currency)}/mj.` : '', c.isSavings ? 'štednja' : '']
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </Card>

      <Card title="Podaci">
        <Text style={styles.muted}>{state.transactions.length} transakcija · svi podaci su spremljeni samo na ovom uređaju.</Text>
        <Button
          title="Obriši sve podatke"
          variant="danger"
          onPress={() =>
            Alert.alert('Obrisati sve?', 'Brišu se sve transakcije, kategorije i postavke. Ne može se poništiti.', [
              { text: 'Odustani', style: 'cancel' },
              { text: 'Obriši', style: 'destructive', onPress: reset },
            ])
          }
        />
      </Card>
    </Screen>
  );
}
