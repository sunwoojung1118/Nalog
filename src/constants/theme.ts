import { Platform, ViewStyle } from 'react-native';

export const colors = {
  // Backgrounds
  bg:              '#FFFFFF',
  bgSurface:       '#FFFFFF',
  bgDeep:          '#F5F5F7',

  // Text
  text:            '#1A1A1A',
  textSoft:        'rgba(26,26,26,0.60)',
  textFaint:       'rgba(26,26,26,0.38)',

  // Accent — orange
  accent:          '#FF6B00',
  accentDeep:      '#E05A00',
  accentSoft:      'rgba(255,107,0,0.18)',
  accentMuted:     'rgba(255,107,0,0.08)',
  accentGlow:      'rgba(255,107,0,0.15)',

  // Gradient stops for the orange FAB / publish button
  accentGradientStart: '#FF8C00',
  accentGradientEnd:   '#FF4500',

  // Deterministic gradient covers for journal cards
  // Use: coverGradients[(weekNumber + charCode) % coverGradients.length]
  coverGradients: [
    ['#FF6B00', '#FF4500'],
    ['#7C3AED', '#4F46E5'],
    ['#0EA5E9', '#6366F1'],
    ['#10B981', '#059669'],
    ['#EC4899', '#BE185D'],
    ['#F59E0B', '#D97706'],
  ] as const,

  // Surfaces / borders
  border:          'rgba(26,26,26,0.10)',
  divider:         'rgba(26,26,26,0.07)',
  dividerStrong:   'rgba(26,26,26,0.15)',
  hairline:        'rgba(26,26,26,0.06)',
  handle:          'rgba(26,26,26,0.20)',

  // Liquid glass tokens
  glass:           'rgba(255,255,255,0.55)',
  glassBorder:     'rgba(255,255,255,0.35)',
  glassElevated:   'rgba(255,255,255,0.70)',
  glassDeep:       'rgba(255,255,255,0.25)',
  glassShadow:     'rgba(0,0,0,0.10)',

  // Tab bar tokens
  pillBg:          '#EBEBED',
  secondaryLabel:  'rgba(60,60,67,0.50)',
};

export const fonts = {
  // SF Pro Display — large headings (≥20pt)
  display: Platform.select({
    ios: '.SF Pro Display',
    android: 'Roboto',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }) as string,
  // SF Pro Text — body and UI text
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }) as string,
  // SF Pro Rounded — chips, labels, badges, tab labels
  rounded: Platform.select({
    ios: 'ui-rounded',
    android: 'Roboto',
    default: 'system-ui, sans-serif',
  }) as string,
  // Georgia — ONLY for journal body text and week titles
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


export const shadows: Record<'tile' | 'card' | 'lift' | 'glass' | 'fab', ViewStyle> = {
  tile: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lift: {
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  glass: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fab: {
    shadowColor: '#FF6B00',
    shadowOpacity: 0.40,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
};
