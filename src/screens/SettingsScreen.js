import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import MagicalTitle from '../components/MagicalTitle';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { haptic } from '../utils/haptics';

function ThemeSwatch({ option, active, onPress, theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${option.name} theme`}
      style={{ alignItems: 'center', width: 74, minHeight: 44 }}
    >
      <View style={{
        width: 56, height: 56, borderRadius: 18, backgroundColor: option.bg,
        borderWidth: active ? theme.border.width : 1.5,
        borderColor: active ? theme.colors.text : theme.colors.border,
        alignItems: 'center', justifyContent: 'center', marginBottom: 6,
      }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: option.accent }} />
        {active && (
          <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: option.accent, borderRadius: 10, padding: 2, borderWidth: 1.5, borderColor: theme.colors.text }}>
            <Ionicons name="checkmark" size={11} color={option.onAccent} />
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={[theme.typography.small, active && { color: theme.colors.text }]}>{option.name}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { user, updateProfile, uploadAvatar, changePassword, logout } = useAuth();

  // Profile editing
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast('Photo library access is needed to change your avatar.', 'error'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1],
    });
    if (result.canceled) return;
    setUploadingAvatar(true);
    try {
      await uploadAvatar(result.assets[0]);
      toast('Avatar updated.');
    } catch (err) {
      toast(err.message || 'Failed to upload avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !username.trim()) {
      toast('Name and username are required.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), username: username.trim().toLowerCase(), bio: bio.trim() });
      toast('Profile updated.');
    } catch (err) {
      toast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!curPass || newPass.length < 6) {
      toast('Enter your current password and a new one (min 6 chars).', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      toast('New password and confirmation do not match.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(curPass, newPass);
      setCurPass(''); setNewPass(''); setConfirmPass('');
      toast('Password updated.');
    } catch (err) {
      toast(err.message || 'Failed to update password.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => toast('Account deletion requires contacting support.', 'error') },
      ]
    );
  };

  return (
    <Screen titleNode={<MagicalTitle title="Settings" />} scroll>
      {user ? (
        <>
          <Text style={[theme.typography.h2, { marginBottom: 2 }]}>Profile</Text>
          <Text style={[theme.typography.bodyMuted, { marginBottom: 14 }]}>How other seekers see you.</Text>
          <Card style={{ marginBottom: 28 }}>
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
                <View style={{
                  width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.accentSoft,
                  alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  borderWidth: theme.border.width, borderColor: theme.colors.text,
                }}>
                  {user.avatar?.url ? (
                    <Image source={{ uri: user.avatar.url }} style={{ width: 84, height: 84 }} />
                  ) : (
                    <Text style={{ fontSize: 30, fontWeight: '700', color: theme.colors.accent }}>{user.name?.[0]?.toUpperCase()}</Text>
                  )}
                </View>
                <View style={{
                  position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.accent, borderRadius: 14,
                  width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
                  borderWidth: theme.border.width, borderColor: theme.colors.text,
                }}>
                  <Ionicons name="camera" size={14} color={theme.colors.onAccent} />
                </View>
              </TouchableOpacity>
              {uploadingAvatar ? <Text style={[theme.typography.small, { marginTop: 8 }]}>Uploading…</Text> : null}
            </View>

            <Input label="Full Name" value={name} onChangeText={setName} leftIcon="person-outline" />
            <Input label="Username" value={username} onChangeText={(v) => setUsername(v.toLowerCase())} autoCapitalize="none" leftIcon="at-outline" />
            <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Tell the community about yourself…" leftIcon="chatbox-ellipses-outline" />
            <Button title={savingProfile ? 'Saving…' : 'Save Profile'} onPress={handleSaveProfile} loading={savingProfile} />
          </Card>
        </>
      ) : null}

      <Text style={[theme.typography.h2, { marginBottom: 2 }]}>Appearance</Text>
      <Text style={[theme.typography.bodyMuted, { marginBottom: 14 }]}>Pick a look. It applies everywhere, instantly.</Text>
      <Card style={{ marginBottom: 28 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }} accessibilityRole="radiogroup">
          {theme.themeList.map((option) => (
            <ThemeSwatch
              key={option.id}
              option={option}
              active={option.id === theme.themeId}
              onPress={() => { haptic.select?.(); theme.setTheme(option.id); }}
              theme={theme}
            />
          ))}
        </View>
      </Card>

      {user ? (
        <>
          <Text style={[theme.typography.h2, { marginBottom: 2 }]}>Change Password</Text>
          <Text style={[theme.typography.bodyMuted, { marginBottom: 14 }]}>Keep your account secure.</Text>
          <Card style={{ marginBottom: 28 }}>
            <Input label="Current Password" value={curPass} onChangeText={setCurPass} secureTextEntry secureToggle leftIcon="lock-closed-outline" />
            <Input label="New Password" value={newPass} onChangeText={setNewPass} secureTextEntry secureToggle leftIcon="key-outline" helperText="Minimum 6 characters" />
            <Input label="Confirm New Password" value={confirmPass} onChangeText={setConfirmPass} secureTextEntry secureToggle leftIcon="key-outline" />
            <Button title={pwLoading ? 'Updating…' : 'Update Password'} onPress={handleChangePassword} loading={pwLoading} />
          </Card>

          <Button title="Sign Out" variant="outline" onPress={logout} style={{ marginBottom: 16 }} />

          <Text style={[theme.typography.h2, { marginBottom: 2, color: theme.colors.danger }]}>Danger Zone</Text>
          <Text style={[theme.typography.bodyMuted, { marginBottom: 14 }]}>This action is permanent.</Text>
          <Button title="Delete My Account" variant="danger" onPress={handleDeleteAccount} style={{ marginBottom: 24 }} />
        </>
      ) : null}
    </Screen>
  );
}
