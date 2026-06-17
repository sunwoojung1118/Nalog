import { useMemo, useState } from 'react';
import { DayIndex, dayName, getDayIndex, getISOWeek } from './date';

export type CurrentDate = {
  week: number;
  today: DayIndex;
  todayName: string;
};

export function useCurrentDate(): CurrentDate {
  const [now] = useState(() => new Date());
  return useMemo(() => {
    const today = getDayIndex(now);
    return {
      week: getISOWeek(now),
      today,
      todayName: dayName(today),
    };
  }, [now]);
}
