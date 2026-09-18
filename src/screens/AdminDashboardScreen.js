import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { SkeletonGrid } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

function StatCard({ label, value, theme }) {
  return (
    <Card style={{ width: '48%', marginBottom: 12, alignItems: 'center', paddingVertical: 18 }}>
      <Text style={theme.typography.h1}>{value}</Text>
      <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 4 }]}>{label}</Text>
    </Card>
  );
}

function MenuRow({ icon, label, sub, onPress, theme }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
      <Ionicons name={icon} size={20} color={theme.colors.accent} style={{ width: 28 }} />
      <View style={{ flex: 1 }}>
        <Text style={theme.typography.body}>{label}</Text>
        {sub ? <Text style={theme.typography.caption}>{sub}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textFaint} />
    </TouchableOpacity>
  );
}

export default function AdminDashboardScreen({ navigation }) {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/admin/analytics')
      .then((r) => setData(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Screen title="Admin Dashboard" subtitle="Moderation and platform overview" scroll>
      {loading ? (
        <SkeletonGrid count={4} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
            <StatCard label="Total Stories" value={data.totalStories} theme={theme} />
            <StatCard label="Approved" value={data.totalApproved} theme={theme} />
            <StatCard label="Pending Review" value={data.totalPending} theme={theme} />
            <StatCard label="Active Users" value={data.totalUsers} theme={theme} />
          </View>

          <Card style={{ marginBottom: 20 }}>
            <Text style={[theme.typography.h4, { marginBottom: 8 }]}>Highlights</Text>
            <Text style={theme.typography.bodyMuted}>👁 {data.totalViews?.toLocaleString() || 0} total views across approved stories</Text>
            <Text style={theme.typography.bodyMuted}>🌍 Top country: {data.topCountry}</Text>
            <Text style={theme.typography.bodyMuted}>🏷 Top category: {data.topCategory}</Text>
            {data.topStory ? <Text style={theme.typography.bodyMuted}>🔥 Top story: {data.topStory.title} ({data.topStory.views} views)</Text> : null}
            {data.topContributor ? <Text style={theme.typography.bodyMuted}>✍️ Top contributor: {data.topContributor.name} ({data.topContributor.storiesWritten} stories)</Text> : null}
          </Card>

          <Card style={{ paddingVertical: 4 }}>
            <MenuRow
              icon="hourglass-outline"
              label="Pending Stories"
              sub={`${data.totalPending} awaiting review`}
              onPress={() => navigation.navigate('AdminPendingStories')}
              theme={theme}
            />
            <MenuRow
              icon="flag-outline"
              label="Reports"
              sub="User-flagged stories & comments"
              onPress={() => navigation.navigate('AdminReports')}
              theme={theme}
            />
            <MenuRow
              icon="people-outline"
              label="Users"
              sub="Roles & blocking"
              onPress={() => navigation.navigate('AdminUsers')}
              theme={theme}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}
