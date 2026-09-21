import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DAY_END, DAY_START } from '../logic/slots';
import { fmt12 } from '../logic/timeUtils';
import { colorFor, colors } from '../theme';
import { DayRow, Timetable } from '../types';
import { Txt } from './Txt';

/** A strip showing the shape of the day, with a marker at the current time when `nowMin` is given. */
export function DayRibbon({ rows, tt, nowMin }: { rows: DayRow[]; tt: Timetable; nowMin: number | null }) {
  const pct = (m: number) => ((m - DAY_START) / (DAY_END - DAY_START)) * 100;
  const showMarker = nowMin !== null && nowMin >= DAY_START && nowMin <= DAY_END;
  return (
    <View>
      <View style={styles.holder}>
        <View style={styles.track}>
          {rows
            .filter((r) => r.type !== 'free')
            .map((r, i) => {
              const subject = tt.subjects.find((s) => s.id === r.subjectId);
              const color = r.type === 'lunch' ? colors.line : colorFor(subject ? subject.color : 0).strong;
              return (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${pct(r.start)}%`,
                    width: `${pct(r.end) - pct(r.start)}%`,
                    backgroundColor: color,
                    borderRightWidth: 2,
                    borderRightColor: colors.soft,
                  }}
                />
              );
            })}
        </View>
        {showMarker && nowMin !== null ? (
          <View style={[styles.marker, { left: `${pct(nowMin)}%` }]} />
        ) : null}
      </View>
      <View style={styles.labels}>
        <Txt w="medium" style={styles.label}>{fmt12(DAY_START)}</Txt>
        <Txt w="medium" style={styles.label}>{fmt12(DAY_END)}</Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  holder: { height: 22, justifyContent: 'center' },
  track: { height: 12, borderRadius: 6, backgroundColor: colors.soft, overflow: 'hidden' },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 8,
    marginLeft: -4,
    borderRadius: 4,
    backgroundColor: colors.ink,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { fontSize: 11, color: colors.faint },
});
