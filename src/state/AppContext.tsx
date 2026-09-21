import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultTimetable } from '../data/defaultTimetable';
import { decodeTimetable, parseTimetable } from '../logic/timetableCode';
import { applyReminders } from '../services/reminders';
import { AppData, AttendanceRecord, Period, Reminders, Subject, Timetable } from '../types';

const STORAGE_KEY = 'mytimetable:v1';

export type Toast = { id: number; message: string; actionLabel?: string; onAction?: () => void };

type Ctx = {
  ready: boolean;
  data: AppData;
  toast: Toast | null;
  notify: (message: string, actionLabel?: string, onAction?: () => void) => void;
  dismissToast: () => void;
  setPeriod: (weekday: number, slot: number, period: Period | null) => void;
  setDayComplete: (weekday: number, complete: boolean) => void;
  upsertSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  mark: (subjectId: string, present: boolean) => void;
  undoMark: (subjectId: string, present: boolean) => void;
  setAttendance: (subjectId: string, attended: number, total: number) => void;
  setTarget: (target: number) => void;
  setReminders: (next: Reminders) => Promise<string | null>;
  importCode: (code: string) => string | null;
  resetTimetable: () => void;
};

function initialData(): AppData {
  return {
    timetable: defaultTimetable(),
    attendance: {},
    target: 75,
    reminders: { enabled: false, leadMinutes: 10 },
  };
}

async function loadData(): Promise<AppData> {
  const base = initialData();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as {
      timetable?: unknown;
      attendance?: Record<string, AttendanceRecord>;
      target?: number;
      reminders?: Reminders;
    };
    const tt = parseTimetable(saved.timetable);
    const rem = saved.reminders;
    return {
      timetable: typeof tt === 'string' ? base.timetable : tt,
      attendance: saved.attendance && typeof saved.attendance === 'object' ? saved.attendance : {},
      target: typeof saved.target === 'number' ? saved.target : base.target,
      reminders:
        rem && typeof rem.enabled === 'boolean' && typeof rem.leadMinutes === 'number' ? rem : base.reminders,
    };
  } catch {
    return base;
  }
}

function cloneWeek(week: Timetable['week']): Timetable['week'] {
  const out: Timetable['week'] = {};
  for (const key of Object.keys(week)) out[Number(key)] = { ...week[Number(key)] };
  return out;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const dataRef = useRef<AppData>(data);
  dataRef.current = data;
  const toastId = useRef(0);

  // load saved data once
  useEffect(() => {
    let alive = true;
    loadData().then((d) => {
      if (!alive) return;
      setData(d);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // save on every change
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  // keep reminders in step with the timetable
  useEffect(() => {
    if (!ready || !data.reminders.enabled) return;
    const id = setTimeout(() => {
      applyReminders(data.timetable, data.reminders).catch(() => {});
    }, 800);
    return () => clearTimeout(id);
  }, [ready, data.timetable, data.reminders]);

  // toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), toast.actionLabel ? 5000 : 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const notify = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    toastId.current += 1;
    setToast({ id: toastId.current, message, actionLabel, onAction });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  const setPeriod = useCallback((weekday: number, slot: number, period: Period | null) => {
    setData((prev) => {
      const week = cloneWeek(prev.timetable.week);
      const day = week[weekday] ?? {};
      if (period) day[slot] = period;
      else delete day[slot];
      week[weekday] = day;
      return { ...prev, timetable: { ...prev.timetable, week } };
    });
  }, []);

  const setDayComplete = useCallback((weekday: number, complete: boolean) => {
    setData((prev) => {
      const others = prev.timetable.incompleteDays.filter((d) => d !== weekday);
      const incompleteDays = complete ? others : [...others, weekday];
      return { ...prev, timetable: { ...prev.timetable, incompleteDays } };
    });
  }, []);

  const upsertSubject = useCallback((subject: Subject) => {
    setData((prev) => {
      const exists = prev.timetable.subjects.some((s) => s.id === subject.id);
      const subjects = exists
        ? prev.timetable.subjects.map((s) => (s.id === subject.id ? subject : s))
        : [...prev.timetable.subjects, subject];
      return { ...prev, timetable: { ...prev.timetable, subjects } };
    });
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setData((prev) => {
      const week = cloneWeek(prev.timetable.week);
      for (const day of Object.keys(week)) {
        const slots = week[Number(day)];
        for (const slot of Object.keys(slots)) {
          if (slots[Number(slot)].subjectId === id) delete slots[Number(slot)];
        }
      }
      const attendance = { ...prev.attendance };
      delete attendance[id];
      return {
        ...prev,
        attendance,
        timetable: { ...prev.timetable, week, subjects: prev.timetable.subjects.filter((s) => s.id !== id) },
      };
    });
  }, []);

  const mark = useCallback((subjectId: string, present: boolean) => {
    setData((prev) => {
      const r = prev.attendance[subjectId] ?? { attended: 0, total: 0 };
      const next = { attended: r.attended + (present ? 1 : 0), total: r.total + 1 };
      return { ...prev, attendance: { ...prev.attendance, [subjectId]: next } };
    });
  }, []);

  const undoMark = useCallback((subjectId: string, present: boolean) => {
    setData((prev) => {
      const r = prev.attendance[subjectId] ?? { attended: 0, total: 0 };
      const next = {
        attended: Math.max(0, r.attended - (present ? 1 : 0)),
        total: Math.max(0, r.total - 1),
      };
      return { ...prev, attendance: { ...prev.attendance, [subjectId]: next } };
    });
  }, []);

  const setAttendance = useCallback((subjectId: string, attended: number, total: number) => {
    setData((prev) => ({ ...prev, attendance: { ...prev.attendance, [subjectId]: { attended, total } } }));
  }, []);

  const setTarget = useCallback((target: number) => {
    setData((prev) => ({ ...prev, target }));
  }, []);

  const setReminders = useCallback(async (next: Reminders): Promise<string | null> => {
    if (next.enabled || dataRef.current.reminders.enabled) {
      const result = await applyReminders(dataRef.current.timetable, next);
      if (next.enabled && !result.ok) return result.message ?? 'Could not schedule reminders.';
    }
    setData((prev) => ({ ...prev, reminders: next }));
    return null;
  }, []);

  const importCode = useCallback((code: string): string | null => {
    const result = decodeTimetable(code);
    if ('error' in result) return result.error;
    setData((prev) => ({ ...prev, timetable: result.timetable }));
    return null;
  }, []);

  const resetTimetable = useCallback(() => {
    setData((prev) => ({ ...prev, timetable: defaultTimetable() }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ready, data, toast, notify, dismissToast, setPeriod, setDayComplete, upsertSubject, deleteSubject,
      mark, undoMark, setAttendance, setTarget, setReminders, importCode, resetTimetable,
    }),
    [ready, data, toast, notify, dismissToast, setPeriod, setDayComplete, upsertSubject, deleteSubject,
      mark, undoMark, setAttendance, setTarget, setReminders, importCode, resetTimetable],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
