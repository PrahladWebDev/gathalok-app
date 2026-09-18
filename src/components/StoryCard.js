import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import PillBadge from './PillBadge';
import Stars from './Stars';
import { useTheme } from '../context/ThemeContext';
import { getCategory } from '../data/categories';

// size: 'normal' (grid card, default) | 'compact' (horizontal list row)
export default function StoryCard({ story, size = 'normal', onPress }) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  if (!story) return null;

  const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(story.title)}&size=400&background=1E1736&color=B78C3E&bold=true&length=2`;
  const category = getCategory(story.category);

  if (size === 'compact') {
    return (
      <Card onPress={onPress} style={styles.compactCard}>
        <Image source={{ uri: story.coverImage?.url || placeholder }} style={styles.compactImage} contentFit="cover" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={theme.typography.h4} numberOfLines={2}>{story.title}</Text>
          <Text style={[theme.typography.caption, { marginTop: 4 }]} numberOfLines={1}>📍 {story.country}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
            <Stars value={story.averageRating || 0} size={12} />
            <Text style={[theme.typography.small, { marginLeft: 6 }]}>
              {story.averageRating ? story.averageRating.toFixed(1) : 'Unrated'}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: story.coverImage?.url || placeholder }} style={styles.image} contentFit="cover" />
        {story.isFeatured ? (
          <PillBadge label="⭐ Featured" tone="accent" style={styles.featuredBadge} />
        ) : null}
        {category ? (
          <View style={[styles.catBadge, { backgroundColor: category.color }]}>
            <Text style={styles.catBadgeText}>{category.icon} {category.name}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Text style={theme.typography.caption} numberOfLines={1}>📍 {story.country}</Text>
        <Text style={theme.typography.caption}>👁 {story.views?.toLocaleString() || 0}</Text>
      </View>

      <Text style={[theme.typography.h3, { marginTop: 6 }]} numberOfLines={2}>{story.title}</Text>

      <Text style={[theme.typography.bodyMuted, { marginTop: 4 }]} numberOfLines={2}>
        {story.shortDescription}
      </Text>

      <View style={styles.footerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Stars value={story.averageRating || 0} size={13} />
          <Text style={[theme.typography.small, { marginLeft: 6 }]}>
            {story.averageRating ? story.averageRating.toFixed(1) : 'Unrated'}
          </Text>
        </View>
        {story.contributor ? (
          <Text style={theme.typography.small} numberOfLines={1}>
            by {story.contributor.name || story.contributor.username}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  card: { padding: 10, marginBottom: 14 },
  imageWrap: { borderRadius: theme.radius.md, overflow: 'hidden', aspectRatio: 4 / 3 },
  image: { width: '100%', height: '100%' },
  featuredBadge: { position: 'absolute', top: 8, left: 8 },
  catBadge: { position: 'absolute', bottom: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.pill },
  catBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  compactCard: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 10 },
  compactImage: { width: 64, height: 64, borderRadius: theme.radius.sm },
});
