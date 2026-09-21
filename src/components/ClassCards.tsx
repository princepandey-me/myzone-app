import React from 'react';
import { StyleSheet, View } from 'react-native';
import { durationText, fmt12, range12 } from '../logic/timeUtils';
import { colorFor, colors } from '../theme';
import { DayRow, Subject } from '../types';
import { Txt } from './Txt';
import { ProgressBar } from './ui';

/** Small white card for the previous / next class. */
export function MiniCard({
  subject, row, note, prefix,
}: { subject: Subject; row: DayRow; note?: string; prefix?: string }) {
  const c = colorFor(subject.color);
  const detail =
    (prefix ? prefix + ' \u00B7 ' : '') + range12(row.start, row.end) + (row.room ? ' \u00B7 ' + row.room : '');
  return (
    <View style={[styles.mini, { borderLeftColor: c.strong }]}>
      <View style={{ flex: 1 }}>
        <Txt w="bold" style={styles.miniName}>{subject.name}</Txt>
        <Txt w="medium" style={styles.miniTime}>{detail}</Txt>
      </View>
      {note ? <Txt w="bold" style={[styles.miniNote, { color: c.strong }]}>{note}</Txt> : null}
    </View>
  );
}

/** Big colour card for the class that is on right now. */
export function NowCard({ subject, row, nowMin }: { subject: Subject; row: DayRow; nowMin: number }) {
  const c = colorFor(subject.color);
  const fraction = (nowMin - row.start) / (row.end - row.start);
  const left = Math.ceil(row.end - nowMin);
  const who =
    subject.teacher + (row.periods > 1 ? (subject.teacher ? ' \u00B7 ' : '') + row.periods + ' classes back to back' : '');
  return (
    <View style={[styles.now, { backgroundColor: c.strong }]}>
      <View style={styles.between}>
        <View style={styles.pill}>
          <View style={styles.dot} />
          <Txt w="semibold" style={styles.pillText}>In class</Txt>
        </View>
        {row.room ? (
          <View style={styles.pill}>
            <Txt w="semibold" style={styles.pillText}>{row.room}</Txt>
          </View>
        ) : null}
      </View>
      <Txt w="extrabold" style={styles.nowName}>{subject.name}</Txt>
      <Txt w="semibold" style={styles.nowWhen}>{range12(row.start, row.end)}</Txt>
      {who ? <Txt w="regular" style={styles.nowWho}>{who}</Txt> : null}
      <View style={{ marginTop: 18 }}>
        <ProgressBar fraction={fraction} track="rgba(255,255,255,0.28)" fill="#FFFFFF" />
      </View>
      <Txt w="semibold" style={styles.nowLeft}>{durationText(left)} left</Txt>
    </View>
  );
}

/** White card for free time, lunch, before the day starts or after it ends. */
export function GapCard({
  title, when, fraction, left, aside,
}: { title: string; when: string; fraction?: number; left?: string; aside?: string }) {
  return (
    <View style={styles.gap}>
      <Txt w="extrabold" style={styles.gapTitle}>{title}</Txt>
      <Txt w="semibold" style={styles.gapWhen}>{when}</Txt>
      {fraction !== undefined ? (
        <View style={{ marginTop: 16 }}>
          <ProgressBar fraction={fraction} track={colors.soft} fill={colors.ink} />
        </View>
      ) : null}
      {left ? <Txt w="semibold" style={styles.gapLeft}>{left}</Txt> : null}
      {aside ? <Txt w="medium" style={styles.gapAside}>{aside}</Txt> : null}
    </View>
  );
}

/** One class in the full-day list. */
export function ClassTile({
  subject, row, past, current,
}: { subject: Subject; row: DayRow; past: boolean; current: boolean }) {
  const c = colorFor(subject.color);
  const extra = row.periods > 1 ? row.periods + ' classes in a row' : '';
  const meta = [subject.teacher, extra].filter((x) => x.length > 0).join(' \u00B7 ');
  return (
    <View style={[styles.tileRow, { opacity: past ? 0.5 : 1 }]}>
      <View style={styles.timeCol}>
        <Txt w="bold" style={styles.timeStart}>{fmt12(row.start)}</Txt>
        <Txt w="medium" style={styles.timeEnd}>{fmt12(row.end)}</Txt>
      </View>
      <View
        style={[
          styles.tile,
          { backgroundColor: c.tint, borderLeftColor: c.strong },
          current ? { borderWidth: 2, borderColor: c.strong } : null,
        ]}
      >
        <Txt w="bold" style={styles.tileName}>{subject.name}</Txt>
        {meta ? <Txt w="medium" style={styles.tileMeta}>{meta}</Txt> : null}
        {row.room ? (
          <View style={[styles.roomPill, { backgroundColor: c.strong }]}>
            <Txt w="semibold" style={styles.roomText}>{row.room}</Txt>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Free period or lunch break in the full-day list. */
export function GapTile({ row, past, current }: { row: DayRow; past: boolean; current: boolean }) {
  const lunch = row.type === 'lunch';
  return (
    <View style={[styles.tileRow, { opacity: past ? 0.5 : 1 }]}>
      <View style={styles.timeCol} />
      <View
        style={[
          styles.tile,
          lunch ? styles.lunchTile : styles.freeTile,
          current ? { borderWidth: 2, borderColor: colors.muted } : null,
        ]}
      >
        <Txt w="semibold" style={[styles.gapTileName, { color: lunch ? colors.muted : colors.faint }]}>
          {lunch ? 'Lunch break' : 'Free period'}
        </Txt>
        <Txt w="medium" style={styles.gapTileTime}>{range12(row.start, row.end)}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderLeftWidth: 6,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  miniName: { fontSize: 18, lineHeight: 22 },
  miniTime: { fontSize: 13, color: colors.muted, marginTop: 2 },
  miniNote: { fontSize: 13, marginLeft: 10 },

  now: { borderRadius: 26, padding: 20, paddingBottom: 18 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', marginRight: 8 },
  pillText: { color: '#FFFFFF', fontSize: 13 },
  nowName: { color: '#FFFFFF', fontSize: 38, lineHeight: 42, letterSpacing: -0.8, marginTop: 18 },
  nowWhen: { color: '#FFFFFF', fontSize: 17, marginTop: 6 },
  nowWho: { color: 'rgba(255,255,255,0.88)', fontSize: 14, marginTop: 2 },
  nowLeft: { color: '#FFFFFF', fontSize: 14, marginTop: 8 },

  gap: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 26,
    padding: 20,
  },
  gapTitle: { fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  gapWhen: { fontSize: 16, color: colors.muted, marginTop: 4 },
  gapLeft: { fontSize: 14, marginTop: 8 },
  gapAside: { fontSize: 13, color: colors.faint, marginTop: 10 },

  tileRow: { flexDirection: 'row', marginBottom: 8 },
  timeCol: { width: 74, paddingTop: 12 },
  timeStart: { fontSize: 14 },
  timeEnd: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
  tile: { flex: 1, borderRadius: 14, borderLeftWidth: 6, paddingVertical: 11, paddingHorizontal: 14, minHeight: 58 },
  tileName: { fontSize: 18, lineHeight: 22 },
  tileMeta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  roomPill: { alignSelf: 'flex-start', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 9, marginTop: 6 },
  roomText: { color: '#FFFFFF', fontSize: 12 },
  freeTile: { borderLeftWidth: 1.5, borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed' },
  lunchTile: { backgroundColor: colors.soft, borderLeftWidth: 0 },
  gapTileName: { fontSize: 15 },
  gapTileTime: { fontSize: 13, color: colors.faint, marginTop: 2 },
});
