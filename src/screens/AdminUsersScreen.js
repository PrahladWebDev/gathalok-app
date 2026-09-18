import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Input from '../components/Input';
import Chip from '../components/Chip';
import Button from '../components/Button';
import PillBadge from '../components/PillBadge';
import { SkeletonList } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/client';

const ROLE_TONE = { admin: 'accent', contributor: 'info', user: 'neutral' };
// Matches the web app's exact three options, in the same order.
const ROLE_OPTIONS = ['user', 'contributor', 'admin'];

// Mirrors the web's <select disabled={u.role === 'admin'}> exactly: once
// someone is admin, their role can't be changed from this screen at all —
// no accidental one-tap demotion of an admin. Pick the exact target role
// (like the web's dropdown), not a "cycle to next" button.
function RolePicker({ user: u, disabled, onPick, theme }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {ROLE_OPTIONS.map((role) => {
        const active = u.role === role;
        return (
          <TouchableOpacity
            key={role}
            disabled={disabled}
            onPress={() => !active && onPick(role)}
            style={{
              paddingHorizontal: 8, paddingVertical: 5, borderRadius: theme.radius.pill, marginRight: 4,
              backgroundColor: active ? theme.colors.accent : 'transparent',
              borderWidth: 1, borderColor: active ? theme.colors.accent : theme.colors.border,
              opacity: disabled && !active ? 0.35 : 1,
            }}
          >
            <Text style={{
              fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
              color: active ? theme.colors.onAccent : theme.colors.textMuted,
            }}>
              {role === 'contributor' ? 'Contrib.' : role}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AdminUsersScreen() {
  const theme = useTheme();
  const toast = useToast();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debounceRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    const params = { limit: 40 };
    if (search) params.search = search;
    if (roleFilter === 'blocked') params.blocked = true;
    else if (roleFilter) params.role = roleFilter;
    api.get('/admin/users', { params })
      .then((r) => setUsers(r.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [load, search]);

  const setRole = async (u, role) => {
    // Belt-and-suspenders: the picker already hides this for admins, but
    // never trust the UI alone for a destructive-ish action.
    if (u.role === 'admin') return;
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role } : x)));
      toast(`${u.name} is now ${role}.`);
    } catch (err) {
      toast(err.message || 'Failed to update role.', 'error');
    }
  };

  const toggleBlock = async (u) => {
    if (u.role === 'admin') return; // mirrors web's disabled={u.role === 'admin'}
    try {
      const res = await api.patch(`/admin/users/${u._id}/block`);
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isBlocked: res.data.data.isBlocked } : x)));
      toast(res.data.message);
    } catch (err) {
      toast(err.message || 'Failed to update block status.', 'error');
    }
  };

  return (
    <Screen title="Users" subtitle={`${users.length} shown`} scroll>
      <Input placeholder="Search name, username, email…" value={search} onChangeText={setSearch} leftIcon="search-outline" containerStyle={{ marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <Chip label="All" active={!roleFilter} onPress={() => setRoleFilter('')} />
        <Chip label="Contributors" active={roleFilter === 'contributor'} onPress={() => setRoleFilter('contributor')} />
        <Chip label="Admins" active={roleFilter === 'admin'} onPress={() => setRoleFilter('admin')} />
        <Chip label="Blocked" active={roleFilter === 'blocked'} onPress={() => setRoleFilter('blocked')} />
      </View>

      {loading ? (
        <SkeletonList count={6} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : users.length === 0 ? (
        <ErrorState icon="people-outline" title="No users found" />
      ) : (
        users.map((u) => {
          const isSelf = u._id === me?._id;
          const isAdmin = u.role === 'admin';
          return (
            <Card key={u._id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.accentSoft,
                  alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden',
                  borderWidth: theme.border.width, borderColor: theme.colors.text,
                }}>
                  {u.avatar?.url ? (
                    <Image source={{ uri: u.avatar.url }} style={{ width: 42, height: 42 }} />
                  ) : (
                    <Text style={{ fontWeight: '700', color: theme.colors.accent }}>{u.name?.[0]?.toUpperCase()}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={theme.typography.h4} numberOfLines={1}>{u.name} {u.isBlocked ? '🚫' : ''}</Text>
                  <Text style={theme.typography.caption} numberOfLines={1}>@{u.username} · {u.storiesWritten || 0} stories</Text>
                </View>
                <PillBadge label={u.role} tone={ROLE_TONE[u.role] || 'neutral'} />
              </View>

              {isSelf ? (
                <Text style={[theme.typography.small, { marginTop: 10 }]}>This is your own account — manage it from Settings.</Text>
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <RolePicker user={u} disabled={isAdmin} onPick={(role) => setRole(u, role)} theme={theme} />
                  <Button
                    title={u.isBlocked ? 'Unblock' : 'Block'}
                    size="sm"
                    variant={u.isBlocked ? 'primary' : 'danger'}
                    disabled={isAdmin}
                    onPress={() => toggleBlock(u)}
                  />
                </View>
              )}
              {isAdmin && !isSelf ? (
                <Text style={[theme.typography.small, { marginTop: 8 }]}>Admins can't be role-changed or blocked from here.</Text>
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
