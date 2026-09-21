import { Subject, Timetable } from '../types';

export function subjectOf(tt: Timetable, id?: string): Subject {
  return tt.subjects.find((s) => s.id === id) ?? { id: 'missing', name: 'Unknown subject', teacher: '', color: 0 };
}
