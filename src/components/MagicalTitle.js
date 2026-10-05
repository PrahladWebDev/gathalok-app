import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

// ---- Glow: a soft breathing fog spanning the full screen width behind the wordmark ----
// `bleed` = how far the parent is inset from the screen's left edge, so the fog
// can break out of the padded header and run edge to edge.
function GlowOrb({ color, width, height, bleed }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Only breathe vertically so the fog never changes its left/right reach.
  const scaleY = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: -bleed, width, height, top: '45%', marginTop: -height / 2, opacity, transform: [{ scaleY }] }}
    >
      <Svg width={width} height={height}>
        <Defs>
          {/* objectBoundingBox units: the gradient stretches into a wide ellipse that fades to 0 exactly at the left and right screen edges */}
          <RadialGradient id="magicGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <Stop offset="55%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#magicGlow)" />
      </Svg>
    </Animated.View>
  );
}

// ---- Waves: seamless bands of light drifting under the wordmark, edge to edge ----
function WaveLayer({ color, opacity, height, amplitude, duration, delay = 0, width, bleed }) {
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    shift.setValue(0);
    const loop = Animated.loop(
      Animated.timing(shift, { toValue: -width, duration, delay, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [width]);

  // 4 segments (up, down, up, down) so the tangent matches where one copy meets the next.
  const d = useMemo(() => {
    const segs = 4;
    const segW = width / segs;
    let path = `M0 ${amplitude}`;
    for (let i = 0; i < segs; i++) {
      const xMid = i * segW + segW / 2;
      const xEnd = i * segW + segW;
      const yCtrl = i % 2 === 0 ? amplitude * 2.2 : -amplitude * 0.2;
      path += ` Q ${xMid} ${yCtrl}, ${xEnd} ${amplitude}`;
    }
    return path;
  }, [width, amplitude]);

  return (
    // Clip window = full screen width, pulled out past the header padding.
    <View pointerEvents="none" style={{ position: 'absolute', left: -bleed, width, bottom: 0, height, overflow: 'hidden' }}>
      <Animated.View style={{ width: width * 2, height, flexDirection: 'row', opacity, transform: [{ translateX: shift }] }}>
        <Svg width={width} height={height}>
          <Path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
        <Svg width={width} height={height}>
          <Path d={d} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ---- Sparkles: little points of light that rise off the wordmark and wink out ----
function Sparkle({ left, size, color, delay, duration }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(t, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [6, -34] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const scale = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.4] });

  return (
    <Animated.Text
      pointerEvents="none"
      style={{ position: 'absolute', left, bottom: 0, fontSize: size, color, opacity, transform: [{ translateY }, { scale }] }}
    >
      ✦
    </Animated.Text>
  );
}

/**
 * Animated wordmark: a shimmering title with glowing waves of light
 * drifting beneath it and sparkles rising off it, like light on enchanted
 * water. Drop-in replacement for a plain <Text style={h1}> title.
 */
export default function MagicalTitle({ title, subtitle }) {
  const theme = useTheme();
  const { width: screenW } = useWindowDimensions();
  const bleed = theme.layout?.screenPadding ?? 20; // header sits this far in from the screen edge
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const gold = theme.gradient?.[0] || theme.colors.accent;
  const goldDeep = theme.gradient?.[1] || theme.colors.accent;
  const textColor = shimmer.interpolate({ inputRange: [0, 1], outputRange: [goldDeep, gold] });
  const glowRadius = shimmer.interpolate({ inputRange: [0, 1], outputRange: [4, 14] });

  const sparkles = useMemo(() => ([
    { left: 6, size: 10, delay: 0, duration: 2600 },
    { left: 44, size: 7, delay: 500, duration: 2200 },
    { left: 92, size: 12, delay: 1100, duration: 3000 },
    { left: 146, size: 8, delay: 300, duration: 2400 },
    { left: 196, size: 9, delay: 900, duration: 2800 },
    { left: 240, size: 6, delay: 1500, duration: 2000 },
  ]), []);

  return (
    <View style={styles.wrap}>
      <GlowOrb color={gold} width={screenW} height={150} bleed={bleed} />
      <WaveLayer color={theme.colors.accent} opacity={0.5} height={30} amplitude={10} duration={4200} width={screenW} bleed={bleed} />
      <WaveLayer color={gold} opacity={0.3} height={22} amplitude={6} duration={6000} delay={300} width={screenW} bleed={bleed} />
      {sparkles.map((s, i) => <Sparkle key={i} color={gold} {...s} />)}
      <Animated.Text
        accessibilityRole="header"
        style={[
          theme.typography.h1,
          styles.title,
          { color: textColor, textShadowColor: gold, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: glowRadius },
        ]}
      >
        {title}
      </Animated.Text>
      {subtitle ? <Text style={[theme.typography.bodyMuted, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 4, paddingBottom: 6 },
  title: { letterSpacing: 0.5 },
  subtitle: { marginTop: 2 },
});