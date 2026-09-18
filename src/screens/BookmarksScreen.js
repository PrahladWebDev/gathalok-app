import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Chip from '../components/Chip';
import StoryCard from '../components/StoryCard';
import EmptyState from '../components/EmptyState';
import ActionSheet from '../components/ActionSheet';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import useFocusedFetch from '../hooks/useFocusedFetch';
import { haptic } from '../utils/haptics';
import api from '../api/client';

const ALL = 'All Bookmarks';

// Small labelled action under a bookmark row. 40px tall + hit slop so the
// old 11px "✕ Remove" text is no longer a 14px-high target.
function RowAction({ icon, label, onPress, danger }) {
  const theme = useTheme();
  const color = danger ? theme.colors.danger : theme.colors.textMuted;
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={theme.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', minHeight: 40, paddingHorizontal: 8 }}
    >
      <Ionicons name={icon} size={15} color={color} style={{ marginRight: 4 }} />
      <Text style={[theme.typography.small, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function BookmarksScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const elevated = theme.uiStyle === 'elevated';
  const [active, setActive] = useState(ALL);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [moveTarget, setMoveTarget] = useState(null); // storyId | null
  const [moveNewName, setMoveNewName] = useState('');

  // Refetches on focus so bookmarking / un-bookmarking inside a story is
  // reflected the moment you come back here.
  const { data, status, refreshing, refresh, reload, setData } = useFocusedFetch(
    () => api.get('/bookmarks').then((r) => ({ bookmarks: r.data.data || [], collections: r.data.collections || [ALL] })),
    []
  );
  const bookmarks = data?.bookmarks || [];
  const collections = data?.collections || [ALL];
  const storyIdOf = (b) => b.story?._id || b.story;
  const countIn = (c) => (c === ALL ? bookmarks.length : bookmarks.filter((b) => (b.collection || ALL) === c).length);
  const filtered = active === ALL ? bookmarks : bookmarks.filter((b) => (b.collection || ALL) === active);

  const inputStyle = {
    flex: 1,
    minHeight: 44,
    borderWidth: elevated ? 1 : theme.border.width,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  };

  const createCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      await api.post('/bookmarks/collections', { name });
      setData((prev) => prev && { ...prev, collections: [...new Set([...prev.collections, name])] });
      setActive(name);
      setNewCollectionName('');
      setCreating(false);
      haptic.success();
      toast(`Collection "${name}" created.`);
    } catch (err) {
      haptic.error();
      toast(err.message || 'Failed to create collection.', 'error');
    }
  };

  const moveBookmark = async (storyId, collection) => {
    if (!storyId || !collection) return;
    try {
      await api.patch(`/bookmarks/${storyId}/move`, { collection });
      setData((prev) => prev && {
        bookmarks: prev.bookmarks.map((b) => (storyIdOf(b) === storyId ? { ...b, collection } : b)),
        collections: [...new Set([...prev.collections, collection])],
      });
      setMoveTarget(null);
      setMoveNewName('');
      haptic.success();
      toast(`Moved to ${collection}.`);
    } catch (err) {
      haptic.error();
      toast('Failed to move bookmark.', 'error');
    }
  };

  const removeBookmark = async (storyId) => {
    try {
      await api.post(`/bookmarks/${storyId}`);
      setData((prev) => prev && { ...prev, bookmarks: prev.bookmarks.filter((b) => storyIdOf(b) !== storyId) });
      haptic.warning();
      toast('Bookmark removed.');
    } catch (err) {
      haptic.error();
      toast('Failed to remove bookmark.', 'error');
    }
  };

  return (
    <Screen
      title="Bookmarks"
      subtitle={status === 'ready' && bookmarks.length ? `${bookmarks.length} saved ${bookmarks.length === 1 ? 'tale' : 'tales'}` : undefined}
      scroll
      refreshing={refreshing}
      onRefresh={refresh}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
        {collections.map((c) => (
          <Chip
            key={c}
            label={`${c === ALL ? '🔖' : '📁'} ${c} (${countIn(c)})`}
            active={active === c}
            onPress={() => setActive(c)}
            style={{ marginBottom: 8 }}
          />
        ))}
        {!creating ? (
          <Chip label="New Collection" icon="add" onPress={() => setCreating(true)} style={{ marginBottom: 8 }} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, width: '100%' }}>
            <TextInput
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Collection name"
              placeholderTextColor={theme.colors.textFaint}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={createCollection}
              accessibilityLabel="New collection name"
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={createCollection}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Create collection"
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
            >
              <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setCreating(false); setNewCollectionName(''); }}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={{ minHeight: 44, minWidth: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="close" size={18} color={theme.colors.textFaint} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {status === 'loading' ? (
        <SkeletonList count={5} />
      ) : status === 'error' ? (
        <ErrorState onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="bookmark-outline"
          title={active === ALL ? 'No bookmarks yet' : 'Collection is empty'}
          subtitle={active === ALL ? 'Tap the bookmark icon on any story to save it here.' : 'Move bookmarks here from other collections.'}
          action={active === ALL
            ? { label: 'Explore stories', onPress: () => navigation.navigate('ExploreTab') }
            : { label: 'Show all bookmarks', onPress: () => setActive(ALL) }}
        />
      ) : (
        filtered.map((b) => b.story ? (
          <View key={b._id} style={{ marginBottom: 4 }}>
            <StoryCard story={b.story} size="compact" onPress={() => navigation.navigate('StoryDetail', { slug: b.story.slug })} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -6, marginBottom: 8 }}>
              <RowAction icon="folder-outline" label="Move" onPress={() => setMoveTarget(b.story._id)} />
              <RowAction icon="close-circle-outline" label="Remove" danger onPress={() => removeBookmark(b.story._id)} />
            </View>
          </View>
        ) : null)
      )}

      <ActionSheet
        visible={!!moveTarget}
        title="Move to collection"
        onClose={() => { setMoveTarget(null); setMoveNewName(''); }}
        actions={collections.map((c) => ({
          label: c,
          icon: c === ALL ? 'bookmark-outline' : 'folder-outline',
          onPress: () => moveBookmark(moveTarget, c),
        }))}
      >
        <TextInput
          value={moveNewName}
          onChangeText={setMoveNewName}
          placeholder="Or type a new collection name…"
          placeholderTextColor={theme.colors.textFaint}
          returnKeyType="done"
          onSubmitEditing={() => moveBookmark(moveTarget, moveNewName.trim())}
          accessibilityLabel="New collection name"
          style={[inputStyle, { flex: 0, marginTop: 8, backgroundColor: theme.colors.bg }]}
        />
      </ActionSheet>
    </Screen>
  );
}
