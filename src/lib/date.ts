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

function isoWeekTarget(d: Date): Date {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  return target;
}

// ISO 8601 week-of-year: weeks start on Monday; week 1 contains the year's first Thursday.
export function getISOWeek(d: Date = new Date()): number {
  const target = isoWeekTarget(d);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ISO 8601 week-numbering year — may differ from the calendar year for late-Dec / early-Jan.
export function getISOWeekYear(d: Date = new Date()): number {
  return isoWeekTarget(d).getUTCFullYear();
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

// Editorial label: "<week>.<dayOfWeek>" — e.g. week 26 Monday → "26.1"
export function dayLabel(week: number, day: DayIndex): string {
  return `${week}.${day}`;
}

// ISO 8601: a long year has 53 weeks. Determined by whether Jan 1 or Dec 31
// falls on a Thursday (or for leap years, Dec 31 on Wednesday also qualifies).
export function isoWeeksInYear(year: number): 52 | 53 {
  const jan1Dow = new Date(Date.UTC(year, 0, 1)).getUTCDay();
  const dec31Dow = new Date(Date.UTC(year, 11, 31)).getUTCDay();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (jan1Dow === 4 || dec31Dow === 4 || (isLeap && dec31Dow === 3)) return 53;
  return 52;
}
