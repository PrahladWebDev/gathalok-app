import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { haptic } from '../utils/haptics';

function Row({ icon, label, onPress, danger }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => { haptic.select(); onPress && onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={theme.hitSlop}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingVertical: 12 }}
    >
      <Ionicons name={icon} size={20} color={danger ? theme.colors.danger : theme.colors.accent} style={{ width: 28 }} />
      <Text style={[theme.typography.body, danger && { color: theme.colors.danger }, { flex: 1 }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textFaint} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const { user, logout, becomeContributor } = useAuth();
  const toast = useToast();

  if (!user) {
    return (
      <Screen title="Profile" scroll>
        <Card style={{ alignItems: 'center', paddingVertical: 36 }}>
          <Ionicons name="person-circle-outline" size={56} color={theme.colors.accent} />
          <Text style={[theme.typography.h2, { marginTop: 12 }]}>Sign in to GathaLok</Text>
          <Text style={[theme.typography.bodyMuted, { textAlign: 'center', marginTop: 6, marginBottom: 18 }]}>
            Track your reading journey, bookmark stories, and contribute legends of your own.
          </Text>
          <Button title="Sign In" onPress={() => navigation.navigate('Auth', { screen: 'Login' })} />
        </Card>
      </Screen>
    );
  }

  const handleBecomeContributor = async () => {
    try {
      await becomeContributor();
      haptic.success();
      toast('You are now a Contributor!');
    } catch (err) {
      haptic.error();
      toast(err.message || 'Failed to upgrade.', 'error');
    }
  };

  return (
    <Screen title="Profile" scroll>
      <Card style={{ alignItems: 'center', paddingVertical: 24, marginBottom: 18 }}>
        <View style={{
          width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.accentSoft,
          alignItems: 'center', justifyContent: 'center', borderWidth: theme.border.width, borderColor: theme.colors.text, overflow: 'hidden',
        }}>
          {user.avatar?.url ? (
            <Image source={{ uri: user.avatar.url }} style={{ width: 76, height: 76 }} />
          ) : (
            <Text style={{ fontSize: 28, fontWeight: '700', color: theme.colors.accent }}>{user.name?.[0]?.toUpperCase()}</Text>
          )}
        </View>
        <Text style={[theme.typography.h2, { marginTop: 12 }]}>{user.name}</Text>
        <Text style={theme.typography.bodyMuted}>@{user.username} · {user.role}</Text>
        {user.bio ? <Text style={[theme.typography.body, { textAlign: 'center', marginTop: 8 }]}>{user.bio}</Text> : null}
      </Card>

      <View style={{ flexDirection: 'row', marginBottom: 18 }}>
        <Card style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
          <Text style={theme.typography.h2}>{user.storiesRead || 0}</Text>
          <Text style={theme.typography.caption}>Read</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
          <Text style={theme.typography.h2}>{user.countriesExplored?.length || 0}</Text>
          <Text style={theme.typography.caption}>Countries</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <Text style={theme.typography.h2}>{user.likesReceived || 0}</Text>
          <Text style={theme.typography.caption}>Likes</Text>
        </Card>
      </View>

      <Card style={{ marginBottom: 18, paddingVertical: 4 }}>
        <Row icon="bookmark-outline" label="Bookmarks" onPress={() => navigation.navigate('Bookmarks')} />
        <Row icon="time-outline" label="Reading History" onPress={() => navigation.navigate('History')} />
        <Row icon="trophy-outline" label="Achievements" onPress={() => navigation.navigate('Achievements')} />
        {(user.role === 'contributor' || user.role === 'admin') ? (
          <>
            <Row icon="create-outline" label="My Contributions" onPress={() => navigation.navigate('Contributions')} />
            <Row icon="add-circle-outline" label="Submit a Story" onPress={() => navigation.navigate('Contribute')} />
          </>
        ) : null}
        <Row icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate('Notifications')} />
      </Card>

      {user.role === 'user' ? (
        <Card style={{ marginBottom: 18, alignItems: 'center', paddingVertical: 22 }}>
          <Text style={{ fontSize: 24 }}>📜</Text>
          <Text style={[theme.typography.h3, { marginTop: 8, textAlign: 'center' }]}>Become a Contributor</Text>
          <Text style={[theme.typography.bodyMuted, { textAlign: 'center', marginTop: 4, marginBottom: 14 }]}>
            It's free and takes just one tap — start submitting stories today.
          </Text>
          <Button title="Become a Contributor" onPress={handleBecomeContributor} />
        </Card>
      ) : null}

      <Card style={{ paddingVertical: 4, marginBottom: 24 }}>
        {user.role === 'admin' ? (
          <Row icon="shield-checkmark-outline" label="Admin Dashboard" onPress={() => navigation.navigate('AdminDashboard')} />
        ) : null}
        <Row icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
        <Row icon="log-out-outline" label="Sign Out" danger onPress={logout} />
      </Card>
    </Screen>
  );
}
