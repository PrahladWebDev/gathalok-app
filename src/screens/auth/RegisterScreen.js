import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import FadeInUp from '../../components/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { haptic } from '../../utils/haptics';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { register, resendVerification } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const fail = (message) => { haptic.warning(); setError(message); };

  const submit = async () => {
    if (!form.name.trim() || !form.username || !form.email.trim() || !form.password) {
      fail('Please fill in every field.');
      return;
    }
    if (!USERNAME_RE.test(form.username)) {
      fail('Username must be 3-20 chars: lowercase letters, numbers, underscores.');
      return;
    }
    if (form.password.length < 6) {
      fail('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await register({ ...form, name: form.name.trim(), email: form.email.trim() });
      haptic.success();
      setRegisteredEmail(data.email || form.email.trim());
    } catch (err) {
      haptic.error();
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      const data = await resendVerification(registeredEmail);
      toast(data.message || 'Verification email sent!');
    } catch (err) {
      toast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  // ─── "Check your email" panel, shown after a successful registration ───
  if (registeredEmail) {
    return (
      <Screen scroll safeTop tabInset={false} padded>
        <FadeInUp distance={12}>
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="mail-outline" size={44} color={theme.colors.accent} />
            <Text style={[theme.typography.h2, { marginTop: 16, textAlign: 'center' }]}>Check Your Email</Text>
            <Text style={[theme.typography.bodyMuted, { marginTop: 8, textAlign: 'center' }]}>
              We've sent a verification link to{'\n'}<Text style={{ fontWeight: '700', color: theme.colors.text }}>{registeredEmail}</Text>.{'\n'}
              Click it to activate your account, then sign in.
            </Text>

            <Button
              title={resending ? 'Sending…' : 'Resend Verification Email'}
              onPress={handleResend}
              loading={resending}
              style={{ marginTop: 28, alignSelf: 'stretch' }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              hitSlop={theme.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Already verified, sign in"
              style={{ minHeight: 44, justifyContent: 'center', marginTop: 16 }}
            >
              <Text style={[theme.typography.body, { color: theme.colors.accent, fontWeight: '700' }]}>Already verified? Sign in</Text>
            </TouchableOpacity>
          </View>
        </FadeInUp>
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard safeTop tabInset={false} padded>
      <FadeInUp distance={12}>
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
          <Text style={[theme.typography.display, { color: theme.colors.accent }]}>॥ GathaLok ॥</Text>
          <Text style={[theme.typography.h2, { marginTop: 18 }]}>Begin Your Journey</Text>
          <Text style={[theme.typography.bodyMuted, { marginTop: 4, textAlign: 'center' }]}>
            Join thousands discovering the world's mythological heritage
          </Text>
        </View>
      </FadeInUp>

      <FadeInUp delay={90} distance={16}>
        <Input
          label="Full Name"
          value={form.name}
          onChangeText={set('name')}
          placeholder="Arjun Sharma"
          autoComplete="name"
          textContentType="name"
          leftIcon="person-outline"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => usernameRef.current?.focus()}
        />
        <Input
          ref={usernameRef}
          label="Username"
          value={form.username}
          onChangeText={(v) => set('username')(v.toLowerCase())}
          placeholder="arjunsharma"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username-new"
          textContentType="username"
          leftIcon="at-outline"
          helperText="3-20 chars: lowercase letters, numbers, underscores"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <Input
          ref={emailRef}
          label="Email"
          value={form.email}
          onChangeText={set('email')}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          leftIcon="mail-outline"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Input
          ref={passwordRef}
          label="Password"
          value={form.password}
          onChangeText={set('password')}
          placeholder="Min 6 characters"
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

        <Button title={loading ? 'Please wait…' : 'Create Account'} onPress={submit} loading={loading} style={{ marginTop: 6 }} />

        <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 16 }]}>
          By joining, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </FadeInUp>

      <FadeInUp delay={180} distance={16}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Text style={theme.typography.bodyMuted}>Already a member? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Sign in to an existing account"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.accent, fontWeight: '700' }]}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </FadeInUp>
    </Screen>
  );
}
