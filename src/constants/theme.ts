import { Platform, ViewStyle } from 'react-native';

export const colors = {
  paper: '#FDFBF7',
  paperWarm: '#FAF4E8',
  paperDeep: '#F4EFE5',
  ink: '#2C2C2C',
  inkSoft: '#6B6258',
  inkFaint: '#A8A096',
  amber: '#D4AF37',
  amberSoft: '#E8CB6A',
  divider: 'rgba(44, 44, 44, 0.08)',
  handle: 'rgba(44, 44, 44, 0.18)',
  community: '#EFE9DC',
};

export const fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, "Times New Roman", serif',
  }) as string,
  serifItalic: Platform.select({
    ios: 'Georgia-Italic',
    android: 'serif',
    default: 'Georgia, serif',
  }) as string,
};

export const radius = {
  sheet: 28,
  pill: 999,
  tile: 24,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadows: Record<'tile', ViewStyle> = {
  tile: {
    shadowColor: '#7A5A2E',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
