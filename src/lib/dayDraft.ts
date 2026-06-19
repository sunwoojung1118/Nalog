import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayIndex, storageKey } from './date';

async function readDayField(week: number, day: DayIndex, field: 'body' | 'subtitle'): Promise<string> {
  return (await AsyncStorage.getItem(storageKey(week, day, field))) ?? '';
}

async function saveDayField(week: number, day: DayIndex, field: 'body' | 'subtitle', value: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(week, day, field), value);
}

export const readDayBody = (week: number, day: DayIndex) => readDayField(week, day, 'body');
export const saveDayBody = (week: number, day: DayIndex, body: string) => saveDayField(week, day, 'body', body);
export const readDaySubtitle = (week: number, day: DayIndex) => readDayField(week, day, 'subtitle');
export const saveDaySubtitle = (week: number, day: DayIndex, subtitle: string) => saveDayField(week, day, 'subtitle', subtitle);

export async function readAllDayBodies(week: number): Promise<Record<DayIndex, string>> {
  const days: DayIndex[] = [1, 2, 3, 4, 5, 6, 7];
  const entries = await Promise.all(
    days.map(async (d) => [d, await readDayBody(week, d)] as [DayIndex, string]),
  );
  return Object.fromEntries(entries) as Record<DayIndex, string>;
}
