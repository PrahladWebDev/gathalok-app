import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import PillBadge from '../components/PillBadge';
import StoryCard from '../components/StoryCard';
import { SkeletonGrid } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import { getCountry } from '../data/countries';

export default function CountryDetailScreen({ route, navigation }) {
  const { countryName } = route.params;
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const country = getCountry(countryName);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get(`/countries/${encodeURIComponent(countryName)}`)
      .then((r) => setData(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [countryName]);

  const otherStories = data?.stories?.filter((s) => !data.featured || s._id !== data.featured._id) || [];

  return (
    <Screen title={`${country?.emoji || '📍'} ${countryName}`} subtitle="Stories from this land" scroll safeTop={false}>
      {loading ? (
        <SkeletonGrid count={6} />
      ) : error || !data ? (
        <ErrorState icon="earth-outline" title="Couldn't load this country" onRetry={load} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            <Card style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
              <Text style={theme.typography.h1}>{data.storyCount}</Text>
              <Text style={theme.typography.caption}>Stories</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <Text style={theme.typography.h1}>{data.contributors?.length || 0}</Text>
              <Text style={theme.typography.caption}>Contributors</Text>
            </Card>
          </View>

          <Button
            title="Browse All Stories"
            onPress={() => navigation.navigate('Main', { screen: 'ExploreTab', params: { country: countryName } })}
            style={{ marginBottom: 20 }}
          />

          {data.featured ? (
            <>
              <Text style={theme.typography.label}>Most Notable</Text>
              <Text style={[theme.typography.h2, { marginBottom: 10 }]}>Featured Legend</Text>
              <StoryCard story={data.featured} onPress={() => navigation.navigate('StoryDetail', { slug: data.featured.slug })} />
            </>
          ) : null}

          {otherStories.length ? (
            <>
              <Text style={[theme.typography.h2, { marginTop: 8, marginBottom: 10 }]}>Stories from {countryName}</Text>
              {otherStories.slice(0, 6).map((s) => (
                <StoryCard key={s._id} story={s} onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
              ))}
            </>
          ) : !data.featured ? (
            <ErrorState icon="moon-outline" title="No stories yet" message="Be the first to share a legend from here." />
          ) : null}

          {data.contributors?.length > 0 ? (
            <>
              <Text style={[theme.typography.h2, { marginTop: 8, marginBottom: 10 }]}>Top Contributors</Text>
              {data.contributors.map((u) => (
                <Card key={u._id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accentSoft,
                    alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden',
                    borderWidth: theme.border.width, borderColor: theme.colors.text,
                  }}>
                    {u.avatar?.url ? (
                      <Image source={{ uri: u.avatar.url }} style={{ width: 40, height: 40 }} />
                    ) : (
                      <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{u.name?.[0]?.toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={theme.typography.h4}>{u.name}</Text>
                  </View>
                  <PillBadge label={`${u.storiesWritten || 0} stories`} tone="accent" />
                </Card>
              ))}
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}
