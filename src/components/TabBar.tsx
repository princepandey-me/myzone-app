import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Txt } from './Txt';

export type TabName = 'home' | 'timetable' | 'attendance' | 'settings';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: TabName; label: string; icon: IconName; iconOn: IconName }[] = [
  { name: 'home', label: 'Home', icon: 'home-outline', iconOn: 'home' },
  { name: 'timetable', label: 'Timetable', icon: 'calendar-outline', iconOn: 'calendar' },
  { name: 'attendance', label: 'Attendance', icon: 'stats-chart-outline', iconOn: 'stats-chart' },
  { name: 'settings', label: 'Settings', icon: 'settings-outline', iconOn: 'settings' },
];

export function TabBar({ tab, onChange, bottomInset }: { tab: TabName; onChange: (t: TabName) => void; bottomInset: number }) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, 8) }]}>
      {TABS.map((t) => {
        const on = t.name === tab;
        return (
          <Pressable
            key={t.name}
            onPress={() => onChange(t.name)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.label}
          >
            <View style={[styles.iconWrap, on ? { backgroundColor: colors.soft } : null]}>
              <Ionicons name={on ? t.iconOn : t.icon} size={22} color={on ? colors.ink : colors.muted} />
            </View>
            <Txt w={on ? 'bold' : 'medium'} style={{ fontSize: 12, color: on ? colors.ink : colors.muted }}>{t.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
