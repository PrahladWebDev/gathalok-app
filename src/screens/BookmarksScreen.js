import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Button from '../components/Button';
import StoryCard from '../components/StoryCard';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const ALL = 'All Bookmarks';

function MoveSheet({ visible, collections, onClose, onMove, onCreate }) {
  const theme = useTheme();
  const [newName, setNewName] = useState('');
  if (!visible) return null;
  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100,
    }}>
      <Card style={{ width: '100%' }}>
        <Text style={theme.typography.h3}>Move to Collection</Text>
        <View style={{ marginTop: 12 }}>
          {collections.map((c) => (
            <TouchableOpacity key={c} onPress={() => onMove(c)} style={{ paddingVertical: 10 }}>
              <Text style={theme.typography.body}>{c === ALL ? '🔖' : '📁'} {c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="New collection name…"
            placeholderTextColor={theme.colors.textFaint}
            style={{
              flex: 1, borderWidth: theme.border.width, borderColor: theme.colors.border,
              borderRadius: theme.radius.md, padding: 10, color: theme.colors.text, marginRight: 8,
            }}
            onSubmitEditing={() => { if (newName.trim()) { onMove(newName.trim()); onCreate(newName.trim()); setNewName(''); } }}
          />
        </View>
        <Button title="Cancel" variant="ghost" onPress={onClose} style={{ marginTop: 14 }} />
      </Card>
    </View>
  );
}

export default function BookmarksScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([ALL]);
  const [active, setActive] = useState(ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [moveTarget, setMoveTarget] = useState(null); // storyId | null

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/bookmarks')
      .then((r) => { setBookmarks(r.data.data || []); setCollections(r.data.collections || [ALL]); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = active === ALL ? bookmarks : bookmarks.filter((b) => (b.collection || ALL) === active);

  const createCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      await api.post('/bookmarks/collections', { name });
      setCollections((prev) => [...new Set([...prev, name])]);
      setActive(name);
      setNewCollectionName('');
      setCreating(false);
    } catch (err) {
      toast(err.message || 'Failed to create collection.', 'error');
    }
  };

  const moveBookmark = async (storyId, collection) => {
    try {
      await api.patch(`/bookmarks/${storyId}/move`, { collection });
      setBookmarks((prev) => prev.map((b) => ((b.story?._id || b.story) === storyId ? { ...b, collection } : b)));
      setCollections((prev) => [...new Set([...prev, collection])]);
      setMoveTarget(null);
      toast(`Moved to ${collection}.`);
    } catch (err) {
      toast('Failed to move bookmark.', 'error');
    }
  };

  const removeBookmark = async (storyId) => {
    try {
      await api.post(`/bookmarks/${storyId}`);
      setBookmarks((prev) => prev.filter((b) => (b.story?._id || b.story) !== storyId));
    } catch (err) {
      toast('Failed to remove bookmark.', 'error');
    }
  };

  return (
    <Screen title="Bookmarks" scroll>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
        {collections.map((c) => (
          <Chip
            key={c}
            label={`${c === ALL ? '🔖' : '📁'} ${c} (${c === ALL ? bookmarks.length : bookmarks.filter((b) => (b.collection || ALL) === c).length})`}
            active={active === c}
            onPress={() => setActive(c)}
          />
        ))}
        {!creating ? (
          <TouchableOpacity onPress={() => setCreating(true)} style={{ justifyContent: 'center', paddingHorizontal: 10 }}>
            <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>+ New Collection</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TextInput
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Collection name"
              placeholderTextColor={theme.colors.textFaint}
              autoFocus
              onSubmitEditing={createCollection}
              style={{
                borderWidth: theme.border.width, borderColor: theme.colors.border, borderRadius: theme.radius.md,
                padding: 8, color: theme.colors.text, marginRight: 8, minWidth: 140,
              }}
            />
            <TouchableOpacity onPress={createCollection} style={{ marginRight: 10 }}>
              <Text style={{ color: theme.colors.accent, fontWeight: '700' }}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreating(false)}>
              <Ionicons name="close" size={18} color={theme.colors.textFaint} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : filtered.length === 0 ? (
        <ErrorState
          icon="bookmark-outline"
          title={active === ALL ? 'No bookmarks yet' : 'Collection is empty'}
          message={active === ALL ? 'Stories you bookmark will appear here.' : 'Move bookmarks here from other collections.'}
        />
      ) : (
        filtered.map((b) => b.story ? (
          <View key={b._id} style={{ marginBottom: 4 }}>
            <StoryCard story={b.story} size="compact" onPress={() => navigation.navigate('StoryDetail', { slug: b.story.slug })} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -6, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setMoveTarget(b.story._id)} style={{ marginRight: 16 }}>
                <Text style={theme.typography.small}>📁 Move</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeBookmark(b.story._id)}>
                <Text style={[theme.typography.small, { color: theme.colors.danger }]}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null)
      )}

      <MoveSheet
        visible={!!moveTarget}
        collections={collections}
        onClose={() => setMoveTarget(null)}
        onMove={(c) => moveBookmark(moveTarget, c)}
        onCreate={(name) => setCollections((prev) => [...new Set([...prev, name])])}
      />
    </Screen>
  );
}
