import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import { CategoryIcon } from '../components/TransactionRow';
import { Button, Card, Field, Row, Screen, Segmented, styles } from '../components/ui';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../lib/categories';
import { parseAmount } from '../lib/finance';
import { newId, useStore } from '../lib/store';
import type { Category, TxType } from '../lib/types';
import { colors, spacing } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ id?: string; type?: TxType }>();
  const { state, saveCategory, removeCategory } = useStore();
  const existing = params.id ? state.categories.find((c) => c.id === params.id) : undefined;

  const [type, setType] = useState<TxType>(existing?.type ?? params.type ?? 'expense');
  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? CATEGORY_ICONS[0]);
  const [color, setColor] = useState(existing?.color ?? CATEGORY_COLORS[0]);
  const [budget, setBudget] = useState(existing?.monthlyBudget ? String(existing.monthlyBudget).replace('.', ',') : '');
  const [isSavings, setIsSavings] = useState(existing?.isSavings ?? false);

  const save = () => {
    if (!name.trim()) return Alert.alert('Naziv', 'Upiši naziv kategorije.');
    const b = budget.trim() ? parseAmount(budget) : undefined;
    if (b !== undefined && !(b > 0)) return Alert.alert('Budžet', 'Unesi ispravan iznos ili ostavi prazno.');
    const category: Category = {
      id: existing?.id ?? newId(),
      name: name.trim(),
      type,
      icon,
      color,
      monthlyBudget: type === 'expense' ? b : undefined,
      isSavings: type === 'expense' ? isSavings : undefined,
    };
    saveCategory(category);
    router.back();
  };

  const remove = () => {
    const fallback = state.categories.find((c) => c.type === existing!.type && c.id !== existing!.id && c.id.startsWith('other'))
      ?? state.categories.find((c) => c.type === existing!.type && c.id !== existing!.id);
    if (!fallback) return Alert.alert('Nije moguće', 'Mora ostati barem jedna kategorija.');
    const used = state.transactions.filter((t) => t.categoryId === existing!.id).length;
    Alert.alert(
      'Obrisati kategoriju?',
      used ? `${used} transakcija bit će premješteno u "${fallback.name}".` : 'Kategorija nema transakcija.',
      [
        { text: 'Odustani', style: 'cancel' },
        {
          text: 'Obriši',
          style: 'destructive',
          onPress: () => {
            removeCategory(existing!.id, fallback.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <Screen>
      {!existing && (
        <Segmented
          options={[
            { value: 'expense', label: 'Trošak' },
            { value: 'income', label: 'Prihod' },
          ]}
          value={type}
          onChange={setType}
        />
      )}
      <Card>
        <Row>
          <CategoryIcon category={{ id: '', name, type, icon, color }} size={48} />
          <View style={{ flex: 1 }}>
            <Field label="Naziv" value={name} onChangeText={setName} placeholder="npr. Kućni ljubimci" />
          </View>
        </Row>
      </Card>
      <Card title="Ikona">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {CATEGORY_ICONS.map((i) => (
            <Pressable
              key={i}
              onPress={() => setIcon(i)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: i === icon ? color : colors.bg,
              }}
            >
              <Ionicons name={i as IconName} size={22} color={i === icon ? '#fff' : colors.muted} />
            </Pressable>
          ))}
        </View>
      </Card>
      <Card title="Boja">
        <Row style={{ flexWrap: 'wrap', gap: spacing.sm }}>
          {CATEGORY_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, borderWidth: 3, borderColor: c === color ? colors.text : 'transparent' }}
            />
          ))}
        </Row>
      </Card>
      {type === 'expense' && (
        <Card>
          <Field
            label="Mjesečni budžet (nije obavezno)"
            suffix={state.settings.currency}
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
          />
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.text}>Ovo je štednja</Text>
              <Text style={[styles.muted, { fontSize: 12 }]}>Uplate se u izvještaju vode kao ušteđeno, ne kao potrošeno.</Text>
            </View>
            <Switch value={isSavings} onValueChange={setIsSavings} />
          </Row>
        </Card>
      )}
      <Button title="Spremi" onPress={save} />
      {existing && <Button title="Obriši kategoriju" variant="danger" onPress={remove} />}
    </Screen>
  );
}
