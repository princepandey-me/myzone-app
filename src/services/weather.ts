import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type Weather = { temperature: number; code: number };

// Open-Meteo is a free weather API and needs no key. Change these to show another city.
export const CITY = 'Ranchi';
const LATITUDE = 23.3441;
const LONGITUDE = 85.3096;

export async function fetchWeather(): Promise<Weather | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=' + LATITUDE +
      '&longitude=' + LONGITUDE +
      '&current=temperature_2m,weather_code&timezone=auto';
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
    const temperature = json.current?.temperature_2m;
    const code = json.current?.weather_code;
    if (typeof temperature !== 'number' || typeof code !== 'number') return null;
    return { temperature, code };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// WMO weather codes used by Open-Meteo
export function describeWeather(code: number): { label: string; icon: IconName } {
  if (code === 0) return { label: 'Clear sky', icon: 'sunny-outline' };
  if (code <= 2) return { label: 'Partly cloudy', icon: 'partly-sunny-outline' };
  if (code === 3) return { label: 'Cloudy', icon: 'cloud-outline' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'cloud-outline' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rainy-outline' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'rainy-outline' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'snow-outline' };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: 'rainy-outline' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'thunderstorm-outline' };
  return { label: 'Cloudy', icon: 'cloud-outline' };
}
