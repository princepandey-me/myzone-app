import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { DAY_SHORT, WEEKDAYS } from '../logic/slots';
import { colors } from '../theme';
import { Txt } from './Txt';

/** Mon to Fri picker. A dot marks today. */
export function DayChips({
  selected, today, onSelect,
}: { selected: number; today: number; onSelect: (weekday: number) => void }) {
  return (
    <View style={styles.row}>
      {WEEKDAYS.map((d) => {
        const on = d === selected;
        return (
          <Pressable
            key={d}
            onPress={() => onSelect(d)}
            style={[styles.chip, on ? styles.chipOn : null]}
            accessibilityRole="button"
            accessibilityLabel={DAY_SHORT[d]}
          >
            <Txt w="semibold" style={{ fontSize: 15, color: on ? '#FFFFFF' : colors.muted }}>{DAY_SHORT[d]}</Txt>
            <View style={[styles.dot, { backgroundColor: d === today ? (on ? '#FFFFFF' : colors.ink) : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
});
