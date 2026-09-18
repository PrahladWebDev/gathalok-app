import React from 'react';
import { View, Text } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PillBadge from '../components/PillBadge';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import useFocusedFetch from '../hooks/useFocusedFetch';
import api from '../api/client';

export default function AchievementsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { data, status, refreshing, refresh, reload } = useFocusedFetch(
    () => api.get('/achievements').then((r) => r.data.data || []),
    []
  );
  const all = data || [];

  const unlockedIds = new Set((user?.achievements || []).map((a) => a.achievementId?._id || a.achievementId));

  return (
    <Screen
      title="Achievements"
      subtitle={status === 'ready' ? `${unlockedIds.size} of ${all.length} unlocked` : undefined}
      scroll
      refreshing={refreshing}
      onRefresh={refresh}
    >
      {status === 'loading' ? (
        <SkeletonGrid count={6} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : all.length === 0 ? (
        <EmptyState icon="trophy-outline" title="No achievements yet" subtitle="Badges will appear here as they are added." />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {all.map((a) => {
            const unlocked = unlockedIds.has(a._id);
            return (
              <Card
                key={a._id}
                accessibilityLabel={`${a.title}, ${unlocked ? 'unlocked' : 'locked'}`}
                style={{ width: '48%', alignItems: 'center', marginBottom: 12, opacity: unlocked ? 1 : 0.45, paddingVertical: 18 }}
              >
                <Text style={{ fontSize: 30 }}>{a.icon || '🏆'}</Text>
                <Text style={[theme.typography.h4, { marginTop: 8, textAlign: 'center' }]} numberOfLines={2}>{a.title}</Text>
                <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 4 }]} numberOfLines={2}>{a.description}</Text>
                <PillBadge label={`+${a.xpValue || 0} XP`} tone={unlocked ? 'accent' : 'neutral'} style={{ marginTop: 8 }} />
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
