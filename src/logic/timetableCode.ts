import { Timetable } from '../types';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const PREFIX = 'TT1:';

function toBytes(s: string): number[] {
  const out: number[] = [];
  const enc = encodeURIComponent(s);
  for (let i = 0; i < enc.length; i++) {
    if (enc[i] === '%') {
      out.push(parseInt(enc.substr(i + 1, 2), 16));
      i += 2;
    } else {
      out.push(enc.charCodeAt(i));
    }
  }
  return out;
}

function fromBytes(bytes: number[]): string {
  let s = '';
  for (const b of bytes) s += '%' + (b < 16 ? '0' : '') + b.toString(16);
  return decodeURIComponent(s);
}

function b64Encode(bytes: number[]): string {
  let out = '';
  let buf = 0;
  let bits = 0;
  for (const b of bytes) {
    buf = (buf << 8) | b;
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      out += ALPHABET[(buf >> bits) & 63];
      buf &= (1 << bits) - 1;
    }
  }
  if (bits > 0) out += ALPHABET[(buf << (6 - bits)) & 63];
  return out;
}

function b64Decode(str: string): number[] {
  const out: number[] = [];
  let buf = 0;
  let bits = 0;
  for (const ch of str) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) throw new Error('bad character');
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buf >> bits) & 255);
      buf &= (1 << bits) - 1;
    }
  }
  return out;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Checks unknown data and returns a clean Timetable, or a message describing the problem. */
export function parseTimetable(raw: unknown): Timetable | string {
  if (!isObject(raw)) return 'The timetable data is not in the expected format.';
  const rawSubjects = raw.subjects;
  const rawWeek = raw.week;
  if (!Array.isArray(rawSubjects) || rawSubjects.length === 0) return 'The code has no subjects.';
  if (!isObject(rawWeek)) return 'The code has no week.';

  const subjects: Timetable['subjects'] = [];
  const ids = new Set<string>();
  for (const s of rawSubjects) {
    if (!isObject(s) || typeof s.id !== 'string' || typeof s.name !== 'string') return 'A subject in the code is invalid.';
    subjects.push({
      id: s.id,
      name: s.name,
      teacher: typeof s.teacher === 'string' ? s.teacher : '',
      color: typeof s.color === 'number' ? s.color : 0,
    });
    ids.add(s.id);
  }

  const week: Timetable['week'] = {};
  for (const dayKey of Object.keys(rawWeek)) {
    const day = Number(dayKey);
    const slots = rawWeek[dayKey];
    if (!Number.isInteger(day) || day < 1 || day > 5 || !isObject(slots)) return 'The code has an unknown weekday.';
    week[day] = {};
    for (const slotKey of Object.keys(slots)) {
      const slot = Number(slotKey);
      const p = slots[slotKey];
      if (!Number.isInteger(slot) || slot < 1 || slot > 6 || !isObject(p)) return 'The code has an unknown time slot.';
      if (typeof p.subjectId !== 'string' || !ids.has(p.subjectId)) return 'A class uses a subject that is missing.';
      week[day][slot] = { subjectId: p.subjectId, room: typeof p.room === 'string' ? p.room : '' };
    }
  }

  const incompleteDays = Array.isArray(raw.incompleteDays)
    ? raw.incompleteDays.filter((d): d is number => typeof d === 'number')
    : [];
  return { subjects, week, incompleteDays };
}

export function encodeTimetable(tt: Timetable): string {
  return PREFIX + b64Encode(toBytes(JSON.stringify(tt)));
}

export function decodeTimetable(code: string): { timetable: Timetable } | { error: string } {
  const clean = code.replace(/\s+/g, '');
  if (!clean.startsWith(PREFIX)) return { error: 'That does not look like a timetable code.' };
  try {
    const json = JSON.parse(fromBytes(b64Decode(clean.slice(PREFIX.length)))) as unknown;
    const parsed = parseTimetable(json);
    if (typeof parsed === 'string') return { error: parsed };
    return { timetable: parsed };
  } catch {
    return { error: 'Could not read this code. Copy it again and retry.' };
  }
}
