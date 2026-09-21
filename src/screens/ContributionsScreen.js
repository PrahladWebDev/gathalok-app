import React from 'react';
import { View, Text } from 'react-native';
import Screen from '../components/Screen';
import MagicalTitle from '../components/MagicalTitle';
import Card from '../components/Card';
import PillBadge from '../components/PillBadge';
import Button from '../components/Button';
import IconButton from '../components/IconButton';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';

const STATUS_TONE = {
  approved: 'success',
  pending: 'info',
  draft: 'neutral',
  rejected: 'danger',
  changes_requested: 'danger',
};

export default function ContributionsScreen({ navigation }) {
  const theme = useTheme();
  const { user } = useAuth();
  // Refetches on focus, so a story you just submitted or edited shows up
  // the moment you land back here (this screen stays mounted in the stack,
  // so a one-time useEffect fetch went stale after every submission).
  const { data: stories, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/stories', { params: { contributor: user._id, status: 'all', limit: 30 } }).then((r) => r.data.data || []),
    [user?._id]
  );

  return (
    <Screen
      titleNode={<MagicalTitle title="My Contributions" subtitle={status === 'ready' && stories.length ? `${stories.length} ${stories.length === 1 ? 'tale' : 'tales'}` : undefined} />}
      scroll
      refreshing={refreshing}
      onRefresh={refresh}
      right={<IconButton name="add" label="Submit a new story" variant="filled" onPress={() => navigation.navigate('Contribute')} />}
    >
      {status === 'loading' ? (
        <SkeletonList count={5} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : stories.length === 0 ? (
        <EmptyState
          icon="create-outline"
          title="No stories submitted yet"
          subtitle="Share a legend from your part of the world."
          action={{ label: 'Submit Your First Story', onPress: () => navigation.navigate('Contribute') }}
        />
      ) : (
        stories.map((s) => (
          <Card
            key={s._id}
            onPress={() => (s.status === 'approved'
              ? navigation.navigate('StoryDetail', { slug: s.slug })
              : navigation.navigate('ContributeEdit', { id: s._id }))}
            accessibilityLabel={`${s.title}, ${String(s.status).replace('_', ' ')}`}
            style={{ marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[theme.typography.h4, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{s.title}</Text>
              <PillBadge label={String(s.status).replace('_', ' ')} tone={STATUS_TONE[s.status] || 'neutral'} />
            </View>
            <Text style={[theme.typography.caption, { marginTop: 4 }]}>📍 {s.country} · 👁 {s.views || 0} views</Text>
            {s.adminNote ? <Text style={[theme.typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>Note: {s.adminNote}</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              {s.status !== 'approved' ? (
                <Button title="Edit" size="sm" variant="outline" icon="create-outline" onPress={() => navigation.navigate('ContributeEdit', { id: s._id })} />
              ) : (
                <Button title="View" size="sm" variant="outline" icon="book-outline" onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
              )}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
