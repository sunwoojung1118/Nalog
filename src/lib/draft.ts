import AsyncStorage from '@react-native-async-storage/async-storage';

export type Draft = { title: string; body: string };

function titleKey(year: number, week: number) {
  return `draft_${year}_${week}_title`;
}
function bodyKey(year: number, week: number) {
  return `draft_${year}_${week}_body`;
}

export async function readDraft(year: number, week: number): Promise<Draft> {
  const [title, body] = await AsyncStorage.multiGet([titleKey(year, week), bodyKey(year, week)]);
  return {
    title: title[1] ?? '',
    body: body[1] ?? '',
  };
}

export async function saveDraft(year: number, week: number, title: string, body: string): Promise<void> {
  await AsyncStorage.multiSet([
    [titleKey(year, week), title],
    [bodyKey(year, week), body],
  ]);
}
