import { Platform } from 'react-native';
import { buildRows } from '../logic/dayBuilder';
import { fmt12 } from '../logic/timeUtils';
import { Reminders, Timetable } from '../types';

export type ReminderResult = { ok: boolean; count: number; message?: string };

const CHANNEL = 'class-reminders';

/**
 * Cancels every scheduled reminder and, when reminders are on, schedules one weekly
 * notification per class, `leadMinutes` before it starts.
 * expo-notifications is loaded only when needed so the app starts fast and Expo Go stays quiet.
 */
export async function applyReminders(tt: Timetable, r: Reminders): Promise<ReminderResult> {
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!r.enabled) return { ok: true, count: 0 };

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Class reminders',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    let perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) {
      return { ok: false, count: 0, message: 'Notification permission was not granted. You can allow it in your phone settings.' };
    }

    let count = 0;
    for (const weekday of [1, 2, 3, 4, 5]) {
      const rows = buildRows(tt, weekday);
      if (!rows) continue;
      for (const row of rows) {
        if (row.type !== 'class') continue;
        const at = row.start - r.leadMinutes;
        if (at < 0) continue;
        const subject = tt.subjects.find((s) => s.id === row.subjectId);
        if (!subject) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: subject.name,
            body: 'Starts at ' + fmt12(row.start) + (row.room ? ' \u00B7 ' + row.room : ''),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: (weekday % 7) + 1, // Expo counts Sunday as 1
            hour: Math.floor(at / 60),
            minute: at % 60,
            channelId: CHANNEL,
          },
        });
        count++;
      }
    }
    return { ok: true, count };
  } catch (e) {
    return { ok: false, count: 0, message: e instanceof Error ? e.message : 'Could not schedule reminders.' };
  }
}
