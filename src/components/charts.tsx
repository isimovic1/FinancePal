import { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '../theme';

/** Ring split into coloured segments, e.g. spending per category. */
export function Donut({ segments, size = 170, stroke = 26, children }: {
  segments: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * c;
            // A hairline gap between segments keeps neighbouring colours readable.
            const gap = segments.length > 1 ? Math.min(2, len / 2) : 0;
            const el = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += len;
            return el;
          })}
      </Svg>
      {children}
    </View>
  );
}

/** Vertical bars with an optional dashed average line. */
export function BarChart({ data, height = 160, average, color = colors.expense }: {
  data: { label: string; value: number }[];
  height?: number;
  average?: number;
  color?: string;
}) {
  const [width, setWidth] = useState(300);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const padL = 40;
  const padT = 8;
  const padB = 20;
  const chartH = height - padT - padB;
  const max = Math.max(1, average ?? 0, ...data.map((d) => d.value)) * 1.1;
  const slot = (width - padL) / Math.max(1, data.length);
  const barW = Math.max(2, Math.min(24, slot * 0.65));
  const y = (v: number) => padT + chartH - (v / max) * chartH;
  const labelEvery = Math.ceil(data.length / 8);
  const ticks = [0, max / 2, max].map((t) => (max > 50 ? Math.round(t / 10) * 10 : Math.round(t)));

  return (
    <View onLayout={onLayout} style={{ height }}>
      <Svg width={width} height={height}>
        {ticks.map((t, i) => (
          <SvgText key={i} x={padL - 6} y={y(t) + 4} fontSize={10} fill={colors.muted} textAnchor="end">
            {t}
          </SvgText>
        ))}
        {data.map((d, i) => (
          <Rect
            key={i}
            x={padL + i * slot + (slot - barW) / 2}
            y={y(d.value)}
            width={barW}
            height={Math.max(0, padT + chartH - y(d.value))}
            rx={Math.min(3, barW / 2)}
            fill={d.value === 0 ? colors.border : color}
          />
        ))}
        {average !== undefined && average > 0 && (
          <Line x1={padL} x2={width} y1={y(average)} y2={y(average)} stroke={colors.primary} strokeWidth={1.5} strokeDasharray="5 4" />
        )}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <SvgText key={`l${i}`} x={padL + i * slot + slot / 2} y={height - 5} fontSize={10} fill={colors.muted} textAnchor="middle">
              {d.label}
            </SvgText>
          ) : null,
        )}
      </Svg>
    </View>
  );
}
