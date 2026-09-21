import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Sheet } from '../components/Sheet';
import { Txt } from '../components/Txt';
import { Button } from '../components/ui';
import { DAY_NAMES, LUNCH_END, LUNCH_START, SLOTS } from '../logic/slots';
import { range12 } from '../logic/timeUtils';
import { useApp } from '../state/AppContext';
import { colorFor, colors } from '../theme';

export function EditDayScreen({ weekday, onBack }: { weekday: number; onBack: () => void }) {
  const { data, setDayComplete } = useApp();
  const tt = data.timetable;
  const [slotId, setSlotId] = useState<number | null>(null);
  const day = tt.week[weekday] ?? {};
  const complete = !tt.incompleteDays.includes(weekday);

  return (
    <View style={{ flex: 1 }}>
      <BackHeader title={'Edit ' + DAY_NAMES[weekday]} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Txt w="medium" style={styles.hint}>Tap a time slot to choose the subject, or mark it as a free period.</Txt>

        {SLOTS.map((slot) => {
          const p = day[slot.id];
          const subject = p ? tt.subjects.find((s) => s.id === p.subjectId) : undefined;
          const c = colorFor(subject ? subject.color : 0);
          return (
            <View key={slot.id}>
              {slot.id === 4 ? (
                <View style={styles.lunch}>
                  <Txt w="semibold" style={{ fontSize: 13, color: colors.muted }}>
                    Lunch break {'\u00B7'} {range12(LUNCH_START, LUNCH_END)}
                  </Txt>
                </View>
              ) : null}
              <Pressable
                onPress={() => setSlotId(slot.id)}
                style={[styles.slot, subject ? { backgroundColor: c.tint, borderLeftColor: c.strong, borderLeftWidth: 6 } : styles.slotFree]}
                accessibilityRole="button"
                accessibilityLabel={'Edit slot ' + range12(slot.start, slot.end)}
              >
                <View style={{ flex: 1 }}>
                  <Txt w="medium" style={{ fontSize: 13, color: colors.muted }}>{range12(slot.start, slot.end)}</Txt>
                  <Txt w="bold" style={{ fontSize: 18, marginTop: 1, color: subject ? colors.ink : colors.faint }}>
                    {subject ? subject.name : 'Free period'}
                  </Txt>
                  {p && p.room ? (
                    <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>{p.room}</Txt>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.faint} />
              </Pressable>
            </View>
          );
        })}

        <View style={styles.completeRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Txt w="bold" style={{ fontSize: 16 }}>All classes for this day are listed</Txt>
            <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
              Turn this on when nothing is missing. It hides the "may be missing" notes.
            </Txt>
          </View>
          <Switch
            value={complete}
            onValueChange={(v) => setDayComplete(weekday, v)}
            trackColor={{ false: colors.line, true: colors.ink }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      {slotId !== null ? (
        <SlotSheet key={slotId} weekday={weekday} slotId={slotId} onClose={() => setSlotId(null)} />
      ) : null}
    </View>
  );
}

function SlotSheet({ weekday, slotId, onClose }: { weekday: number; slotId: number; onClose: () => void }) {
  const { data, setPeriod } = useApp();
  const tt = data.timetable;
  const current = tt.week[weekday] ? tt.week[weekday][slotId] : undefined;
  const slot = SLOTS.find((s) => s.id === slotId);
  const [subjectId, setSubjectId] = useState<string | null>(current ? current.subjectId : null);
  const [room, setRoom] = useState(current ? current.room : '');

  function save() {
    if (subjectId === null) {
      setPeriod(weekday, slotId, null);
    } else {
      setPeriod(weekday, slotId, { subjectId, room: room.trim() });
    }
    onClose();
  }

  function makeFree() {
    setPeriod(weekday, slotId, null);
    onClose();
  }

  return (
    <Sheet visible onClose={onClose} title={slot ? range12(slot.start, slot.end) : 'Time slot'}>
      <Txt w="medium" style={styles.label}>Subject</Txt>
      <View style={styles.chips}>
        {tt.subjects.map((s) => {
          const on = s.id === subjectId;
          const c = colorFor(s.color);
          return (
            <Pressable
              key={s.id}
              onPress={() => setSubjectId(s.id)}
              style={[styles.chip, { borderColor: c.strong, backgroundColor: on ? c.strong : c.tint }]}
            >
              <Txt w="semibold" style={{ fontSize: 14, color: on ? '#FFFFFF' : colors.ink }}>{s.name}</Txt>
            </Pressable>
          );
        })}
      </View>

      <Txt w="medium" style={styles.label}>Room or lab (optional)</Txt>
      <TextInput
        value={room}
        onChangeText={setRoom}
        placeholder="Leave empty for the normal classroom"
        placeholderTextColor={colors.faint}
        style={styles.input}
      />

      <View style={styles.buttons}>
        <Button label="Free period" tone="ghost" onPress={makeFree} style={{ flex: 1 }} />
        <Button label="Save" onPress={save} disabled={subjectId === null} style={{ flex: 1 }} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  hint: { fontSize: 14, color: colors.muted, marginBottom: 12 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  slotFree: { borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed' },
  lunch: {
    backgroundColor: colors.soft,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  completeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  label: { fontSize: 13, color: colors.muted, marginTop: 8, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  input: {
    fontFamily: 'BricolageGrotesque_500Medium',
    fontSize: 16,
    color: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bg,
  },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
