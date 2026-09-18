import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import PillBadge from '../components/PillBadge';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const REASON_LABEL = {
  spam: 'Spam', inaccurate: 'Inaccurate', offensive: 'Offensive', copyright: 'Copyright', other: 'Other',
};

export default function AdminReportsScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/admin/reports')
      .then((r) => setReports(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id, status) => {
    try {
      await api.patch(`/admin/reports/${id}`, { status });
      setReports((prev) => prev.filter((r) => r._id !== id));
      toast(status === 'dismissed' ? 'Report dismissed.' : 'Report marked reviewed.');
    } catch (err) {
      toast(err.message || 'Failed to update report.', 'error');
    }
  };

  return (
    <Screen title="Reports" subtitle={`${reports.length} pending`} scroll>
      {loading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : reports.length === 0 ? (
        <ErrorState icon="shield-checkmark-outline" title="No reports pending" message="Nothing flagged by the community right now." />
      ) : (
        reports.map((r) => (
          <Card key={r._id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <PillBadge label={r.targetType} tone="neutral" />
              <PillBadge label={REASON_LABEL[r.reason] || r.reason} tone="danger" />
            </View>
            <TouchableOpacity
              disabled={r.targetType !== 'story' || !r.targetId?.slug}
              onPress={() => r.targetId?.slug && navigation.navigate('StoryDetail', { slug: r.targetId.slug })}
              style={{ marginTop: 10 }}
            >
              <Text style={theme.typography.h4}>{r.targetId?.title || '(content no longer exists)'}</Text>
            </TouchableOpacity>
            <Text style={[theme.typography.caption, { marginTop: 4 }]}>
              Reported by {r.reporter?.name || 'Unknown'} (@{r.reporter?.username}) on {new Date(r.createdAt).toLocaleDateString()}
            </Text>
            {r.description ? <Text style={[theme.typography.bodyMuted, { marginTop: 6 }]}>"{r.description}"</Text> : null}
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <Button title="Dismiss" size="sm" variant="outline" onPress={() => resolve(r._id, 'dismissed')} style={{ marginRight: 8 }} />
              <Button title="Mark Reviewed" size="sm" onPress={() => resolve(r._id, 'reviewed')} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
