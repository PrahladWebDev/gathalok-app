import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import FadeInUp from '../../components/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { haptic } from '../../utils/haptics';

// Reached either from a "reset-password/:token" deep link (email link tapped
// on-device) or by navigating in manually. `route.params.token` is required.
export default function ResetPasswordScreen({ route, navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { resetPassword } = useAuth();
  const token = route?.params?.token;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef(null);

  const submit = async () => {
    if (!password || !confirm) { haptic.warning(); setError('Please fill in both fields.'); return; }
    if (password.length < 6) { haptic.warning(); setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { haptic.warning(); setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      haptic.success();
      toast('Password reset successfully! Welcome back.');
      navigation.getParent()?.goBack();
    } catch (err) {
      haptic.error();
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Screen scroll safeTop tabInset={false} padded>
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Text style={[theme.typography.h2, { textAlign: 'center' }]}>Invalid Link</Text>
          <Text style={[theme.typography.bodyMuted, { marginTop: 8, textAlign: 'center' }]}>
            This password reset link is missing its token. Please request a new one.
          </Text>
          <Button title="Request New Link" onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 24, alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard safeTop tabInset={false} padded>
      <FadeInUp distance={12}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
          <Text style={[theme.typography.display, { color: theme.colors.accent }]}>॥ GathaLok ॥</Text>
          <Text style={[theme.typography.h2, { marginTop: 18 }]}>Reset Password</Text>
          <Text style={[theme.typography.bodyMuted, { marginTop: 4, textAlign: 'center' }]}>
            Choose a new password for your account.
          </Text>
        </View>
      </FadeInUp>

      <FadeInUp delay={90} distance={16}>
        <Input
          label="New Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          secureToggle
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
          leftIcon="lock-closed-outline"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <Input
          ref={confirmRef}
          label="Confirm New Password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter password"
          secureToggle
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
          leftIcon="lock-closed-outline"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {error ? (
          <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.danger, marginBottom: 10 }}>⚠ {error}</Text>
        ) : null}

        <Button title={loading ? 'Resetting…' : 'Reset Password'} onPress={submit} loading={loading} style={{ marginTop: 6 }} />
      </FadeInUp>
    </Screen>
  );
}
