import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

const ORB_SIZE_1 = 480;
const ORB_SIZE_2 = 420;
const ORB_SIZE_3 = 360;

function Orb({
  size,
  color,
  style,
  driftX,
  driftY,
  duration,
  delay = 0,
}: {
  size: number;
  color: string;
  style: object;
  driftX: number;
  driftY: number;
  duration: number;
  delay?: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      progress.value = withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [progress, duration, delay]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * driftX },
      { translateY: progress.value * driftY },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        animStyle,
      ]}
    />
  );
}

export function AmbientBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Top-left indigo orb */}
      <Orb
        size={ORB_SIZE_1}
        color={colors.orb1}
        style={styles.orb1}
        driftX={40}
        driftY={30}
        duration={10000}
        delay={0}
      />
      {/* Bottom-right violet orb */}
      <Orb
        size={ORB_SIZE_2}
        color={colors.orb2}
        style={styles.orb2}
        driftX={-35}
        driftY={-25}
        duration={13000}
        delay={1800}
      />
      {/* Center-right blue orb */}
      <Orb
        size={ORB_SIZE_3}
        color={colors.orb3}
        style={styles.orb3}
        driftX={25}
        driftY={-40}
        duration={9000}
        delay={900}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb1: {
    position: 'absolute',
    top: -ORB_SIZE_1 * 0.45,
    left: -ORB_SIZE_1 * 0.40,
  },
  orb2: {
    position: 'absolute',
    bottom: -ORB_SIZE_2 * 0.45,
    right: -ORB_SIZE_2 * 0.35,
  },
  orb3: {
    position: 'absolute',
    top: '30%',
    right: -ORB_SIZE_3 * 0.55,
  },
});
