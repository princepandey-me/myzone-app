import { DayRow, Phase, Timetable } from '../types';
import { DAY_NAMES, LUNCH_END, LUNCH_START, SLOTS } from './slots';

/**
 * Turns one weekday of the timetable into display rows: classes (back-to-back periods of the
 * same subject and room are merged), free periods and lunch. Trailing free time is dropped.
 * Returns null when the day has no classes at all (for example a weekend).
 */
export function buildRows(tt: Timetable, weekday: number): DayRow[] | null {
  const slots = tt.week[weekday];
  if (!slots || Object.keys(slots).length === 0) return null;

  const seq: DayRow[] = [];
  for (const s of SLOTS) {
    if (s.id === 4) seq.push({ type: 'lunch', start: LUNCH_START, end: LUNCH_END, room: '', periods: 0 });
    const p = slots[s.id];
    if (p) seq.push({ type: 'class', start: s.start, end: s.end, subjectId: p.subjectId, room: p.room, periods: 1 });
    else seq.push({ type: 'free', start: s.start, end: s.end, room: '', periods: 0 });
  }

  const rows: DayRow[] = [];
  for (const it of seq) {
    const last = rows[rows.length - 1];
    if (last && it.type === 'class' && last.type === 'class' && last.subjectId === it.subjectId && last.room === it.room) {
      last.end = it.end;
      last.periods += it.periods;
    } else if (last && it.type === 'free' && last.type === 'free') {
      last.end = it.end;
    } else {
      rows.push({ ...it });
    }
  }
  while (rows.length > 0 && rows[rows.length - 1].type !== 'class') rows.pop();
  return rows.length > 0 ? rows : null;
}

/** What is going on at `nowMin` (minutes since midnight) for a day's rows. */
export function phaseOf(rows: DayRow[], nowMin: number): Phase {
  const classes = rows.filter((r) => r.type === 'class');
  const current = classes.find((c) => nowMin >= c.start && nowMin < c.end);
  const ended = classes.filter((c) => c.end <= nowMin);
  const previous = ended.length > 0 ? ended[ended.length - 1] : undefined;
  const upcoming = classes.find((c) => c.start > nowMin);

  if (current) {
    return { type: 'class', current, previous, next: classes.find((c) => c.start >= current.end) };
  }
  if (!previous && upcoming) return { type: 'before', next: upcoming };
  if (previous && !upcoming) return { type: 'after', previous };
  if (previous && upcoming) {
    if (nowMin >= LUNCH_START && nowMin < LUNCH_END) return { type: 'lunch', previous, next: upcoming };
    return { type: upcoming.start - previous.end <= 5 ? 'break' : 'free', previous, next: upcoming };
  }
  return { type: 'none' };
}

/** First class of the next day that has classes, with a label such as "Tomorrow" or "Monday". */
export function nextClassDay(
  tt: Timetable,
  fromWeekday: number,
): { weekday: number; label: string; row: DayRow } | null {
  for (let i = 1; i <= 7; i++) {
    const d = ((fromWeekday - 1 + i) % 7) + 1;
    const rows = buildRows(tt, d);
    if (rows) {
      const first = rows.find((r) => r.type === 'class');
      if (first) return { weekday: d, label: i === 1 ? 'Tomorrow' : DAY_NAMES[d], row: first };
    }
  }
  return null;
}
