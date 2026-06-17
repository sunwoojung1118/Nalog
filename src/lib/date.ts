export type DayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const DAY_NAMES: Record<DayIndex, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

// ISO 8601 week-of-year: weeks start on Monday; week 1 contains the year's first Thursday.
export function getISOWeek(d: Date = new Date()): number {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Monday = 1 ... Sunday = 7
export function getDayIndex(d: Date = new Date()): DayIndex {
  const js = d.getDay(); // Sun=0..Sat=6
  return (js === 0 ? 7 : js) as DayIndex;
}

export function dayName(idx: DayIndex): string {
  return DAY_NAMES[idx];
}

export function storageKey(week: number, day: DayIndex, field: 'body' | 'subtitle'): string {
  return `nalog_w${week}_d${day}_${field}`;
}

export function weekTitleKey(week: number): string {
  return `nalog_w${week}_title`;
}
