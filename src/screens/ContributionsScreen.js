import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PillBadge from '../components/PillBadge';
import Button from '../components/Button';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
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
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/stories', { params: { contributor: user._id, status: 'all', limit: 30 } })
      .then((r) => setStories(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <Screen
      title="My Contributions"
      scroll
      right={
        <TouchableOpacity onPress={() => navigation.navigate('Contribute')}>
          <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>+ New</Text>
        </TouchableOpacity>
      }
    >
      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : stories.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 30 }}>
          <Text style={{ fontSize: 24 }}>✍️</Text>
          <Text style={[theme.typography.h3, { marginTop: 8 }]}>No stories submitted yet</Text>
          <Button title="Submit Your First Story" style={{ marginTop: 14 }} onPress={() => navigation.navigate('Contribute')} />
        </Card>
      ) : (
        stories.map((s) => (
          <Card
            key={s._id}
            onPress={() => (s.status === 'approved'
              ? navigation.navigate('StoryDetail', { slug: s.slug })
              : navigation.navigate('ContributeEdit', { id: s._id }))}
            style={{ marginBottom: 10 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[theme.typography.h4, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{s.title}</Text>
              <PillBadge label={s.status} tone={STATUS_TONE[s.status] || 'neutral'} />
            </View>
            <Text style={[theme.typography.caption, { marginTop: 4 }]}>📍 {s.country} · 👁 {s.views || 0} views</Text>
            {s.adminNote ? <Text style={[theme.typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>Note: {s.adminNote}</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              {s.status !== 'approved' ? (
                <Button title="Edit" size="sm" variant="outline" onPress={() => navigation.navigate('ContributeEdit', { id: s._id })} />
              ) : (
                <Button title="View" size="sm" variant="outline" onPress={() => navigation.navigate('StoryDetail', { slug: s.slug })} />
              )}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
