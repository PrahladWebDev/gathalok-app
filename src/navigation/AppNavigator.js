import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { haptic } from '../utils/haptics';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MapScreen from '../screens/MapScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import StoryDetailScreen from '../screens/StoryDetailScreen';
import CountryDetailScreen from '../screens/CountryDetailScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';

import ProfileScreen from '../screens/ProfileScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ContributionsScreen from '../screens/ContributionsScreen';
import ContributeScreen from '../screens/ContributeScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminPendingStoriesScreen from '../screens/AdminPendingStoriesScreen';
import AdminReportsScreen from '../screens/AdminReportsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

function useStackScreenOptions() {
  const theme = useTheme();
  return {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.colors.bg },
    headerTintColor: theme.colors.text,
    headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
    headerBackTitleVisible: false,
    contentStyle: { backgroundColor: theme.colors.bg },
  };
}

// Everything reachable from the Profile tab that isn't the overview itself.
function ProfileStackNav() {
  const screenOptions = useStackScreenOptions();
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Bookmarks" component={BookmarksScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Contributions" component={ContributionsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Contribute" component={ContributeScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="ContributeEdit" component={ContributeScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="AdminPendingStories" component={AdminPendingStoriesScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="AdminReports" component={AdminReportsScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
}

const TAB_ICONS = {
  HomeTab: ['home-outline', 'home'],
  ExploreTab: ['compass-outline', 'compass'],
  MapTab: ['earth-outline', 'earth'],
  LeaderboardTab: ['trophy-outline', 'trophy'],
  ProfileTab: ['person-outline', 'person'],
};

function MainTabs() {
  const theme = useTheme();
  const elevated = theme.uiStyle === 'elevated';
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarActiveBackgroundColor: theme.colors.accentSoft,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2, marginBottom: 2, textAlign: 'center' },
        tabBarIconStyle: { flex: 0, height: 24, width: 24, marginTop: 0 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 12,
          height: theme.layout.tabBarHeight,
          borderRadius: elevated ? theme.radius.lg : theme.radius.pill,
          backgroundColor: theme.colors.surface,
          borderWidth: elevated ? 1 : theme.border.width,
          borderColor: elevated ? theme.colors.border : theme.colors.text,
          borderTopWidth: elevated ? 1 : theme.border.width,
          borderTopColor: elevated ? theme.colors.border : theme.colors.text,
          paddingHorizontal: 4,
          // Floating bar: cancel the automatic safe-area bottom padding so
          // icons + labels stay vertically centered.
          paddingTop: 0,
          paddingBottom: 0,
          ...theme.shadow.card,
        },
        tabBarItemStyle: {
          borderRadius: theme.radius.pill,
          marginHorizontal: 2,
          marginVertical: 6,
          paddingVertical: 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIcon: ({ color, focused }) => {
          const [outline, filled] = TAB_ICONS[route.name] || ['ellipse-outline', 'ellipse'];
          return <Ionicons name={focused ? filled : outline} size={22} color={color} />;
        },
      })}
      screenListeners={{ tabPress: () => haptic.select?.() }}
    >
      <Tabs.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="ExploreTab" component={ExploreScreen} options={{ title: 'Explore' }} initialParams={{}} />
      <Tabs.Screen name="MapTab" component={MapScreen} options={{ title: 'Realms' }} />
      <Tabs.Screen name="LeaderboardTab" component={LeaderboardScreen} options={{ title: 'Ranks' }} />
      <Tabs.Screen name="ProfileTab" component={ProfileStackNav} options={{ title: 'Profile' }} />
    </Tabs.Navigator>
  );
}

function AuthStackNav() {
  const screenOptions = useStackScreenOptions();
  return (
    <AuthStack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function StartupLoading() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg }}>
      <ActivityIndicator size="small" color={theme.colors.accent} />
    </View>
  );
}

// Unlike Wardrobe, GathaLok is browsable without an account — Home, Explore,
// Map, Leaderboard, Story and Country detail all work while logged out.
// "Auth" is presented as a modal, reached from any screen via
// navigation.navigate('Auth', { screen: 'Login' | 'Register' }), which React
// Navigation bubbles up to this root stack automatically.
// Deep linking: gathalok://stories/some-slug always works immediately (no
// server setup needed). Real https://your-domain/stories/some-slug links
// opening the app directly (not just in a browser) additionally requires
// "Universal Links" (iOS) / "App Links" (Android) verification files hosted
// on your domain — see the README for what that involves. The `prefixes`
// below use a placeholder domain; replace it with your actual web frontend's
// public URL (not the api. subdomain) once you confirm it.
const linking = {
  prefixes: [
    'gathalok://',
    'https://gathalok.prahladsingh.in',
    'https://www.gathalok.prahladsingh.in',
  ],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: '',
          ExploreTab: 'explore',
          MapTab: 'realms',
          LeaderboardTab: 'leaderboard',
          ProfileTab: {
            screens: {
              ProfileHome: 'profile',
            },
          },
        },
      },
      StoryDetail: 'stories/:slug',
      CountryDetail: 'countries/:countryName',
      PublicProfile: 'u/:username',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
    },
  },
};

export default function AppNavigator() {
  const theme = useTheme();
  const rootOptions = useStackScreenOptions();

  const navTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.bg,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <RootStack.Navigator screenOptions={{ ...rootOptions, headerShown: false }}>
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen name="StoryDetail" component={StoryDetailScreen} options={{ animation: 'slide_from_right' }} />
        <RootStack.Screen name="CountryDetail" component={CountryDetailScreen} options={{ headerShown: true, title: '' }} />
        <RootStack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ animation: 'slide_from_right' }} />
        <RootStack.Screen name="Auth" component={AuthStackNav} options={{ presentation: 'modal' }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}