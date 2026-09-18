import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// variant: primary | outline | ghost | danger
// size: md (default) | sm
// icon: optional Ionicons name rendered before the title
//
// Shape/fill follows theme.uiStyle: 'outline' themes (the 10 Wardrobe
// palettes) keep the original flat-fill, thick-border, pill-shaped button.
// 'elevated' (gathalok) renders primary as a real gold gradient with a glow
// shadow and a moderate (not full-pill) radius, matching the web's .btn-gold.
export default function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading = false, disabled = false, style, textStyle, accessibilityLabel }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const styles = makeStyles(theme, elevated);
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const fg = isPrimary || isDanger ? theme.colors.onAccent : theme.colors.accent;

  const content = loading ? (
    <ActivityIndicator color={fg} />
  ) : (
    <View style={styles.content}>
      {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[theme.typography.button, size === 'sm' && { fontSize: 13 }, { color: fg }, textStyle]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );

  const touchableProps = {
    onPress,
    disabled: disabled || loading,
    activeOpacity: 0.85,
    accessibilityRole: 'button',
    accessibilityLabel: accessibilityLabel || title,
    accessibilityState: { disabled: disabled || loading, busy: loading },
  };

  // Elevated + primary: gradient fill, no border, needs its own wrapper for
  // the glow shadow (shadows don't clip to LinearGradient's border radius).
  if (elevated && isPrimary) {
    return (
      <TouchableOpacity {...touchableProps} style={[styles.glowWrap, (disabled || loading) && styles.disabled, style]}>
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, size === 'sm' && styles.sm]}>
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      {...touchableProps}
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        isPrimary && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

const makeStyles = (theme, elevated) => StyleSheet.create({
  base: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: elevated ? theme.radius.md : theme.radius.pill,
    borderWidth: elevated ? 0 : theme.border.width,
    borderColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  glowWrap: {
    borderRadius: theme.radius.md,
    ...theme.shadow.glow,
  },
  sm: { minHeight: 40, paddingVertical: 8, paddingHorizontal: 14 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  primary: elevated ? { backgroundColor: theme.colors.accent } : { backgroundColor: theme.colors.accent },
  outline: elevated
    ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border }
    : { backgroundColor: 'transparent', borderColor: theme.colors.text },
  ghost: elevated
    ? { backgroundColor: theme.colors.accentSoft, borderWidth: 0 }
    : { backgroundColor: theme.colors.accentSoft },
  danger: { backgroundColor: theme.colors.danger },
  disabled: { opacity: 0.5 },
});
