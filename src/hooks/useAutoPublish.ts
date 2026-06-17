import { useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getISOWeek } from '@/lib/date';
import {
  PUBLISH_MODE_KEY,
  profileInitials,
  publishWeek,
} from '@/social/data/social-store';

const LAST_WEEK_KEY = 'nalog_auto_pub_last_week';

async function maybeAutoPublish(): Promise<void> {
  const mode = await AsyncStorage.getItem(PUBLISH_MODE_KEY);
  if (mode === 'manual') return;

  const currentWeek = getISOWeek();
  const targetWeek = currentWeek - 1;
  if (targetWeek < 1) return;

  const lastRaw = await AsyncStorage.getItem(LAST_WEEK_KEY);
  const last = lastRaw ? parseInt(lastRaw, 10) : 0;
  if (last >= targetWeek) return;

  const storedName = (await AsyncStorage.getItem('nalog_profile_name')) ?? '';
  const name = storedName.trim() || 'You';
  const author = { id: 'me', name, initials: profileInitials(name) };

  const result = await publishWeek(targetWeek, author);
  if (result) {
    await AsyncStorage.setItem(LAST_WEEK_KEY, String(targetWeek));
  }
}

export function useAutoPublish(): void {
  useEffect(() => {
    maybeAutoPublish().catch(() => {});
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') maybeAutoPublish().catch(() => {});
    });
    return () => sub.remove();
  }, []);
}
