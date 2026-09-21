export type AttendanceLevel = 'none' | 'good' | 'warn' | 'bad';

export function percent(attended: number, total: number): number {
  return total === 0 ? 0 : (attended * 100) / total;
}

/** How many more classes can be missed and still stay at or above the target. */
export function canMiss(attended: number, total: number, target: number): number {
  return Math.max(0, Math.floor((attended * 100) / target) - total);
}

/** How many classes in a row must be attended to climb back to the target. */
export function needToAttend(attended: number, total: number, target: number): number {
  const top = target * total - 100 * attended;
  if (top <= 0) return 0;
  const bottom = 100 - target;
  if (bottom <= 0) return 0;
  return Math.ceil(top / bottom);
}

export function statusOf(attended: number, total: number, target: number): { level: AttendanceLevel; text: string } {
  if (total === 0) return { level: 'none', text: 'Mark your first class to start tracking.' };
  const p = percent(attended, total);
  if (p >= target) {
    const m = canMiss(attended, total, target);
    if (m <= 0) return { level: 'warn', text: `Right on the line. Missing the next class drops you below ${target}%.` };
    const plural = m === 1 ? 'class' : 'classes';
    return { level: 'good', text: `You can miss ${m} more ${plural} and stay above ${target}%.` };
  }
  const need = needToAttend(attended, total, target);
  const plural = need === 1 ? 'class' : 'classes';
  return {
    level: p >= target - 5 ? 'warn' : 'bad',
    text: `Attend the next ${need} ${plural} in a row to reach ${target}%.`,
  };
}
