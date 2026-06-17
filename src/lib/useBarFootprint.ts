import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BAR_HEIGHT = 56;

// Combined visual footprint of the lowered sheet bar (content + safe-area inset).
export function useBarFootprint(): number {
  const insets = useSafeAreaInsets();
  return BAR_HEIGHT + insets.bottom;
}
