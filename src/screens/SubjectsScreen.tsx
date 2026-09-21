import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { BackHeader } from '../components/BackHeader';
import { Sheet } from '../components/Sheet';
import { Txt } from '../components/Txt';
import { Button } from '../components/ui';
import { useApp } from '../state/AppContext';
import { colorFor, colors, palette } from '../theme';
import { Subject } from '../types';

export function SubjectsScreen({ onBack }: { onBack: () => void }) {
  const { data } = useApp();
  const [editing, setEditing] = useState<Subject | 'new' | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <BackHeader title="Subjects" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Txt w="medium" style={styles.hint}>
          Tap a subject to rename it, change the teacher or pick a new colour.
        </Txt>
        {data.timetable.subjects.map((s) => {
          const c = colorFor(s.color);
          return (
            <Pressable
              key={s.id}
              onPress={() => setEditing(s)}
              style={[styles.row, { backgroundColor: c.tint, borderLeftColor: c.strong }]}
              accessibilityRole="button"
              accessibilityLabel={'Edit ' + s.name}
            >
              <View style={{ flex: 1 }}>
                <Txt w="bold" style={{ fontSize: 18 }}>{s.name}</Txt>
                <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 1 }}>
                  {s.teacher ? s.teacher : 'No teacher added'}
                </Txt>
              </View>
              <Ionicons name="create-outline" size={20} color={colors.muted} />
            </Pressable>
          );
        })}
        <Button label="Add subject" icon="add" onPress={() => setEditing('new')} style={{ marginTop: 10 }} />
      </ScrollView>

      {editing ? (
        <SubjectSheet
          key={editing === 'new' ? 'new' : editing.id}
          subject={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </View>
  );
}

function SubjectSheet({ subject, onClose }: { subject: Subject | null; onClose: () => void }) {
  const { data, upsertSubject, deleteSubject, notify } = useApp();
  const [name, setName] = useState(subject ? subject.name : '');
  const [teacher, setTeacher] = useState(subject ? subject.teacher : '');
  const [color, setColor] = useState(subject ? subject.color : data.timetable.subjects.length % palette.length);

  function save() {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    upsertSubject({
      id: subject ? subject.id : 's' + Date.now().toString(36),
      name: trimmed,
      teacher: teacher.trim(),
      color,
    });
    onClose();
  }

  function remove() {
    if (!subject) return;
    Alert.alert(
      'Delete ' + subject.name + '?',
      'Its classes are removed from the timetable and its attendance record is deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSubject(subject.id);
            notify('Deleted ' + subject.name);
            onClose();
          },
        },
      ],
    );
  }

  return (
    <Sheet visible onClose={onClose} title={subject ? 'Edit subject' : 'New subject'}>
      <Txt w="medium" style={styles.label}>Subject name</Txt>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="For example, Physics"
        placeholderTextColor={colors.faint}
        style={styles.input}
      />
      <Txt w="medium" style={styles.label}>Teacher (optional)</Txt>
      <TextInput
        value={teacher}
        onChangeText={setTeacher}
        placeholder="Teacher name"
        placeholderTextColor={colors.faint}
        style={styles.input}
      />
      <Txt w="medium" style={styles.label}>Colour</Txt>
      <View style={styles.swatches}>
        {palette.map((p, i) => (
          <Pressable
            key={i}
            onPress={() => setColor(i)}
            style={[styles.swatch, { backgroundColor: p.strong }]}
            accessibilityRole="button"
            accessibilityLabel={'Colour ' + (i + 1)}
          >
            {i === color ? <Ionicons name="checkmark" size={20} color="#FFFFFF" /> : null}
          </Pressable>
        ))}
      </View>
      <View style={styles.buttons}>
        {subject ? <Button label="Delete" tone="ghost" onPress={remove} style={{ flex: 1 }} /> : null}
        <Button label="Save" onPress={save} disabled={name.trim().length === 0} style={{ flex: 1 }} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  hint: { fontSize: 14, color: colors.muted, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderLeftWidth: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  label: { fontSize: 13, color: colors.muted, marginTop: 10, marginBottom: 8 },
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
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
