import React from 'react';
import Screen from '../components/Screen';
import StoryCard from '../components/StoryCard';
import EmptyState from '../components/EmptyState';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';

export default function HistoryScreen({ navigation }) {
  const { data: history, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/users/reading-history').then((r) => r.data.data || []),
    []
  );

  return (
    <Screen title="Reading History" scroll refreshing={refreshing} onRefresh={refresh}>
      {status === 'loading' ? (
        <SkeletonList count={5} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : history.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No reading history yet"
          subtitle="Stories you open will show up here."
          action={{ label: 'Explore stories', onPress: () => navigation.navigate('ExploreTab') }}
        />
      ) : (
        history.map((h, i) => (
          <StoryCard
            key={h.story?._id || i}
            story={h.story}
            size="compact"
            onPress={() => navigation.navigate('StoryDetail', { slug: h.story?.slug })}
          />
        ))
      )}
    </Screen>
  );
}
