import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import PillBadge from '../components/PillBadge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';
import { CATEGORIES } from '../data/categories';
import { COUNTRIES } from '../data/countries';

const STEPS = ['Basics', 'The Story', 'Media & Tags', 'Review'];
const EMPTY_FORM = {
  title: '', alternativeNames: '', country: '', category: '',
  shortDescription: '', fullStory: '', origin: '', significance: '',
  coverImage: null, tags: '', references: '',
};

function TextArea({ label, hint, value, onChangeText, placeholder, rows = 4, maxLength }) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[theme.typography.label, { marginBottom: 6 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textFaint}
        multiline
        numberOfLines={rows}
        maxLength={maxLength}
        style={{
          borderWidth: theme.border.width, borderColor: theme.colors.border, borderRadius: theme.radius.md,
          padding: 12, minHeight: rows * 20, textAlignVertical: 'top', color: theme.colors.text,
          fontSize: 15, backgroundColor: theme.colors.surface,
        }}
      />
      <Text style={[theme.typography.small, { marginTop: 4, textAlign: 'right' }]}>
        {hint || `${value.length}${maxLength ? `/${maxLength}` : ' characters'}`}
      </Text>
    </View>
  );
}

// Used for both a new submission (no storyId) and editing an existing one
// (storyId + initialStory passed in from ContributionsScreen).
export default function ContributeScreen({ navigation, route }) {
  const theme = useTheme();
  const toast = useToast();
  const { user } = useAuth();
  const storyId = route.params?.id || null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(!!storyId);

  useEffect(() => {
    if (!storyId) return;
    api.get(`/stories/id/${storyId}`)
      .then(({ data }) => {
        const s = data.data;
        setForm({
          title: s.title || '', alternativeNames: (s.alternativeNames || []).join(', '),
          country: s.country || '', category: s.category || '',
          shortDescription: s.shortDescription || '', fullStory: s.fullStory || '',
          origin: s.origin || '', significance: s.significance || '',
          coverImage: s.coverImage || null,
          tags: (s.tags || []).join(', '), references: (s.references || []).join('\n'),
        });
      })
      .catch(() => toast('Could not load this story for editing.', 'error'))
      .finally(() => setLoadingStory(false));
  }, [storyId]);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast('Photo library access is needed to upload a cover.', 'error'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', { uri: asset.uri, name: 'cover.jpg', type: 'image/jpeg' });
      const { data } = await api.post('/upload/story-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((p) => ({ ...p, coverImage: data.data }));
    } catch (err) {
      toast('Image upload failed.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!form.title && !!form.country && !!form.category;
    if (step === 1) return !!form.shortDescription && form.fullStory.length >= 100;
    return true;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    alternativeNames: form.alternativeNames.split(',').map((s) => s.trim()).filter(Boolean),
    country: form.country,
    category: form.category,
    shortDescription: form.shortDescription.trim(),
    fullStory: form.fullStory.trim(),
    origin: form.origin.trim(),
    significance: form.significance.trim(),
    coverImage: form.coverImage,
    tags: form.tags.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
    references: form.references.split('\n').map((s) => s.trim()).filter(Boolean),
  });

  const handleSubmit = async (status) => {
    setLoading(true);
    try {
      const payload = { ...buildPayload(), status };
      if (storyId) {
        await api.put(`/stories/${storyId}`, payload);
        toast('Story updated!');
      } else {
        await api.post('/stories', payload);
        toast(status === 'draft' ? 'Saved as draft.' : 'Submitted for review!');
      }
      navigation.navigate('Contributions');
    } catch (err) {
      toast(err.message || 'Failed to submit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStory) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <Screen title={storyId ? 'Edit Story' : 'Share Your Story'} scroll>
      {/* Step indicator */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        {STEPS.map((s, i) => (
          <View key={s} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
              backgroundColor: i <= step ? theme.colors.accent : theme.colors.border,
            }}>
              <Text style={{ color: i <= step ? theme.colors.onAccent : theme.colors.textFaint, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
            </View>
            <Text style={[theme.typography.small, { marginTop: 4, textAlign: 'center' }]}>{s}</Text>
          </View>
        ))}
      </View>

      {step === 0 && (
        <Card style={{ marginBottom: 16 }}>
          <Input label="Story Title *" value={form.title} onChangeText={set('title')} placeholder="e.g. Bhangarh Fort, The Legend of Vetala" />
          <Input label="Alternative / Local Names" value={form.alternativeNames} onChangeText={set('alternativeNames')} placeholder="Comma-separated" />

          <Text style={[theme.typography.label, { marginBottom: 8 }]}>Country *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                onPress={() => set('country')(c.name)}
                style={[styles.chip, { borderColor: theme.colors.border }, form.country === c.name && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }]}
              >
                <Text style={{ color: form.country === c.name ? theme.colors.onAccent : theme.colors.text, fontSize: 13 }}>{c.emoji} {c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[theme.typography.label, { marginBottom: 8 }]}>Category *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.slug}
                onPress={() => set('category')(cat.slug)}
                style={[styles.catOption, { borderColor: theme.colors.border }, form.category === cat.slug && { backgroundColor: cat.color, borderColor: cat.color }]}
              >
                <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                <Text style={{ color: form.category === cat.slug ? '#fff' : theme.colors.text, fontSize: 11, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {step === 1 && (
        <Card style={{ marginBottom: 16 }}>
          <TextArea label="Short Description * (max 400 chars — appears on cards)" value={form.shortDescription}
            onChangeText={(v) => set('shortDescription')(v.slice(0, 400))} rows={3} maxLength={400}
            placeholder="A compelling one-paragraph summary…" />
          <TextArea label="Full Story * (min 100 chars)" value={form.fullStory} onChangeText={set('fullStory')} rows={12}
            placeholder="Write the complete legend here. Include dialogue, historical context, the supernatural elements, and why it matters…" />
          <TextArea label="Historical Origin" value={form.origin} onChangeText={set('origin')} rows={3}
            placeholder="When and where did this legend originate?" />
          <TextArea label="Cultural Significance" value={form.significance} onChangeText={set('significance')} rows={3}
            placeholder="Why does this story matter to the community?" />
        </Card>
      )}

      {step === 2 && (
        <Card style={{ marginBottom: 16 }}>
          <Text style={[theme.typography.label, { marginBottom: 8 }]}>Cover Image</Text>
          {form.coverImage ? (
            <View style={{ marginBottom: 16 }}>
              <Image source={{ uri: form.coverImage.url }} style={{ width: '100%', height: 160, borderRadius: theme.radius.md }} contentFit="cover" />
              <Button title="Remove" variant="outline" size="sm" onPress={() => set('coverImage')(null)} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <TouchableOpacity onPress={pickImage} disabled={uploadingImage} style={[styles.uploadZone, { borderColor: theme.colors.border }]}>
              {uploadingImage ? (
                <ActivityIndicator color={theme.colors.accent} />
              ) : (
                <>
                  <Text style={{ fontSize: 26 }}>🖼</Text>
                  <Text style={[theme.typography.body, { marginTop: 6 }]}>Tap to upload cover image</Text>
                  <Text style={theme.typography.small}>JPG, PNG or WebP · Max 5MB</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <Input label="Tags (comma-separated)" value={form.tags} onChangeText={set('tags')} placeholder="ghost, fort, rajasthan, haunted" containerStyle={{ marginTop: 16 }} />
          <TextArea label="References (one per line)" value={form.references} onChangeText={set('references')} rows={3} placeholder="Books, articles, or websites you used." />
        </Card>
      )}

      {step === 3 && (
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.reviewRow}><Text style={theme.typography.bodyMuted}>Title</Text><Text style={theme.typography.h4}>{form.title || '—'}</Text></View>
          <View style={styles.reviewRow}><Text style={theme.typography.bodyMuted}>Country</Text><Text style={theme.typography.body}>{form.country || '—'}</Text></View>
          <View style={styles.reviewRow}><Text style={theme.typography.bodyMuted}>Story Length</Text><Text style={theme.typography.body}>{form.fullStory.length} characters</Text></View>
          <View style={styles.reviewRow}><Text style={theme.typography.bodyMuted}>Cover Image</Text><Text style={theme.typography.body}>{form.coverImage ? '✅ Uploaded' : '⚠ None (optional)'}</Text></View>
          <View style={[styles.reviewRow, { borderBottomWidth: 0 }]}><Text style={theme.typography.bodyMuted}>Tags</Text><Text style={theme.typography.body}>{form.tags || 'None'}</Text></View>

          <View style={{ marginTop: 16, marginBottom: 6 }}>
            <Text style={theme.typography.caption}>✦ Our team reviews new stories within 1–3 days.</Text>
            <Text style={theme.typography.caption}>✦ You'll be notified when it's approved or needs changes.</Text>
          </View>

          <Button title="Save as Draft" variant="ghost" onPress={() => handleSubmit('draft')} loading={loading} style={{ marginTop: 10 }} />
          <Button
            title={loading ? 'Submitting…' : user?.role === 'admin' ? '🚀 Publish' : '🚀 Submit for Review'}
            onPress={() => handleSubmit('pending')}
            loading={loading}
            disabled={!form.title || !form.country || !form.category || !form.fullStory}
            style={{ marginTop: 10 }}
          />
        </Card>
      )}

      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        {step > 0 ? <Button title="← Back" variant="ghost" onPress={() => setStep((s) => s - 1)} style={{ flex: 1, marginRight: 8 }} /> : null}
        {step < STEPS.length - 1 ? (
          <Button title="Continue →" onPress={() => setStep((s) => s + 1)} disabled={!canProceed()} style={{ flex: 1 }} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  catOption: { width: '31%', marginRight: '3.5%', marginBottom: 10, borderWidth: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 12 },
  uploadZone: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(128,128,128,0.25)' },
});
