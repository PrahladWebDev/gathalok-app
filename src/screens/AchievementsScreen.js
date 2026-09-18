import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PillBadge from '../components/PillBadge';
import { SkeletonGrid } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AchievementsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const unlockedIds = new Set((user?.achievements || []).map((a) => a.achievementId?._id || a.achievementId));

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/achievements')
      .then((r) => setAll(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <Screen title="Achievements" subtitle={`${unlockedIds.size} of ${all.length} unlocked`} scroll>
      {loading ? (
        <SkeletonGrid count={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {all.map((a) => {
            const unlocked = unlockedIds.has(a._id);
            return (
              <Card key={a._id} style={{ width: '48%', alignItems: 'center', marginBottom: 12, opacity: unlocked ? 1 : 0.45, paddingVertical: 18 }}>
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
