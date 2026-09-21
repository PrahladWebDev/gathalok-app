import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { TOKEN_KEY, USER_KEY } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          // Refresh from server in the background; falls back to cached user on failure.
          api.get('/auth/me').then(({ data }) => {
            setUser(data.user);
            AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }).catch(() => {});
        }
      } catch (err) {
        // ignore corrupt cache
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applySession = useCallback(async (data) => {
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // Backend requires email verification before login: register() no longer
  // logs the user in — it returns { requiresVerification, email, message }
  // and the caller (RegisterScreen) shows a "check your email" state.
  // login() throws with .notVerified === true if the account hasn't been
  // verified yet; RegisterScreen/LoginScreen surface a resend action.
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return applySession(data);
  }, [applySession]);

  const register = useCallback(async ({ name, username, email, password }) => {
    const { data } = await api.post('/auth/register', { name, username, email, password });
    return data; // { success, requiresVerification, email, message } — no session yet
  }, []);

  // Resolves a verification link's token. On success the backend also logs
  // the user in (same as web), so this applies the returned session.
  const verifyEmail = useCallback(async (token) => {
    const { data } = await api.get(`/auth/verify-email/${token}`);
    if (data.token) await applySession(data);
    return data;
  }, [applySession]);

  const resendVerification = useCallback(async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  }, []);

  // Resolves a reset-password link's token + new password. On success the
  // backend logs the user in, same as verifyEmail above.
  const resetPassword = useCallback(async (token, password) => {
    const { data } = await api.post(`/auth/reset-password/${token}`, { password });
    if (data.token) await applySession(data);
    return data;
  }, [applySession]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
  }, []);

  // updateProfile takes a plain JSON object — { name, username, bio, country,
  // avatar: { url, publicId } }. The backend route has no multer middleware,
  // so avatars must be uploaded separately first (see uploadAvatar below)
  // and only the resulting { url, publicId } is ever sent here.
  const updateProfile = useCallback(async (updates) => {
    const { data } = await api.put('/auth/profile', updates);
    setUser(data.user);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  }, []);

  // Two-step avatar change: upload the file to Cloudinary via /upload/avatar,
  // then save the returned { url, publicId } onto the user profile.
  const uploadAvatar = useCallback(async (asset) => {
    const fd = new FormData();
    fd.append('avatar', { uri: asset.uri, name: 'avatar.jpg', type: 'image/jpeg' });
    const { data } = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return updateProfile({ avatar: data.data });
  }, [updateProfile]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/password', { currentPassword, newPassword });
    return data;
  }, []);

  const becomeContributor = useCallback(async () => {
    const { data } = await api.post('/auth/become-contributor');
    const next = { ...user, role: 'contributor' };
    setUser(next);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
    return data;
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, updateProfile, uploadAvatar, changePassword, becomeContributor,
      verifyEmail, resendVerification, forgotPassword, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
