const DAY_NAMES_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function ordinal(n: number): string {
  const last = n % 10;
  const teen = n % 100;
  if (teen >= 11 && teen <= 13) return `${n}th`;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function clock12(d: Date): string {
  const h24 = d.getHours();
  const m = d.getMinutes();
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${pad2(m)} ${period}`;
}

// "June 16th Tuesday 2026 4:30 PM" — used at the top of the writer surface.
export function formatWriterHeader(d: Date): string {
  const month = MONTH_NAMES_LONG[d.getMonth()];
  const day = ordinal(d.getDate());
  const weekday = DAY_NAMES_LONG[d.getDay()];
  const year = d.getFullYear();
  return `${month} ${day} ${weekday} ${year} ${clock12(d)}`;
}

// "Tuesday, June 16" — used on the collapsed sheet bar.
export function formatBarDate(d: Date): string {
  const weekday = DAY_NAMES_LONG[d.getDay()];
  const month = MONTH_NAMES_LONG[d.getMonth()];
  return `${weekday}, ${month} ${d.getDate()}`;
}

// "Feb. 24th" — used in tile captions.
export function formatTileDate(d: Date): string {
  const month = MONTH_NAMES_LONG[d.getMonth()].slice(0, 3);
  return `${month}. ${ordinal(d.getDate())}`;
}

// "13 hours ago" / "2 days ago" / "just now" — used in profile mini-header.
export function formatRelative(from: Date, to: Date = new Date()): string {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk} week${wk === 1 ? '' : 's'} ago`;
  return formatTileDate(from);
}
