import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const minuteOf = (d: Date) => Math.floor(d.getTime() / 60000);

/** Returns the current time and re-renders the screen whenever the minute changes. */
export function useNow(): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let last = minuteOf(new Date());
    const timer = setInterval(() => {
      const d = new Date();
      const m = minuteOf(d);
      if (m !== last) {
        last = m;
        setNow(d);
      }
    }, 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const d = new Date();
        last = minuteOf(d);
        setNow(d);
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);

  return now;
}
