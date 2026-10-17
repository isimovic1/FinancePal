import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { formatMoney } from '../lib/finance';
import { useCategory, useStore } from '../lib/store';
import type { Category, Transaction } from '../lib/types';
import { colors, spacing } from '../theme';
import { styles } from './ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function CategoryIcon({ category, size = 38 }: { category?: Category; size?: number }) {
  const color = category?.color ?? colors.muted;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={(category?.icon ?? 'help-circle-outline') as IconName} size={size * 0.5} color={color} />
    </View>
  );
}

export function TransactionRow({ tx, showDate }: { tx: Transaction; showDate?: boolean }) {
  const category = useCategory(tx.categoryId);
  const { state } = useStore();
  const income = tx.type === 'income';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/transaction', params: { id: tx.id } })}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 8,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <CategoryIcon category={category} />
      <View style={{ flex: 1 }}>
        <Text style={styles.text} numberOfLines={1}>
          {tx.note || category?.name || 'Bez kategorije'}
        </Text>
        <Text style={[styles.muted, { fontSize: 12 }]} numberOfLines={1}>
          {tx.note ? category?.name : ''}
          {tx.note && showDate ? ' · ' : ''}
          {showDate ? tx.date.split('-').reverse().join('.') + '.' : ''}
        </Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: income ? colors.income : colors.text }}>
        {formatMoney(income ? tx.amount : -tx.amount, state.settings.currency, { sign: true })}
      </Text>
    </Pressable>
  );
}
