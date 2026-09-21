export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function meridiem(m: number): 'AM' | 'PM' {
  return Math.floor(m / 60) >= 12 ? 'PM' : 'AM';
}

// 9:15 (no AM/PM)
export function hm12(m: number): string {
  const total = Math.floor(m);
  const h24 = Math.floor(total / 60);
  const mi = total % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${mi < 10 ? '0' : ''}${mi}`;
}

// 9:15 AM
export function fmt12(m: number): string {
  return `${hm12(m)} ${meridiem(m)}`;
}

// 9:15 - 10:05 AM  or  11:05 AM - 12:55 PM
export function range12(a: number, b: number): string {
  return meridiem(a) === meridiem(b) ? `${hm12(a)} \u2013 ${fmt12(b)}` : `${fmt12(a)} \u2013 ${fmt12(b)}`;
}

// 35 min, 1 h 5 min
export function durationText(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h} h ${r} min` : `${h} h`;
}

export function dateText(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Monday = 1 ... Sunday = 7
export function weekdayOf(d: Date): number {
  const g = d.getDay();
  return g === 0 ? 7 : g;
}

export function minutesOf(d: Date): number {
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}
