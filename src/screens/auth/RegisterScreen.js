import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function RegisterScreen({ navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const submit = async () => {
    if (!form.name || !form.username || !form.email || !form.password) {
      setError('Please fill in every field.');
      return;
    }
    if (!USERNAME_RE.test(form.username)) {
      setError('Username must be 3-20 chars: lowercase letters, numbers, underscores.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast('Welcome to GathaLok!');
      navigation.getParent()?.goBack();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll keyboard safeTop tabInset={false} padded>
      <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 24 }}>
        <Text style={[theme.typography.display, { color: theme.colors.accent }]}>॥ GathaLok ॥</Text>
        <Text style={[theme.typography.h2, { marginTop: 18 }]}>Begin Your Journey</Text>
        <Text style={[theme.typography.bodyMuted, { marginTop: 4, textAlign: 'center' }]}>
          Join thousands discovering the world's mythological heritage
        </Text>
      </View>

      <Input label="Full Name" value={form.name} onChangeText={set('name')} placeholder="Arjun Sharma" leftIcon="person-outline" />
      <Input
        label="Username"
        value={form.username}
        onChangeText={(v) => set('username')(v.toLowerCase())}
        placeholder="arjunsharma"
        autoCapitalize="none"
        leftIcon="at-outline"
        helperText="3-20 chars: lowercase letters, numbers, underscores"
      />
      <Input label="Email" value={form.email} onChangeText={set('email')} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" leftIcon="mail-outline" />
      <Input label="Password" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureToggle secureTextEntry leftIcon="lock-closed-outline" />

      {error ? <Text style={{ color: theme.colors.danger, marginBottom: 10 }}>⚠ {error}</Text> : null}

      <Button title={loading ? 'Please wait…' : 'Create Account'} onPress={submit} loading={loading} style={{ marginTop: 6 }} />

      <Text style={[theme.typography.caption, { textAlign: 'center', marginTop: 16 }]}>
        By joining, you agree to our Terms of Service and Privacy Policy.
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={theme.typography.bodyMuted}>Already a member? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[theme.typography.body, { color: theme.colors.accent, fontWeight: '700' }]}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
