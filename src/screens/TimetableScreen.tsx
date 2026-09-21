import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ClassTile, GapTile } from '../components/ClassCards';
import { DayChips } from '../components/DayChips';
import { DayRibbon } from '../components/DayRibbon';
import { Txt } from '../components/Txt';
import { Button, ScreenTitle } from '../components/ui';
import { useNow } from '../hooks/useNow';
import { buildRows } from '../logic/dayBuilder';
import { DAY_NAMES } from '../logic/slots';
import { subjectOf } from '../logic/subjects';
import { minutesOf, range12, weekdayOf } from '../logic/timeUtils';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

export function TimetableScreen({ onEditDay }: { onEditDay: (weekday: number) => void }) {
  const { data } = useApp();
  const now = useNow();
  const today = weekdayOf(now);
  const nowMin = minutesOf(now);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = picked ?? (today <= 5 ? today : 1);
  const isToday = selected === today;
  const tt = data.timetable;
  const rows = buildRows(tt, selected);
  const partial = tt.incompleteDays.includes(selected);

  let summary = 'No classes added yet';
  if (rows) {
    const classes = rows.filter((r) => r.type === 'class');
    const count = classes.reduce((n, r) => n + r.periods, 0);
    summary = count + (partial ? ' classes so far' : ' classes') + ' \u00B7 ' + range12(classes[0].start, classes[classes.length - 1].end);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle
        title="Timetable"
        subtitle={summary}
        right={
          <Pressable
            onPress={() => onEditDay(selected)}
            style={styles.edit}
            accessibilityRole="button"
            accessibilityLabel={'Edit ' + DAY_NAMES[selected]}
          >
            <Ionicons name="create-outline" size={20} color={colors.ink} />
            <Txt w="semibold" style={{ fontSize: 14, marginLeft: 6 }}>Edit</Txt>
          </Pressable>
        }
      />
      <DayChips selected={selected} today={today} onSelect={setPicked} />

      {rows ? (
        <>
          <View style={{ marginTop: 16, marginBottom: 14 }}>
            <DayRibbon rows={rows} tt={tt} nowMin={isToday ? nowMin : null} />
          </View>
          {rows.map((r, i) => {
            const past = isToday && nowMin >= r.end;
            const current = isToday && nowMin >= r.start && nowMin < r.end;
            return r.type === 'class' ? (
              <ClassTile key={i} subject={subjectOf(tt, r.subjectId)} row={r} past={past} current={current} />
            ) : (
              <GapTile key={i} row={r} past={past} current={current} />
            );
          })}
        </>
      ) : (
        <View style={styles.empty}>
          <Txt w="bold" style={{ fontSize: 18 }}>No classes on {DAY_NAMES[selected]} yet</Txt>
          <Txt w="medium" style={{ fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 14 }}>
            Add your classes for this day.
          </Txt>
          <Button label="Add classes" icon="add" onPress={() => onEditDay(selected)} />
        </View>
      )}

      {rows && partial ? (
        <View style={styles.note}>
          <Txt w="medium" style={{ fontSize: 13, color: colors.muted, lineHeight: 19 }}>
            Later classes may be missing for this day. Tap Edit to add them.
          </Txt>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  edit: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  empty: {
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  note: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
  },
});
