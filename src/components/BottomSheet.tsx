import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/constants/theme';
import { useBarFootprint } from '@/lib/useBarFootprint';
import { SheetSnap, SheetStateContext, SheetStateValue } from './SheetStateContext';
import { SheetBar } from './sheet/SheetBar';

type Props = {
  children: ReactNode;
  shell?: ReactNode;
  onSnapChange?: (snap: SheetSnap) => void;
};

const SPRING = { damping: 24, stiffness: 200, mass: 0.9 };

// Approximate Nalog button geometry inside the TabBar (matches TabBar.tsx).
// The button is a 64x64 circle hugging the right edge of the bar with 16px
// horizontal padding around it.
const NALOG_SIZE = 64;
const NALOG_RIGHT_PAD = 16 + 8; // wrap paddingHorizontal + gap on the right
const TAB_BAR_PILL_HEIGHT = 72;

export function BottomSheet({ children, shell, onSnapChange }: Props) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const barFootprint = useBarFootprint();

  // FULL = 0 (sheet covers viewport); BAR = (height - barFootprint) (only the bar remains visible)
  const BAR = Math.max(0, height - barFootprint);

  // Target the center of the Nalog button (screen coordinates).
  const nalogCenterX = width - NALOG_RIGHT_PAD - NALOG_SIZE / 2;
  const nalogCenterY =
    height - barFootprint - 8 /* tabBar paddingVertical */ - TAB_BAR_PILL_HEIGHT / 2;

  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);
  const [snap, setSnap] = useState<SheetSnap>('full');

  const reportSnap = useCallback(
    (next: SheetSnap) => {
      setSnap((prev) => (prev === next ? prev : next));
      if (onSnapChange) onSnapChange(next);
    },
    [onSnapChange],
  );

  useAnimatedReaction(
    () => translateY.value,
    (v) => {
      const target: SheetSnap = v > BAR / 2 ? 'bar' : 'full';
      runOnJS(reportSnap)(target);
    },
    [BAR],
  );

  const requestSnap = useCallback(
    (next: SheetSnap) => {
      translateY.value = withSpring(next === 'full' ? 0 : BAR, SPRING);
    },
    [BAR, translateY],
  );

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value = Math.max(-16, Math.min(BAR + 24, next));
    })
    .onEnd((e) => {
      const projected = translateY.value + e.velocityY * 0.12;
      const target = projected > BAR / 2 ? BAR : 0;
      translateY.value = withSpring(target, SPRING);
    });

  const tap = Gesture.Tap()
    .maxDuration(220)
    .onEnd((_e, success) => {
      if (!success) return;
      // Only respond when collapsed; ignore taps while writing
      if (translateY.value > BAR / 2) {
        translateY.value = withSpring(0, SPRING);
      }
    });

  const handleGesture = Gesture.Race(tap, pan);

  // Suction: as the sheet collapses, shrink it toward the Nalog button.
  // Progress is 0 when open, 1 when fully collapsed. The "suction" phase
  // engages in the last ~40% of the collapse so the early drag stays linear.
  const sheetStyle = useAnimatedStyle(() => {
    const ty = translateY.value;
    const progress = BAR > 0 ? Math.max(0, Math.min(1, ty / BAR)) : 0;
    const suction = Math.max(0, (progress - 0.55) / 0.45); // 0..1

    const minScale = 0.18;
    const scale = 1 - suction * (1 - minScale);

    // Untransformed sheet center
    const cx = width / 2;
    const cy = height / 2;

    // When scaled by s about its center, to make a point land on
    // (nalogCenterX, nalogCenterY) we additionally translate by
    // (target - center) * (1 - s). Multiply by `suction` so the early
    // translateY-only motion is not pulled sideways.
    const offsetX = (nalogCenterX - cx) * (1 - scale) * suction;
    const offsetY = (nalogCenterY - cy) * (1 - scale) * suction;

    return {
      transform: [
        { translateY: ty + offsetY },
        { translateX: offsetX },
        { scale },
      ],
      opacity: 1 - suction * 0.35,
      borderRadius: radius.sheet + suction * (NALOG_SIZE / 2),
    };
  });

  const contextValue = useMemo<SheetStateValue>(
    () => ({ snap, requestSnap }),
    [snap, requestSnap],
  );

  return (
    <SheetStateContext.Provider value={contextValue}>
      {shell}
      <Animated.View
        style={[
          styles.sheet,
          { paddingTop: insets.top + 4, paddingBottom: insets.bottom },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={handleGesture}>
          <View style={styles.handleZone}>
            <SheetBar />
          </View>
        </GestureDetector>
        <View style={styles.body}>{children}</View>
      </Animated.View>
    </SheetStateContext.Provider>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    overflow: 'hidden',
    boxShadow: '0px -8px 24px rgba(44, 44, 44, 0.18)',
    elevation: 12,
  },
  handleZone: {
    // SheetBar is height = BAR_HEIGHT; this wraps the tap+pan zone
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
  },
});
