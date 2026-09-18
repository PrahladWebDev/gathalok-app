import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { haptic } from '../utils/haptics';

// Read-only display: <Stars value={story.averageRating} />
// Interactive input:  <Stars value={userRating} interactive onRate={setRating} />
export default function Stars({ value = 0, size = 15, interactive = false, onRate, style }) {
  const theme = useTheme();
  const rounded = Math.round(value);
  return (
    <View style={[{ flexDirection: 'row' }, style]}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rounded;
        const Wrapper = interactive ? TouchableOpacity : View;
        return (
          <Wrapper
            key={i}
            {...(interactive ? {
              onPress: () => { haptic.select(); onRate && onRate(i); },
              hitSlop: theme.hitSlop,
              accessibilityRole: 'button',
              accessibilityLabel: `Rate ${i} star${i !== 1 ? 's' : ''}`,
            } : {})}
            style={{ marginRight: 2 }}
          >
            <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={theme.colors.accent} />
          </Wrapper>
        );
      })}
    </View>
  );
}
