import { BlurView, BlurTint } from 'expo-blur';
import React, { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

type GlassVariant = 'base' | 'elevated' | 'deep' | 'sheet';

type Props = {
  variant?: GlassVariant;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  borderRadius?: number;
};

const VARIANT_CONFIG: Record<GlassVariant, { intensity: number; tint: BlurTint; overlay: string }> = {
  base:     { intensity: 60, tint: 'systemUltraThinMaterialLight', overlay: colors.glass },
  elevated: { intensity: 80, tint: 'systemThinMaterialLight',      overlay: colors.glassElevated },
  deep:     { intensity: 40, tint: 'systemUltraThinMaterialLight', overlay: colors.glassDeep },
  sheet:    { intensity: 90, tint: 'systemMaterialLight',          overlay: 'rgba(255,255,255,0.88)' },
};

// Lazy require so the TurboModule crash is caught rather than thrown at import time.
// After `npx expo prebuild && npx expo run:ios` the native module will be registered.
let NativeLiquidGlassView: React.ComponentType<any> | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require('@callstack/liquid-glass');
  if (pkg.isLiquidGlassSupported) {
    NativeLiquidGlassView = pkg.LiquidGlassView;
  }
} catch {
  // Native module not linked — fall back to expo-blur
}

export function GlassView({ variant = 'base', style, children, borderRadius }: Props) {
  const br = borderRadius ?? 0;

  const containerStyle: ViewStyle = {
    overflow: 'hidden',
    borderRadius: br,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  };

  // Native iOS 26+ liquid glass (only active after expo prebuild)
  if (NativeLiquidGlassView) {
    return (
      <NativeLiquidGlassView
        effect={variant === 'deep' ? 'clear' : 'regular'}
        colorScheme="light"
        style={[containerStyle, style]}
      >
        {children}
      </NativeLiquidGlassView>
    );
  }

  // Android / web — opaque fallback
  if (Platform.OS === 'android' || Platform.OS === 'web') {
    return (
      <View style={[containerStyle, { backgroundColor: 'rgba(255,255,255,0.93)' }, style]}>
        {children}
      </View>
    );
  }

  // iOS < 26 — expo-blur approximation
  const config = VARIANT_CONFIG[variant];
  return (
    <View style={[containerStyle, style]}>
      <BlurView
        intensity={config.intensity}
        tint={config.tint}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: config.overlay }]} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
