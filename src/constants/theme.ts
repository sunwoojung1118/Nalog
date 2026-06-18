import { Platform, ViewStyle } from 'react-native';

export const colors = {
  // Base backgrounds
  bg: '#0a0a0f',
  bgSurface: '#0d0d16',

  // Glass surfaces
  glass: 'rgba(255,255,255,0.055)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassElevated: 'rgba(255,255,255,0.09)',
  glassDeep: 'rgba(255,255,255,0.03)',

  // Text
  text: '#EDEAF5',
  textSoft: 'rgba(237,234,245,0.60)',
  textFaint: 'rgba(237,234,245,0.30)',

  // Accent — indigo
  accent: '#5E6AD2',
  accentSoft: 'rgba(94,106,210,0.35)',
  accentGlow: 'rgba(94,106,210,0.18)',
  accentDeep: '#4B56B8',
  accentMuted: 'rgba(94,106,210,0.15)',

  // Dividers
  divider: 'rgba(255,255,255,0.07)',
  dividerStrong: 'rgba(255,255,255,0.13)',
  hairline: 'rgba(255,255,255,0.06)',
  handle: 'rgba(255,255,255,0.20)',

  // Ambient orb tints
  orb1: 'rgba(94,106,210,0.22)',
  orb2: 'rgba(139,92,246,0.14)',
  orb3: 'rgba(59,130,246,0.10)',

  // Legacy aliases — keep existing imports compiling
  paper: '#0a0a0f',
  paperWarm: '#0d0d16',
  paperDeep: '#111119',
  community: '#0a0a0f',
  card: '#0d0d16',

  ink: '#EDEAF5',
  inkSoft: 'rgba(237,234,245,0.60)',
  inkFaint: 'rgba(237,234,245,0.30)',

  surfaceDark: 'rgba(255,255,255,0.055)',
  surfaceDarkSoft: 'rgba(255,255,255,0.09)',
  onDark: '#EDEAF5',
  onDarkSoft: 'rgba(237,234,245,0.60)',
  onDarkFaint: 'rgba(237,234,245,0.30)',
  hairlineOnDark: 'rgba(255,255,255,0.07)',

  blurTint: 'rgba(10,10,15,0.70)',
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
  tile: 18,
  card: 14,
  headerPill: 26,
  postCard: 22,
  tabBar: 36,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const layout = {
  writingColumn: 720,
  readingColumn: 680,
  profileColumn: 760,
};

export const shadows: Record<'tile' | 'card' | 'lift', ViewStyle> = {
  tile: {
    shadowColor: '#5E6AD2',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  card: {
    shadowColor: '#5E6AD2',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lift: {
    shadowColor: '#5E6AD2',
    shadowOpacity: 0.30,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
};
