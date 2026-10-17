import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Field, Segmented, styles } from '../components/ui';
import { CURRENCIES, parseAmount } from '../lib/finance';
import { useStore } from '../lib/store';
import { colors, spacing } from '../theme';

export default function Welcome() {
  const { updateSettings } = useStore();
  const [currency, setCurrency] = useState('€');
  const [balance, setBalance] = useState('');

  const start = () => {
    const value = balance.trim() ? parseAmount(balance) : 0;
    if (!Number.isFinite(value)) return Alert.alert('Stanje', 'Unesi ispravan iznos, npr. 1250,50.');
    updateSettings({ currency, startingBalance: value, setupDone: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
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
          <Text style={styles.muted}>Od ovog iznosa kreće praćenje. Može se kasnije promijeniti u postavkama.</Text>
        </Card>
        <Button title="Započni" onPress={start} />
      </ScrollView>
    </SafeAreaView>
  );
}
