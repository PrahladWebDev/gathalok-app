import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { haptic } from '../utils/haptics';

// "Listen to this tale" player for StoryDetail, built on expo-speech
// (the phone's own text-to-speech engine: free, offline, no API key).
//
//   <ListenBar title={story.title} parts={[story.fullStory, story.origin]} />
//
// - Text is split into paragraph-sized chunks and spoken one after another
//   (Android limits a single utterance to ~4000 chars).
// - Tapping pause stops at the current chunk; tapping play resumes from it
//   (expo-speech's own pause/resume only works on iOS).
// - Stops by itself when you leave the screen, switch apps, or unmount.
// - Logged-in users only: guests see a locked bar that opens the Login screen.
const SPEEDS = [0.85, 1, 1.25, 1.5];
const MAX_CHARS = Math.min(Speech.maxSpeechInputLength || 3000, 3000);

function buildChunks(text, max) {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const chunks = [];
  paragraphs.forEach((p) => {
    if (p.length <= max) { chunks.push(p); return; }
    const sentences = p.match(/[^.!?।]+[.!?।]*\s*/g) || [p];
    let cur = '';
    sentences.forEach((s) => {
      if ((cur + s).length > max) {
        if (cur.trim()) chunks.push(cur.trim());
        cur = '';
        while (s.length > max) { chunks.push(s.slice(0, max)); s = s.slice(max); }
      }
      cur += s;
    });
    if (cur.trim()) chunks.push(cur.trim());
  });
  return chunks;
}

export default function ListenBar({ title, parts = [] }) {
  const theme = useTheme();
  const toast = useToast();
  const navigation = useNavigation();
  const { user } = useAuth();
  const elevated = theme.uiStyle === 'elevated';

  const joined = parts.filter(Boolean).join('\n\n');
  const chunks = useMemo(
    () => buildChunks(`${title ? `${title}.\n\n` : ''}${joined}`, MAX_CHARS),
    [title, joined]
  );
  // Devanagari text → Hindi voice; everything else → English.
  const language = /[\u0900-\u097F]/.test(joined) ? 'hi-IN' : 'en-US';

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rateIdx, setRateIdx] = useState(1);
  const runId = useRef(0);      // bumped on every stop/start so stale callbacks are ignored
  const idxRef = useRef(0);     // chunk we're on (kept when paused, so play resumes)
  const rateRef = useRef(1);

  const stop = useCallback(() => {
    runId.current += 1;
    Speech.stop();
    setPlaying(false);
  }, []);

  const speakFrom = useCallback((i, id) => {
    if (id !== runId.current) return;
    if (i >= chunks.length) {
      idxRef.current = 0;
      setProgress(0);
      setPlaying(false);
      return;
    }
    idxRef.current = i;
    setProgress(i / chunks.length);
    Speech.speak(chunks[i], {
      language,
      rate: SPEEDS[rateRef.current],
      onDone: () => speakFrom(i + 1, id),
      onError: () => {
        if (id !== runId.current) return;
        runId.current += 1;
        setPlaying(false);
        toast("Text-to-speech isn't available on this device.", 'error');
      },
    });
  }, [chunks, language, toast]);

  const start = useCallback((from) => {
    Speech.stop();
    runId.current += 1;
    setPlaying(true);
    speakFrom(from, runId.current);
  }, [speakFrom]);

  const toggle = () => {
    haptic.select();
    if (playing) stop();
    else start(idxRef.current);
  };

  const cycleSpeed = () => {
    const next = (rateIdx + 1) % SPEEDS.length;
    rateRef.current = next;
    setRateIdx(next);
    if (playing) start(idxRef.current); // re-read current paragraph at the new speed
  };

  useEffect(() => { if (!user) stop(); }, [user, stop]);

  useEffect(() => {
    const unsubBlur = navigation.addListener('blur', stop);
    const appSub = AppState.addEventListener('change', (s) => { if (s !== 'active') stop(); });
    return () => {
      unsubBlur();
      appSub.remove();
      runId.current += 1;
      Speech.stop();
    };
  }, [navigation, stop]);

  if (!chunks.length) return null;

  const edge = elevated ? theme.colors.border : theme.colors.text;
  const barStyle = {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: elevated ? 1 : theme.border.width,
    borderColor: edge,
  };

  // Guests: locked bar, tap → Login (same route the rest of the screen uses).
  if (!user) {
    return (
      <TouchableOpacity
        onPress={() => { haptic.select(); navigation.navigate('Auth', { screen: 'Login' }); }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Sign in to listen to this story"
        style={barStyle}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.accent, opacity: 0.55, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="lock-closed" size={20} color={theme.colors.onAccent} />
        </View>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={theme.typography.h4} numberOfLines={1}>Listen to this tale</Text>
          <Text style={[theme.typography.small, { marginTop: 2 }]} numberOfLines={1}>Sign in to unlock narration</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.accent} />
      </TouchableOpacity>
    );
  }

  const label = playing ? 'Listening…' : progress > 0 ? 'Paused — tap to resume' : 'Listen to this tale';
  return (
    <View style={barStyle}>
      <TouchableOpacity
        onPress={toggle}
        hitSlop={theme.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Pause narration' : 'Listen to this story'}
        activeOpacity={0.8}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name={playing ? 'pause' : 'play'} size={22} color={theme.colors.onAccent} style={playing ? null : { marginLeft: 2 }} />
      </TouchableOpacity>

      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={theme.typography.h4} numberOfLines={1}>{label}</Text>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: edge, opacity: 0.9, marginTop: 8, overflow: 'hidden' }}>
          <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: theme.colors.accent }} />
        </View>
      </View>

      <TouchableOpacity
        onPress={cycleSpeed}
        hitSlop={theme.hitSlop}
        accessibilityRole="button"
        accessibilityLabel={`Narration speed ${SPEEDS[rateIdx]}x. Tap to change.`}
        style={{ minWidth: 44, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: edge }}
      >
        <Text style={theme.typography.small}>{SPEEDS[rateIdx]}x</Text>
      </TouchableOpacity>
    </View>
  );
}
