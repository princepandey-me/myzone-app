import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { clamp01 } from '../logic/timeUtils';
import { colors } from '../theme';
import { Txt } from './Txt';

export function ProgressBar({
  fraction, track, fill, height = 6,
}: { fraction: number; track: string; fill: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ height, width: `${clamp01(fraction) * 100}%`, backgroundColor: fill, borderRadius: height / 2 }} />
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <Txt w="semibold" style={styles.sectionLabel}>
      {children}
    </Txt>
  );
}

export function ScreenTitle({
  title, subtitle, right,
}: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        <Txt w="extrabold" style={styles.title}>{title}</Txt>
        {subtitle ? <Txt w="medium" style={styles.subtitle}>{subtitle}</Txt> : null}
      </View>
      {right}
    </View>
  );
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function Button({
  label, onPress, icon, tone = 'ink', style, disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  tone?: 'ink' | 'ghost' | 'good' | 'bad';
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const filled = tone !== 'ghost';
  const bg = tone === 'good' ? colors.good : tone === 'bad' ? colors.bad : colors.ink;
  const fg = filled ? '#FFFFFF' : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      style={({ pressed }) => [
        styles.button,
        filled ? { backgroundColor: bg } : { borderWidth: 1.5, borderColor: colors.line, backgroundColor: 'transparent' },
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} /> : null}
      <Txt w="semibold" style={{ color: fg, fontSize: 15 }}>{label}</Txt>
    </Pressable>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 13, color: colors.muted, marginTop: 16, marginBottom: 6, marginLeft: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  title: { fontSize: 34, letterSpacing: -0.6, lineHeight: 38 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    overflow: 'hidden',
  },
});
