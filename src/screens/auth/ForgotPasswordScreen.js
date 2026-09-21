import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import FadeInUp from '../../components/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { haptic } from '../../utils/haptics';

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) { haptic.warning(); setError('Enter your email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      haptic.success();
      setSent(true);
    } catch (err) {
      haptic.error();
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Screen scroll keyboard safeTop tabInset={false} padded>
        <FadeInUp distance={12}>
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="mail-outline" size={40} color={theme.colors.accent} />
            <Text style={[theme.typography.h2, { marginTop: 16 }]}>Check Your Email</Text>
            <Text style={[theme.typography.bodyMuted, { marginTop: 8, textAlign: 'center' }]}>
              If an account exists for {email.trim()}, we've sent a link to reset your password. It expires in 1 hour.
            </Text>
            <Button title="Back to Sign In" onPress={() => navigation.navigate('Login')} style={{ marginTop: 28, alignSelf: 'stretch' }} />
          </View>
        </FadeInUp>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard safeTop tabInset={false} padded>
      <FadeInUp distance={12}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
          <Text style={[theme.typography.display, { color: theme.colors.accent }]}>॥ GathaLok ॥</Text>
          <Text style={[theme.typography.h2, { marginTop: 18 }]}>Forgot Password</Text>
          <Text style={[theme.typography.bodyMuted, { marginTop: 4, textAlign: 'center' }]}>
            Enter the email associated with your account and we'll send you a link to reset your password.
          </Text>
        </View>
      </FadeInUp>

      <FadeInUp delay={90} distance={16}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          leftIcon="mail-outline"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        {error ? (
          <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.danger, marginBottom: 10 }}>⚠ {error}</Text>
        ) : null}

        <Button title={loading ? 'Sending…' : 'Send Reset Link'} onPress={submit} loading={loading} style={{ marginTop: 6 }} />
      </FadeInUp>

      <FadeInUp delay={180} distance={16}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.accent, fontWeight: '700' }]}>← Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </FadeInUp>
    </Screen>
  );
}
