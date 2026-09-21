import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import FadeInUp from '../../components/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { haptic } from '../../utils/haptics';

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { login, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = useState(null);
  const passwordRef = useRef(null);

  const submit = async () => {
    if (!email.trim() || !password) { haptic.warning(); setError('Enter your email and password.'); return; }
    setError('');
    setNotVerifiedEmail(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      haptic.success();
      toast('Welcome back, seeker of tales!');
      navigation.getParent()?.goBack();
    } catch (err) {
      haptic.error();
      setError(err.message || 'Login failed');
      if (err.notVerified) setNotVerifiedEmail(err.email || email.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!notVerifiedEmail) return;
    setResending(true);
    try {
      const data = await resendVerification(notVerifiedEmail);
      toast(data.message || 'Verification email sent!');
    } catch (err) {
      toast(err.message || 'Failed to resend verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen scroll keyboard safeTop tabInset={false} padded>
      <FadeInUp distance={12}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 24 }}>
          <Text style={[theme.typography.display, { color: theme.colors.accent }]}>॥ GathaLok ॥</Text>
          <Text style={[theme.typography.h2, { marginTop: 18 }]}>Welcome Back</Text>
          <Text style={[theme.typography.bodyMuted, { marginTop: 4, textAlign: 'center' }]}>
            Sign in to continue exploring world folklore
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
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Input
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureToggle
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          leftIcon="lock-closed-outline"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        <View style={{ alignItems: 'flex-end', marginTop: -6, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
            style={{ minHeight: 32, justifyContent: 'center' }}
          >
            <Text style={[theme.typography.caption, { color: theme.colors.accent, fontWeight: '600' }]}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={{ marginBottom: 10 }}>
            <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.danger }}>⚠ {error}</Text>
            {notVerifiedEmail ? (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                hitSlop={theme.hitSlop}
                accessibilityRole="button"
                accessibilityLabel="Resend verification email"
                style={{ minHeight: 32, justifyContent: 'center', marginTop: 4 }}
              >
                <Text style={[theme.typography.caption, { color: theme.colors.accent, fontWeight: '700', textDecorationLine: 'underline' }]}>
                  {resending ? 'Sending…' : 'Resend verification email'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        <Button title={loading ? 'Please wait…' : 'Sign In'} onPress={submit} loading={loading} style={{ marginTop: 6 }} />
      </FadeInUp>

      <FadeInUp delay={180} distance={16}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <Text style={theme.typography.bodyMuted}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            hitSlop={theme.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Create a free account"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={[theme.typography.body, { color: theme.colors.accent, fontWeight: '700' }]}>Join free</Text>
          </TouchableOpacity>
        </View>
      </FadeInUp>
    </Screen>
  );
}
