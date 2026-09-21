import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { Txt } from '../components/Txt';
import { Button, ProgressBar, ScreenTitle } from '../components/ui';
import { AttendanceLevel, percent, statusOf } from '../logic/attendanceMath';
import { useApp } from '../state/AppContext';
import { colorFor, colors } from '../theme';
import { Subject } from '../types';

const LEVEL_COLOR: Record<AttendanceLevel, string> = {
  none: colors.faint,
  good: colors.good,
  warn: colors.warn,
  bad: colors.bad,
};

export function AttendanceScreen() {
  const { data, mark, undoMark, notify } = useApp();
  const [editing, setEditing] = useState<Subject | null>(null);
  const target = data.target;

  let attended = 0;
  let total = 0;
  for (const s of data.timetable.subjects) {
    const r = data.attendance[s.id];
    if (r) {
      attended += r.attended;
      total += r.total;
    }
  }
  const overall = statusOf(attended, total, target);

  function onMark(subject: Subject, present: boolean) {
    mark(subject.id, present);
    notify((present ? 'Marked present' : 'Marked absent') + ' \u00B7 ' + subject.name, 'Undo', () =>
      undoMark(subject.id, present),
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle title="Attendance" subtitle={'Target ' + target + '%. Change it in Settings.'} />

      <View style={styles.overall}>
        <Txt w="medium" style={{ fontSize: 13, color: colors.muted }}>All subjects</Txt>
        <View style={styles.overallRow}>
          <Txt w="extrabold" style={styles.bigPercent}>{total === 0 ? '--' : Math.round(percent(attended, total)) + '%'}</Txt>
          <Txt w="medium" style={{ fontSize: 14, color: colors.muted, marginLeft: 10, marginBottom: 6 }}>
            {attended} of {total} classes
          </Txt>
        </View>
        <View style={{ marginTop: 10 }}>
          <ProgressBar fraction={total === 0 ? 0 : attended / total} track={colors.soft} fill={LEVEL_COLOR[overall.level]} height={8} />
        </View>
        <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 8 }}>{overall.text}</Txt>
      </View>

      {data.timetable.subjects.map((s) => {
        const r = data.attendance[s.id] ?? { attended: 0, total: 0 };
        const st = statusOf(r.attended, r.total, target);
        const c = colorFor(s.color);
        return (
          <View key={s.id} style={[styles.card, { borderLeftColor: c.strong }]}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Txt w="bold" style={{ fontSize: 18 }}>{s.name}</Txt>
                <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>
                  {r.attended} of {r.total} classes
                </Txt>
              </View>
              <Txt w="extrabold" style={[styles.percent, { color: LEVEL_COLOR[st.level] }]}>
                {r.total === 0 ? '--' : Math.round(percent(r.attended, r.total)) + '%'}
              </Txt>
              <Pressable
                onPress={() => setEditing(s)}
                hitSlop={10}
                style={{ marginLeft: 10 }}
                accessibilityRole="button"
                accessibilityLabel={'Edit numbers for ' + s.name}
              >
                <Ionicons name="create-outline" size={22} color={colors.muted} />
              </Pressable>
            </View>
            <View style={{ marginTop: 12 }}>
              <ProgressBar fraction={r.total === 0 ? 0 : r.attended / r.total} track={colors.soft} fill={LEVEL_COLOR[st.level]} />
            </View>
            <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 18 }}>{st.text}</Txt>
            <View style={styles.buttons}>
              <Button label="Present" icon="checkmark" tone="good" onPress={() => onMark(s, true)} style={{ flex: 1 }} />
              <Button label="Absent" icon="close" tone="bad" onPress={() => onMark(s, false)} style={{ flex: 1 }} />
            </View>
          </View>
        );
      })}

      {editing ? <NumbersSheet key={editing.id} subject={editing} onClose={() => setEditing(null)} /> : null}
    </ScrollView>
  );
}

function NumbersSheet({ subject, onClose }: { subject: Subject; onClose: () => void }) {
  const { data, setAttendance, notify } = useApp();
  const r = data.attendance[subject.id] ?? { attended: 0, total: 0 };
  const [a, setA] = useState(String(r.attended));
  const [t, setT] = useState(String(r.total));
  const [error, setError] = useState('');

  function save() {
    const attended = parseInt(a, 10);
    const total = parseInt(t, 10);
    if (isNaN(attended) || isNaN(total) || attended < 0 || total < 0) {
      setError('Enter whole numbers, zero or more.');
      return;
    }
    if (attended > total) {
      setError('Attended classes cannot be more than total classes.');
      return;
    }
    setAttendance(subject.id, attended, total);
    notify('Saved ' + subject.name);
    onClose();
  }

  return (
    <Sheet visible onClose={onClose} title={subject.name}>
      <Txt w="medium" style={styles.fieldLabel}>Classes attended</Txt>
      <TextInput value={a} onChangeText={setA} keyboardType="number-pad" style={styles.input} />
      <Txt w="medium" style={styles.fieldLabel}>Total classes held</Txt>
      <TextInput value={t} onChangeText={setT} keyboardType="number-pad" style={styles.input} />
      {error ? <Txt w="medium" style={{ color: colors.bad, fontSize: 13, marginTop: 8 }}>{error}</Txt> : null}
      <View style={styles.sheetButtons}>
        <Button label="Cancel" tone="ghost" onPress={onClose} style={{ flex: 1 }} />
        <Button label="Save" onPress={save} style={{ flex: 1 }} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  overall: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 14,
  },
  overallRow: { flexDirection: 'row', alignItems: 'flex-end' },
  bigPercent: { fontSize: 44, lineHeight: 50, letterSpacing: -1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderLeftWidth: 6,
    padding: 16,
    marginBottom: 12,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  percent: { fontSize: 26, letterSpacing: -0.5 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  fieldLabel: { fontSize: 13, color: colors.muted, marginTop: 10, marginBottom: 6 },
  input: {
    fontFamily: 'BricolageGrotesque_500Medium',
    fontSize: 17,
    color: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bg,
  },
  sheetButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
