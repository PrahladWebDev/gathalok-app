import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

function Mote({ x, y, size, delay, duration, color }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });
  const opacity = t.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.7, 0.7, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2,
        backgroundColor: color, opacity, transform: [{ translateY }],
      }}
    />
  );
}

/**
 * A faint drift of golden dust across the screen — ambient magic behind
 * every screen's content. Deliberately cheap (a handful of nodes, native
 * driver only, no re-renders) so it can live in the shared Screen shell.
 * Only shows for the 'elevated' (GathaLok gold / mythical) theme — the
 * ported neo-brutalist outline themes don't suit sparkle dust.
 */
export default function MagicParticles({ count = 7 }) {
  const theme = useTheme();

  const motes = useMemo(() => (
    Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: 60 + Math.random() * Math.max(H - 200, 100),
      size: 2 + Math.random() * 3,
      delay: Math.random() * 4000,
      duration: 3500 + Math.random() * 2500,
    }))
  ), [count]);

  if (theme.uiStyle !== 'elevated') return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      {motes.map((m, i) => <Mote key={i} {...m} color={theme.colors.accent} />)}
    </View>
  );
}
