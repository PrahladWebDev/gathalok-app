import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import StoryCard from '../components/StoryCard';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { CATEGORIES } from '../data/categories';
import { COUNTRIES } from '../data/countries';

const { width: SCREEN_W } = Dimensions.get('window');

function SectionHeader({ label, title, onPress, actionLabel = 'View all' }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
      <View>
        <Text style={theme.typography.label}>{label}</Text>
        <Text style={theme.typography.h2}>{title}</Text>
      </View>
      {onPress ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={[theme.typography.body, { color: theme.colors.accent, fontWeight: '700' }]}>{actionLabel} →</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);

  const load = useCallback(async () => {
    setError(false);
    try {
      const [featRes, recentRes] = await Promise.all([
        api.get('/stories/featured'),
        api.get('/stories', { params: { limit: 6, sort: '-createdAt' } }),
      ]);
      setFeatured(featRes.data.data || []);
      setRecent(recentRes.data.data || []);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % Math.min(featured.length, 5)), 5000);
    return () => clearInterval(t);
  }, [featured.length]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const heroStory = featured[heroIdx] || featured[0];

  if (loading) {
    return (
      <Screen title="GathaLok" subtitle="Living archive of world folklore" scroll>
        <SkeletonList count={4} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="GathaLok" scroll refreshing={refreshing} onRefresh={onRefresh}>
        <ErrorState message="Couldn't reach the archive. Check your server connection in Settings." onRetry={load} />
      </Screen>
    );
  }

  return (
    <Screen title="GathaLok" subtitle="Living archive of world folklore" scroll refreshing={refreshing} onRefresh={onRefresh}>
      {/* Hero — rotating featured story */}
      {heroStory ? (
        <Card onPress={() => navigation.navigate('StoryDetail', { slug: heroStory.slug })} style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <Image
            source={{ uri: heroStory.coverImage?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(heroStory.title) + '&size=600&background=1E1736&color=B78C3E' }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
          />
          <View style={{ padding: 14 }}>
            <Text style={theme.typography.label}>✦ Featured</Text>
            <Text style={theme.typography.h2} numberOfLines={2}>{heroStory.title}</Text>
            <Text style={[theme.typography.bodyMuted, { marginTop: 4 }]} numberOfLines={2}>{heroStory.shortDescription}</Text>
          </View>
          {featured.length > 1 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingBottom: 12 }}>
              {featured.slice(0, 5).map((_, i) => (
                <View key={i} style={{
                  width: i === heroIdx ? 16 : 6, height: 6, borderRadius: 3, marginHorizontal: 3,
                  backgroundColor: i === heroIdx ? theme.colors.accent : theme.colors.border,
                }} />
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      {/* Recently added — moved up per feedback: fresh content first */}
      {recent.length > 0 ? (
        <>
          <SectionHeader label="Fresh from the Archives" title="Recently Added" onPress={() => navigation.navigate('ExploreTab', { sort: '-createdAt' })} />
          {recent.map((s) => (
            <StoryCard key={s._id} story={s} onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
          ))}
        </>
      ) : null}

      {/* Explore by region */}
      <SectionHeader label="Explore by Region" title="Journey Across the World" onPress={() => navigation.navigate('MapTab')} actionLabel="View Realms" />
      <FlatList
        data={COUNTRIES.slice(0, 8)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.name}
        contentContainerStyle={{ paddingBottom: 4 }}
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('CountryDetail', { countryName: item.name })} style={{ marginRight: 10, alignItems: 'center', width: 108, paddingVertical: 18 }}>
            <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
            <Text style={[theme.typography.h4, { marginTop: 8, textAlign: 'center' }]} numberOfLines={1}>{item.name}</Text>
          </Card>
        )}
        style={{ marginBottom: 24 }}
      />

      {/* Categories */}
      <SectionHeader label="Discover" title="Browse by Category" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 }}>
        {CATEGORIES.map((cat) => (
          <Card
            key={cat.slug}
            onPress={() => navigation.navigate('ExploreTab', { category: cat.slug })}
            style={{ width: '48%', marginBottom: 10, alignItems: 'center', paddingVertical: 16 }}
          >
            <Text style={{ fontSize: 26 }}>{cat.icon}</Text>
            <Text style={[theme.typography.small, { marginTop: 6, textAlign: 'center', textTransform: 'none', fontSize: 12 }]} numberOfLines={2}>
              {cat.name}
            </Text>
          </Card>
        ))}
      </View>

      {/* CTA */}
      <Card style={{ alignItems: 'center', paddingVertical: 28, marginTop: 4 }}>
        <Text style={{ fontSize: 22 }}>✦</Text>
        <Text style={[theme.typography.h2, { textAlign: 'center', marginTop: 8 }]}>
          Your village has a story{'\n'}the world should hear.
        </Text>
        <Text style={[theme.typography.bodyMuted, { textAlign: 'center', marginTop: 8, marginBottom: 18 }]}>
          Help preserve oral heritage from around the world before the last teller falls silent.
        </Text>
        {user ? (
          <Button title="Share Your Story" onPress={() => navigation.navigate('ProfileTab', { screen: 'Contribute' })} />
        ) : (
          <Button title="Create Free Account" onPress={() => navigation.navigate('Auth', { screen: 'Register' })} />
        )}
      </Card>
    </Screen>
  );
}
