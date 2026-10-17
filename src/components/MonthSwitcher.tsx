import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from 'react-native';

import { addMonths, fromDateKey, monthName, startOfMonth, todayKey } from '../lib/dates';
import type { DateKey } from '../lib/types';
import { colors } from '../theme';
import { Row } from './ui';

export function MonthSwitcher({ month, onChange }: { month: DateKey; onChange: (m: DateKey) => void }) {
  const isCurrent = startOfMonth(month) >= startOfMonth(todayKey());
  const label = monthName(month);
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <Pressable onPress={() => onChange(addMonths(month, -1))} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </Pressable>
      <Text style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
        {label.charAt(0).toUpperCase() + label.slice(1)} {fromDateKey(month).getFullYear()}.
      </Text>
      <Pressable onPress={() => onChange(addMonths(month, 1))} hitSlop={12} disabled={isCurrent}>
        <Ionicons name="chevron-forward" size={24} color={isCurrent ? colors.border : colors.primary} />
      </Pressable>
    </Row>
  );
}
