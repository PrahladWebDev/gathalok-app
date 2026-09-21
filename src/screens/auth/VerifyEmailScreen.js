import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import FadeInUp from '../../components/FadeInUp';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { haptic } from '../../utils/haptics';

// Reached via a "verify-email/:token" deep link tapped from the verification
// email. Auto-verifies on mount, same as the web app's /verify-email page.
export default function VerifyEmailScreen({ route, navigation }) {
  const theme = useTheme();
  const toast = useToast();
  const { verifyEmail } = useAuth();
  const token = route?.params?.token;

  const [status, setStatus] = useState(token ? 'verifying' : 'error'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState(token ? '' : 'This verification link is missing its token.');
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const data = await verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Your email has been verified.');
        haptic.success();
        if (data.token) toast('Welcome to GathaLok!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'This verification link is invalid or has expired.');
        haptic.error();
      }
    })();
  }, [token, verifyEmail, toast]);

  const icon = status === 'verifying' ? 'hourglass-outline' : status === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline';

  return (
    <Screen scroll safeTop tabInset={false} padded>
      <FadeInUp distance={12}>
        <View style={{ alignItems: 'center', marginTop: 60 }}>
          <Ionicons name={icon} size={44} color={status === 'error' ? theme.colors.danger : theme.colors.accent} />
          <Text style={[theme.typography.h2, { marginTop: 16 }]}>
            {status === 'verifying' ? 'Verifying…' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
          </Text>
          <Text style={[theme.typography.bodyMuted, { marginTop: 8, textAlign: 'center' }]}>
            {status === 'verifying' ? 'Please wait while we confirm your email.' : message}
          </Text>

          {status === 'success' && (
            <Button title="Continue to GathaLok" onPress={() => navigation.getParent()?.goBack()} style={{ marginTop: 28, alignSelf: 'stretch' }} />
          )}
          {status === 'error' && (
            <Button title="Back to Sign In" onPress={() => navigation.navigate('Login')} style={{ marginTop: 28, alignSelf: 'stretch' }} />
          )}
        </View>
      </FadeInUp>
    </Screen>
  );
}
