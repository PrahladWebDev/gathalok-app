import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Animated, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Cinzel_600SemiBold, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { Inter_600SemiBold } from '@expo-google-fonts/inter';
import { ComicNeue_400Regular, ComicNeue_700Bold } from '@expo-google-fonts/comic-neue';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';

// Keep the native splash up until the full-screen brand poster below has been
// decoded, so there is never a blank frame between the two.
SplashScreen.preventAutoHideAsync().catch(() => {});

const SPLASH_BG = '#0B1E2D';      // must match the native splash backgroundColor in app.json
const MIN_POSTER_MS = 1400;       // long enough to read, short enough not to annoy
const NATIVE_HIDE_FALLBACK_MS = 2000;

// Android 12+ only allows a small centred icon on the *system* splash screen,
// so the full-bleed poster can't be shown natively there. This overlay takes
// over from the native splash (same navy, poster fades in) and shows the
// artwork on every Android version, then fades out once fonts, theme and
// auth are ready. iOS shows the poster natively (see app.json) so the
// hand-off there is seamless.
function BrandSplash({ ready }) {
  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const posterOpacity = useRef(new Animated.Value(0)).current;
  const handedOff = useRef(false);

  const handOff = useCallback(() => {
    if (handedOff.current) return;
    handedOff.current = true;
    SplashScreen.hideAsync().catch(() => {});
    Animated.timing(posterOpacity, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    setTimeout(() => setMinElapsed(true), MIN_POSTER_MS);
  }, [posterOpacity]);

  // Never get stuck behind the native splash if the image event doesn't fire.
  useEffect(() => {
    const t = setTimeout(handOff, NATIVE_HIDE_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [handOff]);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    Animated.timing(overlayOpacity, { toValue: 0, duration: 360, useNativeDriver: true }).start(() => setVisible(false));
  }, [ready, minElapsed, overlayOpacity]);

  if (!visible) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.brandSplash, { opacity: overlayOpacity }]} pointerEvents="auto" accessibilityLabel="GathaLok is loading">
      <StatusBar style="light" />
      <Animated.Image
        source={require('./assets/splash.png')}
        style={[StyleSheet.absoluteFill, styles.poster, { opacity: posterOpacity }]}
        resizeMode="cover"
        onLoad={handOff}
        onError={handOff}
        fadeDuration={0}
      />
    </Animated.View>
  );
}

function StartupScreen({ message = 'Summoning the tales…' }) {
  const theme = useTheme();
  return (
    <View style={[styles.startup, { backgroundColor: theme.colors.bg }]}>
      <Text style={[theme.typography.display, { color: theme.colors.accent }]}>ॐ</Text>
      <Text style={[styles.title, { color: theme.colors.text }]}>GathaLok</Text>
      <ActivityIndicator size="small" color={theme.colors.accent} style={styles.spinner} />
      <Text style={[styles.message, { color: theme.colors.textFaint }]}>{message}</Text>
    </View>
  );
}

function ThemedApp({ onReady }) {
  const theme = useTheme();
  const { loading: authLoading } = useAuth();
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Lora_400Regular,
    Inter_600SemiBold,
    ComicNeue_400Regular,
    ComicNeue_700Bold,
  });
  const fontsReady = fontsLoaded || !!fontError;
  const appReady = fontsReady && !authLoading;

  useEffect(() => {
    if (appReady) onReady();
  }, [appReady, onReady]);

  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {!fontsReady ? (
        <StartupScreen message="Preparing the app…" />
      ) : (
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      )}
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedApp onReady={onReady} />
        </AuthProvider>
      </ThemeProvider>
      <BrandSplash ready={ready} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  brandSplash: { backgroundColor: SPLASH_BG, zIndex: 9999, elevation: 9999 },
  poster: { width: '100%', height: '100%' },
  startup: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { marginTop: 8, fontSize: 24, fontWeight: '700' },
  spinner: { marginTop: 24 },
  message: { marginTop: 10, fontSize: 13 },
});
