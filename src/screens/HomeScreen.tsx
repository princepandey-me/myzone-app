import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GapCard, MiniCard, NowCard } from '../components/ClassCards';
import { DayRibbon } from '../components/DayRibbon';
import { Txt } from '../components/Txt';
import { SectionLabel } from '../components/ui';
import { useNow } from '../hooks/useNow';
import { useWeather } from '../hooks/useWeather';
import { percent, statusOf } from '../logic/attendanceMath';
import { buildRows, nextClassDay, phaseOf } from '../logic/dayBuilder';
import { DAY_NAMES, LUNCH_END, LUNCH_START } from '../logic/slots';
import { subjectOf } from '../logic/subjects';
import { dateText, durationText, fmt12, hm12, meridiem, minutesOf, range12, weekdayOf } from '../logic/timeUtils';
import { describeWeather } from '../services/weather';
import { useApp } from '../state/AppContext';
import { colors } from '../theme';
import { AppData, DayRow, Subject, Timetable } from '../types';

export function HomeScreen() {
  const { data } = useApp();
  const now = useNow();
  const { weather, city } = useWeather();
  const tt = data.timetable;
  const weekday = weekdayOf(now);
  const nowMin = minutesOf(now);
  const rows = buildRows(tt, weekday);
  const partial = tt.incompleteDays.includes(weekday);
  const wx = weather ? describeWeather(weather.code) : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.metaRow}>
        <Txt w="medium" style={styles.date}>{dateText(now)}</Txt>
        <Txt w="bold" style={styles.clock}>
          {hm12(nowMin)}
          <Txt w="semibold" style={styles.ampm}> {meridiem(nowMin)}</Txt>
        </Txt>
      </View>
      <View style={styles.dayRow}>
        <Txt w="extrabold" style={styles.day}>{DAY_NAMES[weekday]}</Txt>
      </View>
      {weather && wx ? (
        <View style={styles.weatherRow}>
          <Ionicons name={wx.icon} size={18} color={colors.muted} />
          <Txt w="medium" style={styles.weatherText}>
            {city} {'\u00B7'} {Math.round(weather.temperature)}{'\u00B0'}C {'\u00B7'} {wx.label}
          </Txt>
        </View>
      ) : null}

      {rows ? (
        <View style={{ marginTop: 16 }}>
          <DayRibbon rows={rows} tt={tt} nowMin={nowMin} />
        </View>
      ) : null}

      <View style={{ marginTop: 8 }}>
        <Live tt={tt} weekday={weekday} rows={rows} nowMin={nowMin} partial={partial} />
      </View>

      <LowAttendance data={data} />
    </ScrollView>
  );
}

function endedText(row: DayRow, nowMin: number): string {
  const ago = Math.floor(nowMin - row.end);
  return ago < 1 ? 'Just ended' : 'Ended ' + durationText(ago) + ' ago';
}

function Live({
  tt, weekday, rows, nowMin, partial,
}: { tt: Timetable; weekday: number; rows: DayRow[] | null; nowMin: number; partial: boolean }) {
  const tomorrow = nextClassDay(tt, weekday);
  const tomorrowCard = tomorrow ? (
    <>
      <SectionLabel>Up next</SectionLabel>
      <MiniCard subject={subjectOf(tt, tomorrow.row.subjectId)} row={tomorrow.row} prefix={tomorrow.label} />
    </>
  ) : null;

  if (!rows) {
    return (
      <>
        <SectionLabel>Now</SectionLabel>
        <GapCard title="No classes today" when="Enjoy your day off" />
        {tomorrowCard}
      </>
    );
  }

  const ph = phaseOf(rows, nowMin);
  const sub = (row: DayRow): Subject => subjectOf(tt, row.subjectId);

  switch (ph.type) {
    case 'class':
      return (
        <>
          {ph.previous ? (
            <>
              <SectionLabel>Previous</SectionLabel>
              <MiniCard subject={sub(ph.previous)} row={ph.previous} note={endedText(ph.previous, nowMin)} />
            </>
          ) : null}
          <SectionLabel>Now</SectionLabel>
          <NowCard subject={sub(ph.current)} row={ph.current} nowMin={nowMin} />
          {ph.next ? (
            <>
              <SectionLabel>Up next</SectionLabel>
              <MiniCard subject={sub(ph.next)} row={ph.next} note={'in ' + durationText(ph.next.start - nowMin)} />
            </>
          ) : (
            tomorrowCard
          )}
        </>
      );
    case 'before':
      return (
        <>
          <SectionLabel>Now</SectionLabel>
          <GapCard
            title="No class yet"
            when={'First class at ' + fmt12(ph.next.start)}
            left={'in ' + durationText(ph.next.start - nowMin)}
          />
          <SectionLabel>Up next</SectionLabel>
          <MiniCard subject={sub(ph.next)} row={ph.next} />
        </>
      );
    case 'after':
      return (
        <>
          <SectionLabel>Previous</SectionLabel>
          <MiniCard subject={sub(ph.previous)} row={ph.previous} note={'Ended ' + fmt12(ph.previous.end)} />
          <SectionLabel>Now</SectionLabel>
          <GapCard
            title={partial ? 'No more classes listed' : 'Done for today'}
            when={'Last class ended at ' + fmt12(ph.previous.end)}
            aside={partial ? 'Later classes may be missing. You can add them in Timetable.' : undefined}
          />
          {tomorrowCard}
        </>
      );
    case 'lunch':
    case 'free':
    case 'break': {
      const lunch = ph.type === 'lunch';
      const from = lunch ? LUNCH_START : ph.previous.end;
      const to = lunch ? LUNCH_END : ph.next.start;
      return (
        <>
          <SectionLabel>Previous</SectionLabel>
          <MiniCard subject={sub(ph.previous)} row={ph.previous} note={endedText(ph.previous, nowMin)} />
          <SectionLabel>Now</SectionLabel>
          <GapCard
            title={lunch ? 'Lunch break' : ph.type === 'break' ? 'Short break' : 'Free period'}
            when={lunch ? range12(LUNCH_START, LUNCH_END) : 'Until ' + fmt12(ph.next.start)}
            fraction={(nowMin - from) / (to - from)}
            left={durationText(to - nowMin) + ' left'}
          />
          <SectionLabel>Up next</SectionLabel>
          <MiniCard subject={sub(ph.next)} row={ph.next} note={'in ' + durationText(ph.next.start - nowMin)} />
        </>
      );
    }
    default:
      return null;
  }
}

function LowAttendance({ data }: { data: AppData }) {
  let worst: { subject: Subject; p: number; attended: number; total: number } | null = null;
  for (const s of data.timetable.subjects) {
    const r = data.attendance[s.id];
    if (!r || r.total === 0) continue;
    const p = percent(r.attended, r.total);
    if (p < data.target && (worst === null || p < worst.p)) {
      worst = { subject: s, p, attended: r.attended, total: r.total };
    }
  }
  if (worst === null) return null;
  const status = statusOf(worst.attended, worst.total, data.target);
  return (
    <>
      <SectionLabel>Attendance alert</SectionLabel>
      <View style={styles.alert}>
        <Ionicons name="alert-circle-outline" size={22} color={colors.bad} style={{ marginTop: 1 }} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Txt w="bold" style={{ fontSize: 16 }}>
            {worst.subject.name} is at {Math.round(worst.p)}%
          </Txt>
          <Txt w="medium" style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{status.text}</Txt>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  date: { fontSize: 15, color: colors.muted },
  clock: { fontSize: 22, letterSpacing: -0.2 },
  ampm: { fontSize: 13, color: colors.muted },
  dayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  day: { fontSize: 46, lineHeight: 52, letterSpacing: -1 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  weatherText: { fontSize: 14, color: colors.muted },
  alert: {
    flexDirection: 'row',
    backgroundColor: '#FBE4E2',
    borderRadius: 16,
    padding: 14,
  },
});
