import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, TextInput, Menu, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { GoldButton } from '../../components/GoldButton';
import { StarBackground } from '../../components/StarBackground';
import { colors } from '../../theme';
import { User } from '../../types';

const RELATIONSHIP_OPTIONS = ['Bekar', 'İlişkisi Var', 'Evli', 'Platonik', 'Diğer'];

export const ProfileScreen: React.FC = () => {
  const { logout, refreshUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [profession, setProfession] = useState('');
  const [showRelationshipMenu, setShowRelationshipMenu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const data = await apiService.getProfile();
          setProfile(data);
          setRelationshipStatus(data?.relationshipStatus ?? '');
          setProfession(data?.profession ?? '');
        } catch (e) {
          // ignore
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }, [])
  );

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updated = await apiService.updateProfile({
        relationshipStatus,
        profession: profession?.trim(),
      });
      setProfile(updated);
      await refreshUser();
      Alert.alert('Başarılı', 'Profiliniz güncellendi');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Güncelleme başarısız';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StarBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StarBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Profil</Text>
        </View>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.fullName?.charAt?.(0)?.toUpperCase?.() ?? '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.fullName ?? '-'}</Text>
          <Text style={styles.email}>{profile?.email ?? '-'}</Text>

          <View style={styles.creditBadge}>
            <Text style={styles.creditIcon}>🪙</Text>
            <Text style={styles.creditValue}>{profile?.credits ?? 0}</Text>
            <Text style={styles.creditLabel}>kredi</Text>
          </View>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Doğum Tarihi</Text>
            <Text style={styles.infoValue}>{formatDate(profile?.birthDate)}</Text>
          </View>
        </View>

        {/* Editable section */}
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Düzenlenebilir Bilgiler</Text>

          <Menu
            visible={showRelationshipMenu}
            onDismiss={() => setShowRelationshipMenu(false)}
            anchor={
              <Pressable onPress={() => setShowRelationshipMenu(true)}>
                <TextInput
                  label="İlişki Durumu"
                  value={relationshipStatus}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon icon="menu-down" color={colors.placeholder} />}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.gold}
                  textColor={colors.text}
                  theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
                />
              </Pressable>
            }
            contentStyle={styles.menuContent}
          >
            {RELATIONSHIP_OPTIONS.map((option) => (
              <Menu.Item
                key={option}
                onPress={() => {
                  setRelationshipStatus(option);
                  setShowRelationshipMenu(false);
                }}
                title={option}
                titleStyle={styles.menuItemTitle}
              />
            ))}
          </Menu>

          <TextInput
            label="Meslek"
            value={profession}
            onChangeText={setProfession}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.border}
            activeOutlineColor={colors.gold}
            textColor={colors.text}
            theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
          />

          <GoldButton
            onPress={handleUpdate}
            loading={saving}
            style={styles.updateButton}
          >
            Güncelle
          </GoldButton>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  creditIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  creditValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold,
  },
  creditLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  editSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: colors.background,
  },
  menuContent: {
    backgroundColor: colors.surface,
  },
  menuItemTitle: {
    color: colors.text,
  },
  updateButton: {
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
});
