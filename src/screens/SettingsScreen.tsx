import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { Txt } from '../components/Txt';
import { Button, ScreenTitle, SectionLabel } from '../components/ui';
import { DAY_SHORT, WEEKDAYS } from '../logic/slots';
import { encodeTimetable } from '../logic/timetableCode';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const LEAD_OPTIONS = [5, 10, 15, 30];

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function ActionRow({
  icon, title, subtitle, onPress, last,
}: { icon: IconName; title: string; subtitle?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionRow, last ? null : styles.divider]} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={colors.ink} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Txt w="semibold" style={{ fontSize: 16 }}>{title}</Txt>
        {subtitle ? <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>{subtitle}</Txt> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </Pressable>
  );
}

export function SettingsScreen({
  onOpenSubjects, onEditDay,
}: { onOpenSubjects: () => void; onEditDay: (weekday: number) => void }) {
  const { data, setTarget, setReminders, resetTimetable, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { target, reminders } = data;

  async function toggleReminders(enabled: boolean) {
    setBusy(true);
    const error = await setReminders({ ...reminders, enabled });
    setBusy(false);
    if (error) Alert.alert('Reminders', error);
    else notify(enabled ? 'Class reminders are on' : 'Class reminders are off');
  }

  async function changeLead(minutes: number) {
    if (minutes === reminders.leadMinutes) return;
    setBusy(true);
    const error = await setReminders({ ...reminders, leadMinutes: minutes });
    setBusy(false);
    if (error) Alert.alert('Reminders', error);
  }

  async function shareCode() {
    try {
      await Share.share({ message: encodeTimetable(data.timetable) });
    } catch {
      notify('Could not open the share sheet');
    }
  }

  function confirmReset() {
    Alert.alert('Reset timetable?', 'This brings back the original timetable. Your attendance numbers stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetTimetable();
          notify('Timetable reset');
        },
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ScreenTitle title="Settings" />

      <SectionLabel>Timetable</SectionLabel>
      <Card>
        <ActionRow
          icon="color-palette-outline"
          title="Subjects"
          subtitle={data.timetable.subjects.length + ' subjects. Rename, recolour or add more.'}
          onPress={onOpenSubjects}
        />
        <View style={[styles.actionRow, styles.divider, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <Txt w="semibold" style={{ fontSize: 16 }}>Edit a day</Txt>
          <View style={styles.dayRow}>
            {WEEKDAYS.map((d) => (
              <Pressable key={d} onPress={() => onEditDay(d)} style={styles.dayButton} accessibilityRole="button">
                <Txt w="semibold" style={{ fontSize: 14 }}>{DAY_SHORT[d]}</Txt>
              </Pressable>
            ))}
          </View>
        </View>
        <ActionRow icon="refresh-outline" title="Reset timetable" subtitle="Go back to the original timetable." onPress={confirmReset} last />
      </Card>

      <SectionLabel>Attendance</SectionLabel>
      <Card>
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Txt w="semibold" style={{ fontSize: 16 }}>Target attendance</Txt>
            <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>The percentage your college asks for.</Txt>
          </View>
          <Pressable
            onPress={() => setTarget(Math.max(50, target - 5))}
            style={styles.stepper}
            accessibilityRole="button"
            accessibilityLabel="Lower target"
          >
            <Ionicons name="remove" size={20} color={colors.ink} />
          </Pressable>
          <Txt w="extrabold" style={styles.targetValue}>{target}%</Txt>
          <Pressable
            onPress={() => setTarget(Math.min(95, target + 5))}
            style={styles.stepper}
            accessibilityRole="button"
            accessibilityLabel="Raise target"
          >
            <Ionicons name="add" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </Card>

      <SectionLabel>Reminders</SectionLabel>
      <Card>
        <View style={[styles.actionRow, styles.divider]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Txt w="semibold" style={{ fontSize: 16 }}>Class reminders</Txt>
            <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>
              A notification before each class. Works on a real phone.
            </Txt>
          </View>
          <Switch
            value={reminders.enabled}
            onValueChange={toggleReminders}
            disabled={busy}
            trackColor={{ false: colors.line, true: colors.ink }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.actionRow, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <Txt w="semibold" style={{ fontSize: 16 }}>Remind me before class</Txt>
          <View style={styles.dayRow}>
            {LEAD_OPTIONS.map((m) => {
              const on = m === reminders.leadMinutes;
              return (
                <Pressable
                  key={m}
                  onPress={() => changeLead(m)}
                  disabled={busy}
                  style={[styles.dayButton, on ? { backgroundColor: colors.ink, borderColor: colors.ink } : null]}
                  accessibilityRole="button"
                >
                  <Txt w="semibold" style={{ fontSize: 14, color: on ? '#FFFFFF' : colors.ink }}>{m} min</Txt>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      <SectionLabel>Share with classmates</SectionLabel>
      <Card>
        <ActionRow
          icon="share-social-outline"
          title="Share timetable code"
          subtitle="Send it on WhatsApp. They can import it."
          onPress={shareCode}
        />
        <ActionRow
          icon="download-outline"
          title="Import a timetable code"
          subtitle="Replaces your timetable with a friend's."
          onPress={() => setImportOpen(true)}
          last
        />
      </Card>

      <Txt w="medium" style={styles.footer}>
        Weather comes from the free Open-Meteo API. Your timetable and attendance stay on this phone.
      </Txt>

      {importOpen ? <ImportSheet onClose={() => setImportOpen(false)} /> : null}
    </ScrollView>
  );
}

function ImportSheet({ onClose }: { onClose: () => void }) {
  const { importCode, notify } = useApp();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function run() {
    Alert.alert('Replace your timetable?', 'The timetable on this phone will be replaced by the code.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Replace',
        style: 'destructive',
        onPress: () => {
          const err = importCode(text);
          if (err) {
            setError(err);
          } else {
            notify('Timetable imported');
            onClose();
          }
        },
      },
    ]);
  }

  return (
    <Sheet visible onClose={onClose} title="Import a timetable code">
      <Txt w="medium" style={{ fontSize: 14, color: colors.muted, marginBottom: 10 }}>
        Paste the code your friend sent. It starts with TT1:
      </Txt>
      <TextInput
        value={text}
        onChangeText={(v) => {
          setText(v);
          setError('');
        }}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="TT1:..."
        placeholderTextColor={colors.faint}
        style={styles.codeInput}
      />
      {error ? <Txt w="medium" style={{ color: colors.bad, fontSize: 13, marginTop: 8 }}>{error}</Txt> : null}
      <View style={styles.sheetButtons}>
        <Button label="Cancel" tone="ghost" onPress={onClose} style={{ flex: 1 }} />
        <Button label="Import" onPress={run} disabled={text.trim().length === 0} style={{ flex: 1 }} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.soft },
  dayRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  stepper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetValue: { fontSize: 20, width: 56, textAlign: 'center' },
  footer: { fontSize: 12.5, color: colors.faint, marginTop: 18, lineHeight: 18, textAlign: 'center' },
  codeInput: {
    fontFamily: 'BricolageGrotesque_500Medium',
    fontSize: 14,
    color: colors.ink,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.bg,
  },
  sheetButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
