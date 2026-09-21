export type Subject = {
  id: string;
  name: string;
  teacher: string;
  color: number; // index into the colour palette in theme.ts
};

export type Period = {
  subjectId: string;
  room: string; // '' means the normal classroom
};

export type Timetable = {
  subjects: Subject[];
  // weekday (1 = Monday ... 5 = Friday) -> slot (1..6) -> class
  week: Record<number, Record<number, Period>>;
  // weekdays whose class list is still incomplete (a note is shown for these)
  incompleteDays: number[];
};

export type AttendanceRecord = { attended: number; total: number };

export type Reminders = { enabled: boolean; leadMinutes: number };

export type AppData = {
  timetable: Timetable;
  attendance: Record<string, AttendanceRecord>;
  target: number;
  reminders: Reminders;
};

export type DayRow = {
  type: 'class' | 'free' | 'lunch';
  start: number; // minutes since midnight
  end: number;
  subjectId?: string;
  room: string;
  periods: number;
};

export type Phase =
  | { type: 'class'; current: DayRow; previous?: DayRow; next?: DayRow }
  | { type: 'before'; next: DayRow }
  | { type: 'after'; previous: DayRow }
  | { type: 'lunch' | 'free' | 'break'; previous: DayRow; next: DayRow }
  | { type: 'none' };
