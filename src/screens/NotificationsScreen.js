import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';

const TYPE_ICONS = {
  story_approved: '✅', story_rejected: '❌', story_changes: '✏️', story_resubmitted: '🔄',
  comment: '💬', reply: '↩️', like: '♥', achievement: '🏆', feature: '⭐', announcement: '📢',
};

export default function NotificationsScreen({ navigation }) {
  const theme = useTheme();
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all | unread
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback((f) => {
    setLoading(true);
    setError(false);
    const params = f === 'unread' ? { unreadOnly: true } : {};
    api.get('/notifications', { params })
      .then((r) => { setNotifs(r.data.data || []); setUnreadCount(r.data.unreadCount || 0); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const markRead = async (ids) => {
    setNotifs((prev) => prev.map((n) => (ids === 'all' || ids.includes(n._id) ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => (ids === 'all' ? 0 : Math.max(0, prev - ids.length)));
    try { await api.patch('/notifications/read', { ids }); } catch (err) {}
  };

  const openNotif = async (n) => {
    if (!n.isRead) markRead([n._id]);
    // link is a relative web path like /stories/:slug — pull the slug out for native nav.
    const match = n.link?.match(/\/stories\/([^/?]+)/);
    if (match) navigation.navigate('StoryDetail', { slug: match[1] });
  };

  return (
    <Screen
      title="Notifications"
      subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : undefined}
      scroll
      right={unreadCount > 0 ? (
        <TouchableOpacity onPress={() => markRead('all')}>
          <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>✓ Mark all read</Text>
        </TouchableOpacity>
      ) : null}
    >
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label={`Unread${unreadCount ? ` (${unreadCount})` : ''}`} active={filter === 'unread'} onPress={() => setFilter('unread')} />
      </View>

      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState onRetry={() => load(filter)} />
      ) : notifs.length === 0 ? (
        <ErrorState
          icon="notifications-outline"
          title={filter === 'unread' ? "You're all caught up" : 'No notifications yet'}
          message={filter === 'unread' ? undefined : "You'll be notified when your stories get approved, receive comments, or you earn achievements."}
          onRetry={filter === 'unread' ? () => setFilter('all') : undefined}
        />
      ) : (
        notifs.map((n) => (
          <Card
            key={n._id}
            onPress={() => openNotif(n)}
            style={{
              flexDirection: 'row', marginBottom: 10,
              backgroundColor: n.isRead ? theme.colors.surface : theme.colors.accentSoft,
            }}
          >
            <Text style={{ fontSize: 22, marginRight: 12 }}>{TYPE_ICONS[n.type] || '🔔'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={theme.typography.h4}>{n.title}</Text>
              <Text style={[theme.typography.bodyMuted, { marginTop: 2 }]} numberOfLines={2}>{n.message}</Text>
              <Text style={[theme.typography.small, { marginTop: 4 }]}>{new Date(n.createdAt).toLocaleDateString()}</Text>
            </View>
            {!n.isRead ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.accent, marginLeft: 8, marginTop: 4 }} /> : null}
          </Card>
        ))
      )}
    </Screen>
  );
}
