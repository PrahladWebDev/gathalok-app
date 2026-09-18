import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PillBadge from '../components/PillBadge';
import { SkeletonGrid } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import { COUNTRIES } from '../data/countries';

// Tile-grid "map" instead of a literal geographic map — same visual language
// as Home's region strip, but every country, each showing its live story
// count. Avoids react-native-maps entirely, so this works in plain Expo Go
// with no dev build, no Google Maps API key, and no native config.
export default function MapScreen({ navigation }) {
  const theme = useTheme();
  const [counts, setCounts] = useState({}); // { "India": 12, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/countries/stats')
      .then((r) => {
        const map = {};
        (r.data.data || []).forEach((row) => { map[row._id] = row.storyCount; });
        setCounts(map);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const sorted = [...COUNTRIES].sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0));

  return (
    <Screen title="Realms" subtitle="Every region GathaLok has reached" scroll>
      {loading ? (
        <SkeletonGrid count={10} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <FlatList
          data={sorted}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={(c) => c.name}
          renderItem={({ item }) => {
            const count = counts[item.name] || 0;
            return (
              <Card
                onPress={() => navigation.navigate('CountryDetail', { countryName: item.name })}
                style={{ width: '48%', alignItems: 'center', paddingVertical: 20, marginBottom: 12, opacity: count ? 1 : 0.55 }}
              >
                <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
                <Text style={[theme.typography.h4, { marginTop: 8, textAlign: 'center' }]} numberOfLines={1}>{item.name}</Text>
                <PillBadge
                  label={count ? `${count} ${count === 1 ? 'tale' : 'tales'}` : 'No tales yet'}
                  tone={count ? 'accent' : 'neutral'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}
