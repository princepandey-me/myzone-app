import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { CITY, fetchWeather, Weather } from '../services/weather';

const TEN_MINUTES = 10 * 60 * 1000;
let cached: { at: number; value: Weather } | null = null;

export function useWeather(): { weather: Weather | null; city: string } {
  const [weather, setWeather] = useState<Weather | null>(cached ? cached.value : null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (cached && Date.now() - cached.at < TEN_MINUTES) {
        if (alive) setWeather(cached.value);
        return;
      }
      const w = await fetchWeather();
      if (w) {
        cached = { at: Date.now(), value: w };
        if (alive) setWeather(w);
      }
    };
    load();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') load();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return { weather, city: CITY };
}
