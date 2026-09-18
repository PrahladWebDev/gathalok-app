import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Chip from '../components/Chip';
import StoryCard from '../components/StoryCard';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { SkeletonGrid } from '../components/Skeleton';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import { CATEGORIES } from '../data/categories';

const SORTS = [
  { value: '-createdAt', label: 'Newest' },
  { value: '-views', label: 'Most Viewed' },
  { value: '-averageRating', label: 'Top Rated' },
  { value: 'title', label: 'A–Z' },
];

export default function ExploreScreen({ navigation, route }) {
  const theme = useTheme();
  const [search, setSearch] = useState(route.params?.search || '');
  const [category, setCategory] = useState(route.params?.category || '');
  const [country, setCountry] = useState(route.params?.country || '');
  const [tag, setTag] = useState(route.params?.tag || '');
  const [sort, setSort] = useState(route.params?.sort || '-createdAt');
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const debounceRef = useRef(null);

  // Picking a category/country/tag from another screen passes route params on
  // an already-mounted screen — React Navigation doesn't remount, so listen
  // for param changes instead of only reading them once.
  useEffect(() => {
    if (route.params?.category !== undefined) setCategory(route.params.category);
    if (route.params?.search !== undefined) setSearch(route.params.search);
    if (route.params?.sort !== undefined) setSort(route.params.sort);
    if (route.params?.country !== undefined) setCountry(route.params.country);
    if (route.params?.tag !== undefined) setTag(route.params.tag);
  }, [route.params]);

  // silent: refetch page 1 without dropping back to the skeleton (pull-to-refresh).
  const fetchStories = useCallback(async (pageNum = 1, append = false, silent = false) => {
    if (append) setLoadingMore(true); else if (!silent) setLoading(true);
    if (!append) setError(false);
    try {
      const params = { page: pageNum, limit: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (country) params.country = country;
      if (tag) params.tag = tag;
      const res = await api.get('/stories', { params });
      setStories((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
      setPages(res.data.pagination?.pages || 1);
      setTotal(res.data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err) {
      // A failed request must not look like "no results" — track it separately.
      if (!append) { setStories([]); setError(true); }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, category, country, tag, sort]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStories(1, false), search ? 450 : 0);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, country, tag, sort]);

  const loadMore = () => {
    if (loadingMore || page >= pages) return;
    fetchStories(page + 1, true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStories(1, false, true);
    setRefreshing(false);
  };

  const hasFilters = !!search || !!category || !!country || !!tag || sort !== '-createdAt';
  const clearFilters = () => { setSearch(''); setCategory(''); setCountry(''); setTag(''); setSort('-createdAt'); };

  const Header = (
    <View>
      <Input
        placeholder="Title, creature, place…"
        value={search}
        onChangeText={setSearch}
        leftIcon="search-outline"
        containerStyle={{ marginBottom: 10 }}
      />
      {country || tag ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
          {country ? <Chip label={`📍 ${country}`} active onPress={() => setCountry('')} icon="close" /> : null}
          {tag ? <Chip label={`#${tag}`} active onPress={() => setTag('')} icon="close" /> : null}
        </View>
      ) : null}
      <FlatList
        data={[{ slug: '', name: 'All' }, ...CATEGORIES]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c.slug || 'all'}
        renderItem={({ item }) => (
          <Chip
            label={item.icon ? `${item.icon} ${item.name}` : item.name}
            active={category === item.slug}
            onPress={() => setCategory(category === item.slug ? '' : item.slug)}
          />
        )}
        style={{ marginBottom: 10, flexGrow: 0 }}
      />
      <FlatList
        data={SORTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.value}
        renderItem={({ item }) => (
          <Chip small label={item.label} active={sort === item.value} onPress={() => setSort(item.value)} />
        )}
        style={{ marginBottom: 14, flexGrow: 0 }}
      />
      {loading ? <SkeletonGrid count={6} /> : null}
    </View>
  );

  return (
    <Screen title="Explore" subtitle={loading ? 'Searching the archives…' : `${total.toLocaleString()} stories`} padded>
      {!loading && stories.length === 0 ? (
        <View style={{ flex: 1 }}>
          {Header}
          {error ? (
            <ErrorState onRetry={() => fetchStories(1, false)} />
          ) : (
            <EmptyState
              icon="moon-outline"
              title="No stories found"
              subtitle={hasFilters ? 'Try adjusting your filters or search for something else.' : 'The archive is quiet for now. Check back soon.'}
              action={hasFilters ? { label: 'Clear filters', onPress: clearFilters } : undefined}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={loading ? [] : stories}
          keyExtractor={(s) => s._id}
          renderItem={({ item }) => (
            <StoryCard story={item} onPress={() => navigation.navigate('StoryDetail', { slug: item.slug })} />
          )}
          ListHeaderComponent={Header}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} colors={[theme.colors.accent]} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          contentContainerStyle={{ paddingBottom: theme.layout.tabBarInset }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.colors.accent} style={{ marginVertical: 16 }} /> : null}
        />
      )}
    </Screen>
  );
}
