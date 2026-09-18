import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Button from '../components/Button';
import PillBadge from '../components/PillBadge';
import Input from '../components/Input';
import Stars from '../components/Stars';
import StoryCard from '../components/StoryCard';
import { DetailSkeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import ActionSheet from '../components/ActionSheet';
import IconButton from '../components/IconButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { getCategory } from '../data/categories';
import { haptic } from '../utils/haptics';

// Report reasons, shown in a bottom ActionSheet (a real Modal, so it sits
// above the scroll view and the tab bar on every platform).
const REPORT_REASONS = [
  { value: 'spam', label: 'Spam', icon: 'megaphone-outline' },
  { value: 'inaccurate', label: 'Inaccurate', icon: 'alert-circle-outline' },
  { value: 'offensive', label: 'Offensive', icon: 'hand-left-outline' },
  { value: 'copyright', label: 'Copyright', icon: 'document-lock-outline' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

function ReadingText({ text, style }) {
  const theme = useTheme();
  if (!text) return null;
  // Source content often has a line break after nearly every sentence.
  // React Native renders every \n as a real visual line, unlike a browser
  // (which collapses whitespace) — so naive rendering produces a wall of
  // disconnected one-liners instead of flowing prose. Fix: treat a blank
  // line as a real paragraph break, and collapse any other line break
  // (a soft wrap in the source) into a normal space.
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <Text key={i} style={[theme.typography.body, { fontSize: 16, lineHeight: 27 }, style, i > 0 && { marginTop: 14 }]}>{p}</Text>
      ))}
    </>
  );
}

function CommentItem({ comment, onLike, onDelete, onReport, requireAuth, storyId, currentUserId, depth = 0 }) {
  const theme = useTheme();
  const toast = useToast();
  const mine = currentUserId && comment.author?._id === currentUserId;
  const isReply = depth > 0;
  const avatarSize = isReply ? 28 : 36;

  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await api.get(`/comments/${storyId}`, { params: { parent: comment._id } });
      setReplies(res.data.data || []);
      setRepliesLoaded(true);
      setShowReplies(true);
    } catch (err) { toast('Failed to load replies.', 'error'); }
    setLoadingReplies(false);
  };

  const toggleReplies = () => {
    if (showReplies) { setShowReplies(false); return; }
    if (repliesLoaded) { setShowReplies(true); return; }
    fetchReplies();
  };

  const submitReply = async () => {
    if (!requireAuth()) return;
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await api.post(`/comments/${storyId}`, { content: replyText.trim(), parent: comment._id });
      setReplyCount((c) => c + 1);
      if (repliesLoaded) {
        setReplies((prev) => [res.data.data, ...prev]);
        setShowReplies(true);
      } else {
        // Older replies haven't been fetched yet — load the full list
        // (it already includes the new one) instead of showing just one.
        await fetchReplies();
      }
      setReplyText('');
      setShowReplyBox(false);
      toast('Reply posted!');
    } catch (err) { toast('Failed to post reply.', 'error'); }
    setReplyLoading(false);
  };

  const likeReply = async (id) => {
    const count = await onLike(id);
    if (typeof count === 'number') {
      setReplies((prev) => prev.map((r) => (r._id === id ? { ...r, likeCount: count } : r)));
    }
  };

  const deleteReply = async (id) => {
    const ok = await onDelete(id);
    if (ok) {
      setReplies((prev) => prev.filter((r) => r._id !== id));
      setReplyCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      <View style={{
        width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: theme.colors.accentSoft,
        alignItems: 'center', justifyContent: 'center', marginRight: 10,
        borderWidth: theme.border.width, borderColor: theme.colors.text,
      }}>
        {comment.author?.avatar?.url ? (
          <Image source={{ uri: comment.author.avatar.url }} style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }} />
        ) : (
          <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{comment.author?.name?.[0]?.toUpperCase() || '?'}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={theme.typography.h4}>{comment.author?.name || 'Anonymous'}</Text>
          <Text style={theme.typography.small}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
        </View>
        <Text style={[theme.typography.body, { marginTop: 2 }]}>{comment.content}</Text>
        <View style={{ flexDirection: 'row', marginTop: 6, flexWrap: 'wrap' }}>
          <TouchableOpacity
            onPress={() => onLike(comment._id)}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={`Like comment, ${comment.likeCount || 0} likes`}
            style={{ marginRight: 16, minHeight: 32, justifyContent: 'center' }}
          >
            <Text style={theme.typography.small}>♥ {comment.likeCount || 0}</Text>
          </TouchableOpacity>
          {!isReply ? (
            <TouchableOpacity
              onPress={() => {
                if (!showReplyBox && !requireAuth()) return;
                setShowReplyBox((v) => !v);
              }}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={showReplyBox ? 'Cancel reply' : 'Reply to comment'}
              style={{ marginRight: 16, minHeight: 32, justifyContent: 'center' }}
            >
              <Text style={theme.typography.small}>{showReplyBox ? 'Cancel' : '↩ Reply'}</Text>
            </TouchableOpacity>
          ) : null}
          {mine ? (
            <TouchableOpacity
              onPress={() => onDelete(comment._id)}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Delete comment"
              style={{ marginRight: 16, minHeight: 32, justifyContent: 'center' }}
            >
              <Text style={[theme.typography.small, { color: theme.colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onReport(comment._id, 'comment')}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Report comment"
              style={{ minHeight: 32, justifyContent: 'center' }}
            >
              <Text style={theme.typography.small}>⚑ Report</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isReply && replyCount > 0 ? (
          <TouchableOpacity
            onPress={toggleReplies}
            disabled={loadingReplies}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel={showReplies ? 'Hide replies' : `Show ${replyCount} replies`}
            style={{ minHeight: 32, justifyContent: 'center' }}
          >
            <Text style={[theme.typography.small, { color: theme.colors.accent }]}>
              {loadingReplies ? '…' : showReplies ? '▲ Hide replies' : `▼ ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
            </Text>
          </TouchableOpacity>
        ) : null}

        {showReplyBox ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 6 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                placeholder="Write a reply…"
                value={replyText}
                onChangeText={setReplyText}
                autoFocus
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            {replyLoading ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : (
              <IconButton name="send" label="Post reply" variant="filled" onPress={submitReply} />
            )}
          </View>
        ) : null}

        {showReplies && replies.length > 0 ? (
          <View style={{ marginTop: 10 }}>
            {replies.map((r) => (
              <CommentItem
                key={r._id}
                comment={r}
                onLike={likeReply}
                onDelete={deleteReply}
                onReport={onReport}
                requireAuth={requireAuth}
                storyId={storyId}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function StoryDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const toast = useToast();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [related, setRelated] = useState([]);
  const [reportTarget, setReportTarget] = useState(null); // { id, type } | null
  const [reportLoading, setReportLoading] = useState(false);

  const requireAuth = useCallback(() => {
    if (user) return true;
    navigation.navigate('Auth', { screen: 'Login' });
    return false;
  }, [user, navigation]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/stories/${slug}`);
      const s = res.data.data;
      setStory(s);
      setLikesCount(s.likesCount || 0);
      if (user) setLiked(!!s.likes?.some((id) => id === user._id || id?.toString?.() === user._id));

      api.get(`/comments/${s._id}`).then((r) => setComments(r.data.data || [])).catch(() => {});
      api.get('/stories', { params: { country: s.country, limit: 4 } })
        .then((r) => setRelated((r.data.data || []).filter((x) => x._id !== s._id).slice(0, 3)))
        .catch(() => {});

      if (user) {
        api.get(`/ratings/${s._id}/me`).then((r) => setUserRating(r.data.data?.value || 0)).catch(() => {});
        api.get('/bookmarks').then((r) => {
          setBookmarked(!!r.data.data?.some((b) => (b.story?._id || b.story) === s._id));
        }).catch(() => {});
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => { load(); }, [load]);

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    try {
      const res = await api.post(`/bookmarks/${story._id}`);
      setBookmarked(res.data.bookmarked);
      haptic.success();
      toast(res.data.message || (res.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed'));
    } catch (err) { toast('Failed to bookmark.', 'error'); }
  };

  const handleLike = async () => {
    if (!requireAuth()) return;
    try {
      const res = await api.patch(`/stories/${story._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      haptic.light();
    } catch (err) { toast('Failed to like.', 'error'); }
  };

  const handleRate = async (value) => {
    if (!requireAuth()) return;
    try {
      await api.post(`/ratings/${story._id}`, { value });
      setUserRating(value);
      toast(`Rated ${value} ★`);
    } catch (err) { toast('Failed to rate.', 'error'); }
  };

  const submitComment = async () => {
    if (!requireAuth()) return;
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/comments/${story._id}`, { content: commentText.trim() });
      setComments((prev) => [res.data.data, ...prev]);
      setCommentText('');
      toast('Comment posted!');
    } catch (err) { toast('Failed to post comment.', 'error'); }
    setCommentLoading(false);
  };

  // Return values let reply rows (managed inside CommentItem) update themselves.
  const likeComment = async (id) => {
    if (!requireAuth()) return undefined;
    try {
      const res = await api.patch(`/comments/${id}/like`);
      setComments((prev) => prev.map((c) => (c._id === id ? { ...c, likeCount: res.data.likeCount } : c)));
      return res.data.likeCount;
    } catch (err) { return undefined; }
  };

  const deleteComment = (id) => new Promise((resolve) => {
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comments/${id}`);
            setComments((prev) => prev.filter((c) => c._id !== id));
            haptic.warning();
            toast('Comment deleted.');
            resolve(true);
          } catch (err) { toast('Failed to delete.', 'error'); resolve(false); }
        },
      },
    ], { onDismiss: () => resolve(false) });
  });

  const openReport = (id, type) => {
    if (!requireAuth()) return;
    setReportTarget({ id, type });
  };

  const submitReport = async (reason) => {
    setReportLoading(true);
    try {
      await api.post('/stories/report', { targetId: reportTarget.id, targetType: reportTarget.type, reason });
      toast('Report submitted. Thank you!');
      setReportTarget(null);
    } catch (err) {
      toast(err.message || 'Failed to submit report.', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const handleShare = () => {
    // A real, public https URL — works as a normal link for anyone without
    // the app, and opens the app directly for anyone who has it once
    // Universal Links / App Links are verified on this domain (see README).
    const url = `https://gathalok.prahladsingh.in/stories/${story.slug}`;
    Share.share({ message: `${story.title} — GathaLok\n\n${story.shortDescription}\n\n${url}`, url }).catch(() => {});
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + 12, paddingHorizontal: theme.layout.screenPadding }}>
        <DetailSkeleton />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center' }}>
        <ErrorState icon="skull-outline" title="Story not found" message="This tale may have been lost to time." onRetry={load} />
      </View>
    );
  }

  const category = getCategory(story.category);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {story.coverImage?.url ? (
          <Image source={{ uri: story.coverImage.url }} style={{ width: '100%', height: 260 }} contentFit="cover" />
        ) : null}

        <View style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
          <IconButton name="chevron-back" label="Back" variant="soft" onPress={() => navigation.goBack()} />
          <View style={{ flexDirection: 'row' }}>
            <IconButton name="share-outline" label="Share" variant="soft" onPress={handleShare} style={{ marginRight: 8 }} />
            <IconButton name={bookmarked ? 'bookmark' : 'bookmark-outline'} label="Bookmark" variant="soft" onPress={handleBookmark} />
          </View>
        </View>

        <View style={{ padding: theme.layout.screenPadding }}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {category ? <PillBadge label={`${category.icon} ${category.name}`} tone="accent" style={{ marginRight: 8 }} /> : null}
            {story.isFeatured ? <PillBadge label="⭐ Featured" /> : null}
          </View>

          <Text style={theme.typography.display}>{story.title}</Text>
          {story.alternativeNames?.length > 0 ? (
            <Text style={[theme.typography.bodyMuted, { marginTop: 4 }]}>Also known as: {story.alternativeNames.join(', ')}</Text>
          ) : null}

          {story.contributor ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.accentSoft,
                alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden',
                borderWidth: theme.border.width, borderColor: theme.colors.text,
              }}>
                {story.contributor.avatar?.url ? (
                  <Image source={{ uri: story.contributor.avatar.url }} style={{ width: 36, height: 36 }} />
                ) : (
                  <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{story.contributor.name?.[0]?.toUpperCase()}</Text>
                )}
              </View>
              <View>
                <Text style={theme.typography.small}>Contributed by</Text>
                <Text style={theme.typography.h4}>{story.contributor.name}</Text>
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
            <Text style={[theme.typography.caption, { marginRight: 14 }]}>📍 {story.country}</Text>
            <Text style={[theme.typography.caption, { marginRight: 14 }]}>👁 {story.views?.toLocaleString()} views</Text>
            <Text style={[theme.typography.caption, { marginRight: 14 }]}>💬 {story.totalComments || 0} comments</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Stars value={story.averageRating || 0} size={15} />
            <Text style={[theme.typography.bodyMuted, { marginLeft: 8 }]}>
              {story.averageRating ? story.averageRating.toFixed(1) : 'Unrated'} ({story.totalRatings || 0} ratings)
            </Text>
          </View>

          {/* Like action + your rating */}
          <Button
            title={liked ? `♥ Liked (${likesCount})` : `♡ Like (${likesCount})`}
            variant={liked ? 'primary' : 'outline'}
            onPress={handleLike}
            size="sm"
            style={{ marginTop: 16 }}
          />
          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={[theme.typography.small, { marginBottom: 6 }]}>YOUR RATING</Text>
            <Stars value={userRating} size={26} interactive onRate={handleRate} />
          </View>

          <Card style={{ marginTop: 20 }}>
            <Text style={theme.typography.body}>{story.shortDescription}</Text>
          </Card>

          <Text style={[theme.typography.h2, { marginTop: 24, marginBottom: 8 }]}>The Story</Text>
          <ReadingText text={story.fullStory} />

          {story.origin ? (
            <>
              <Text style={[theme.typography.h3, { marginTop: 20, marginBottom: 6 }]}>Historical Origin</Text>
              <ReadingText text={story.origin} style={{ fontSize: 15, lineHeight: 24, color: theme.colors.textMuted }} />
            </>
          ) : null}

          {story.significance ? (
            <>
              <Text style={[theme.typography.h3, { marginTop: 20, marginBottom: 6 }]}>Cultural Significance</Text>
              <ReadingText text={story.significance} style={{ fontSize: 15, lineHeight: 24, color: theme.colors.textMuted }} />
            </>
          ) : null}

          {story.tags?.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 }}>
              {story.tags.map((t) => (
                <TouchableOpacity key={t} onPress={() => navigation.navigate('Main', { screen: 'ExploreTab', params: { tag: t } })}>
                  <PillBadge label={`#${t}`} tone="accent" style={{ marginRight: 6, marginBottom: 6 }} />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {story.images?.length > 0 ? (
            <>
              <Text style={[theme.typography.h2, { marginTop: 24, marginBottom: 10 }]}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                {story.images.map((img, i) => (
                  <View key={i} style={{ marginRight: 10 }}>
                    <Image source={{ uri: img.url }} style={{ width: 220, height: 150, borderRadius: theme.radius.md }} contentFit="cover" />
                    {img.caption ? <Text style={[theme.typography.small, { marginTop: 4, width: 220 }]}>{img.caption}</Text> : null}
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}

          {story.references?.length > 0 ? (
            <>
              <Text style={[theme.typography.h2, { marginTop: 24, marginBottom: 8 }]}>References</Text>
              {story.references.map((ref, i) => {
                const label = ref.title || ref.url || ref;
                const url = ref.url || (typeof ref === 'string' && ref.startsWith('http') ? ref : null);
                return url ? (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(url).catch(() => {})} style={{ paddingVertical: 4 }}>
                    <Text style={[theme.typography.body, { color: theme.colors.accent }]}>• {label}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text key={i} style={[theme.typography.body, { paddingVertical: 4 }]}>• {label}</Text>
                );
              })}
            </>
          ) : null}

          {/* Owner / community actions */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 }}>
            {user && story.contributor && user._id === story.contributor._id ? (
              <Button
                title="✎ Edit Story"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('Main', { screen: 'ProfileTab', params: { screen: 'ContributeEdit', params: { id: story._id } } })}
                style={{ marginRight: 8, marginBottom: 8 }}
              />
            ) : null}
            {user ? (
              <Button title="⚑ Report Story" variant="ghost" size="sm" onPress={() => openReport(story._id, 'story')} style={{ marginBottom: 8 }} />
            ) : null}
          </View>

          {/* Comments */}
          <Text style={[theme.typography.h2, { marginTop: 28, marginBottom: 12 }]}>Comments ({comments.length})</Text>
          <View style={{ flexDirection: 'row', marginBottom: 18 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                placeholder={user ? 'Share your thoughts…' : 'Sign in to comment'}
                value={commentText}
                onChangeText={setCommentText}
                editable={!!user}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            {commentLoading ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : (
              <IconButton name="send" label="Post comment" variant="filled" onPress={submitComment} />
            )}
          </View>
          {comments.length === 0 ? (
            <Text style={theme.typography.bodyMuted}>No comments yet — be the first to share your thoughts.</Text>
          ) : (
            comments.map((c) => (
              <CommentItem key={c._id} comment={c} onLike={likeComment} onDelete={deleteComment} onReport={openReport} requireAuth={requireAuth} storyId={story._id} currentUserId={user?._id} />
            ))
          )}

          {/* Related */}
          {related.length > 0 ? (
            <>
              <Text style={[theme.typography.h2, { marginTop: 24, marginBottom: 12 }]}>More from {story.country}</Text>
              {related.map((s) => (
                <StoryCard key={s._id} story={s} onPress={() => navigation.push('StoryDetail', { slug: s.slug })} />
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>
      <ActionSheet
        visible={!!reportTarget}
        title={`Report ${reportTarget?.type === 'story' ? 'Story' : 'Comment'}`}
        subtitle="Help us keep GathaLok accurate and respectful. Pick a reason to send the report."
        onClose={() => setReportTarget(null)}
        actions={REPORT_REASONS.map((r) => ({ label: r.label, icon: r.icon, onPress: () => submitReport(r.value) }))}
      />
    </View>
  );
}