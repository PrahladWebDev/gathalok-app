import React, { useEffect, useState } from 'react';
import Screen from '../components/Screen';
import StoryCard from '../components/StoryCard';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import api from '../api/client';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/users/reading-history')
      .then((r) => setHistory(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <Screen title="Reading History" scroll>
      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : history.length === 0 ? (
        <ErrorState icon="time-outline" title="No reading history yet" message="Stories you open will show up here." />
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
