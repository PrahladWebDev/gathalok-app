import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import PillBadge from '../components/PillBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';
import { getCategory } from '../data/categories';

const TABS = [
  { id: 'readers', label: '📚 Readers' },
  { id: 'contributors', label: '✍️ Contributors' },
  { id: 'stories', label: '🔥 Stories' },
];

function RankRow({ index, avatarUrl, name, sub, trailing, onPress }) {
  const theme = useTheme();
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
  return (
    <Card onPress={onPress} accessibilityLabel={`Rank ${index + 1}, ${name}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <View style={{ width: 28, alignItems: 'center' }}>
        <Text style={theme.typography.h3}>{medal || index + 1}</Text>
      </View>
      <View style={{
        width: 40, height: 40, borderRadius: 20, marginLeft: 6, marginRight: 12,
        backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center',
        borderWidth: theme.border.width, borderColor: theme.colors.text, overflow: 'hidden',
      }}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} />
        ) : (
          <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{name?.[0]?.toUpperCase() || '?'}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={theme.typography.h4} numberOfLines={1}>{name}</Text>
        {sub ? <Text style={theme.typography.caption} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {trailing}
    </Card>
  );
}

export default function LeaderboardScreen({ navigation }) {
  const [tab, setTab] = useState('readers');
  const { data, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/leaderboard').then((r) => r.data.data || {}),
    []
  );

  const rows = tab === 'readers' ? data?.topReaders : tab === 'contributors' ? data?.topContributors : data?.topStories;

  return (
    <Screen title="Leaderboard" subtitle="The most devoted seekers & storytellers" scroll refreshing={refreshing} onRefresh={refresh}>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        {TABS.map((t) => (
          <Chip key={t.id} label={t.label} active={tab === t.id} onPress={() => setTab(t.id)} />
        ))}
      </View>

      {status === 'loading' ? (
        <SkeletonList count={6} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : !rows || rows.length === 0 ? (
        <EmptyState icon="trophy-outline" title="Nothing to rank yet" subtitle="Read, write and share tales to appear here." />
      ) : tab === 'readers' ? (
        rows.map((u, i) => (
          <RankRow key={u._id} index={i} avatarUrl={u.avatar?.url} name={u.name}
            sub={`@${u.username} · ${u.countriesExplored?.length || 0} countries explored`}
            trailing={<PillBadge label={`${u.storiesRead || 0} read`} tone="accent" />}
            onPress={(u.role === 'contributor' || u.role === 'admin') ? () => navigation.navigate('PublicProfile', { username: u.username }) : undefined} />
        ))
      ) : tab === 'contributors' ? (
        rows.map((u, i) => (
          <RankRow key={u._id} index={i} avatarUrl={u.avatar?.url} name={u.name}
            sub={`@${u.username} · ${u.totalLikesReceived || 0} likes received`}
            trailing={<PillBadge label={`${u.storiesWritten || 0} tales`} tone="accent" />}
            onPress={() => navigation.navigate('PublicProfile', { username: u.username })} />
        ))
      ) : (
        rows.map((s, i) => (
          <RankRow key={s._id} index={i} avatarUrl={s.coverImage?.url} name={s.title}
            sub={`${getCategory(s.category)?.icon || ''} ${s.country}`}
            trailing={<PillBadge label={`👁 ${s.views?.toLocaleString() || 0}`} />}
            onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
        ))
      )}
    </Screen>
  );
}
