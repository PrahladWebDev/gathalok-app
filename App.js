import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
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

// Keep the native splash up until fonts + auth state are ready so there's
// never a blank frame between splash and first render.
SplashScreen.preventAutoHideAsync().catch(() => {});

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

function SplashGate({ ready }) {
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  return null;
}

function ThemedApp() {
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

  return (
    <>
      <SplashGate ready={fontsReady && !authLoading} />
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
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  startup: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { marginTop: 8, fontSize: 24, fontWeight: '700' },
  spinner: { marginTop: 24 },
  message: { marginTop: 10, fontSize: 13 },
});
