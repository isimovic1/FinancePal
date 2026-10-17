import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Field, KeyboardAware, Segmented, styles } from '../components/ui';
import { CURRENCIES, parseAmount } from '../lib/finance';
import { useStore } from '../lib/store';
import { colors, spacing } from '../theme';

export default function Welcome() {
  const { updateSettings } = useStore();
  const [currency, setCurrency] = useState('€');
  const [balance, setBalance] = useState('');
  const [savings, setSavings] = useState('');

  const start = () => {
    const value = balance.trim() ? parseAmount(balance) : 0;
    if (!Number.isFinite(value)) return Alert.alert('Stanje', 'Unesi ispravan iznos, npr. 1250,50.');
    const savedValue = savings.trim() ? parseAmount(savings) : 0;
    if (!(savedValue >= 0)) return Alert.alert('Štednja', 'Unesi ispravan iznos štednje.');
    updateSettings({ currency, startingBalance: value, startingSavings: savedValue, setupDone: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAware>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: spacing.xs, marginVertical: spacing.lg }}>
            <Text style={styles.h1}>FinancePal 💰</Text>
            <Text style={styles.muted}>
              Unosi plaću i ostale prihode, bilježi troškove po kategorijama i prati koliko ti ostaje do kraja mjeseca.
            </Text>
          </View>
          <Card title="Valuta">
            <Segmented options={CURRENCIES} value={currency} onChange={setCurrency} />
          </Card>
          <Card title="Trenutno stanje računa">
            <Field label="Koliko imaš sada" suffix={currency} value={balance} onChangeText={setBalance} keyboardType="decimal-pad" placeholder="0,00" />
            <Field label="Koliko već imaš na štednji" suffix={currency} value={savings} onChangeText={setSavings} keyboardType="decimal-pad" placeholder="0,00" />
            <Text style={styles.muted}>Od ovih iznosa kreće praćenje. Mogu se kasnije promijeniti u postavkama.</Text>
          </Card>
          <Button title="Započni" onPress={start} />
        </ScrollView>
      </KeyboardAware>
    </SafeAreaView>
  );
}
