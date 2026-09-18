import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Small rounded badge for counts, day-deltas, category tags — e.g. "24d",
// "7 ideas", "Formal". Pass a `tone` to tint the background; defaults to a
// neutral surface tint.
export default function PillBadge({ label, tone = 'neutral', style, textStyle }) {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  const styles = makeStyles(theme, elevated);
  const toneStyle = {
    neutral: styles.neutral,
    accent: styles.accent,
    success: styles.success,
    danger: styles.danger,
    info: styles.info,
  }[tone] || styles.neutral;

  return (
    <View style={[styles.badge, toneStyle, style]}>
      <Text style={[styles.text, textStyle]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const makeStyles = (theme, elevated) => StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: elevated ? 1 : theme.border.width - 1,
    borderColor: elevated ? theme.colors.border : theme.colors.text,
    alignSelf: 'flex-start',
  },
  neutral: { backgroundColor: theme.colors.surfaceAlt },
  accent: { backgroundColor: theme.colors.accentSoft },
  success: { backgroundColor: theme.colors.successSoft },
  danger: { backgroundColor: theme.colors.dangerSoft },
  info: { backgroundColor: theme.colors.infoSoft },
  text: { fontSize: 12, fontWeight: '700', color: theme.colors.text },
});
