import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import MagicalTitle from '../components/MagicalTitle';
import { SkeletonGrid } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import useFocusedFetch from '../hooks/useFocusedFetch';
import useCountryImages from '../hooks/useCountryImages';
import api from '../api/client';
import { COUNTRIES, getCountryColor } from '../data/countries';

// Tile-grid "map" instead of a literal geographic map — every country is a
// photo tile (landmark as the background, flag + name + live story count on
// top). Avoids react-native-maps entirely, so this works in plain Expo Go
// with no dev build, no Google Maps API key, and no native config.
export default function MapScreen({ navigation }) {
  const theme = useTheme();
  const images = useCountryImages();
  const { data: counts, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/countries/stats').then((r) => {
      const map = {}; // { "India": 12, ... }
      (r.data.data || []).forEach((row) => { map[row._id] = row.storyCount; });
      return map;
    }),
    []
  );

  const sorted = [...COUNTRIES].sort((a, b) => ((counts || {})[b.name] || 0) - ((counts || {})[a.name] || 0));

  return (
    <Screen titleNode={<MagicalTitle title="Realms" subtitle="Every region GathaLok has reached" />} scroll refreshing={refreshing} onRefresh={refresh}>
      {status === 'loading' ? (
        <SkeletonGrid count={10} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : (
        <FlatList
          data={sorted}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          keyExtractor={(c) => c.name}
          renderItem={({ item }) => {
            const count = counts[item.name] || 0;
            const color = getCountryColor(item.name);
            const uri = images[item.name];
            return (
              <Pressable
                onPress={() => navigation.navigate('CountryDetail', { countryName: item.name })}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${count} ${count === 1 ? 'tale' : 'tales'}`}
                style={({ pressed }) => ({
                  width: '48%',
                  height: 132,
                  marginBottom: 12,
                  borderRadius: theme.radius.md,
                  overflow: 'hidden',
                  backgroundColor: color,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                {/* colour fallback shows until/unless the photo loads */}
                <LinearGradient colors={[color, '#000000']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
                {uri ? (
                  <Image
                    source={{ uri }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    contentFit="cover"
                    transition={250}
                  />
                ) : null}
                {/* dark fade so the text stays readable on any photo */}
                <LinearGradient
                  colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.8)']}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}>
                  <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>
                      {count ? `${count} ${count === 1 ? 'tale' : 'tales'}` : 'No tales yet'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                    <Text
                      style={[theme.typography.h4, { color: '#FFFFFF', flex: 1, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
