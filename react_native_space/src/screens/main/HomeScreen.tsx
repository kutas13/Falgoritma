import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Text, TextInput, Menu, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { GoldButton } from '../../components/GoldButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { StarBackground } from '../../components/StarBackground';
import { colors } from '../../theme';
import { RootStackParamList, GuestData } from '../../types';

const RELATIONSHIP_OPTIONS = ['Bekar', 'Evli', 'Platonik', 'Diğer'];
const GENDER_OPTIONS = ['Kadın', 'Erkek', 'Diğer'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [forSelf, setForSelf] = useState(true);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(user?.credits ?? 0);

  // Guest data
  const [guestName, setGuestName] = useState('');
  const [guestGender, setGuestGender] = useState('');
  const [guestBirthDate, setGuestBirthDate] = useState<Date | null>(null);
  const [guestRelationship, setGuestRelationship] = useState('');
  const [guestProfession, setGuestProfession] = useState('');
  const [showGenderMenu, setShowGenderMenu] = useState(false);
  const [showRelationshipMenu, setShowRelationshipMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadCredits = async () => {
        try {
          const balance = await apiService.getCreditBalance();
          setCredits(balance?.credits ?? 0);
        } catch (e) {
          // ignore
        }
      };
      loadCredits();
    }, [])
  );

  const pickImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result?.assets?.[0]?.base64) {
        const newPhotos = [...photos];
        newPhotos[index] = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setPhotos(newPhotos);
      }
    } catch (e) {
      Alert.alert('Hata', 'Fotoğraf seçilemedi');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    const photoCount = photos?.filter(Boolean)?.length ?? 0;
    if (photoCount === 0) {
      Alert.alert('Uyarı', 'Lütfen en az 1 fincan fotoğrafı yükleyin');
      return;
    }

    if (credits < 3) {
      Alert.alert('Yetersiz Kredi', 'Yetersiz kredi! Kredi satın alın.', [
        { text: 'Tamam', style: 'cancel' },
        { text: 'Kredi Al', onPress: () => navigation?.navigate?.('Main', { screen: 'Credits' } as any) },
      ]);
      return;
    }

    if (!forSelf) {
      if (!guestName?.trim() || !guestGender || !guestBirthDate || !guestRelationship || !guestProfession?.trim()) {
        Alert.alert('Uyarı', 'Lütfen misafir bilgilerini eksiksiz doldurun');
        return;
      }
    }

    setLoading(true);

    try {
      let guestData: GuestData | undefined;
      if (!forSelf) {
        guestData = {
          name: guestName.trim(),
          gender: guestGender,
          birthDate: guestBirthDate?.toISOString().split('T')[0] ?? '',
          relationshipStatus: guestRelationship,
          profession: guestProfession.trim(),
        };
      }

      const fortune = await apiService.createFortune({
        photos: photos.filter(Boolean),
        forSelf,
        guestData,
      });

      await refreshUser();
      setPhotos([]);
      setGuestName('');
      setGuestGender('');
      setGuestBirthDate(null);
      setGuestRelationship('');
      setGuestProfession('');
      setForSelf(true);

      navigation?.navigate?.('FortuneResult', { fortuneId: fortune?.id ?? '' });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Fal oluşturulamadı. Lütfen tekrar deneyin.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StarBackground />
      <LoadingOverlay visible={loading} message="Enerjin Analiz Ediliyor..." />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with credits */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>☕ Fal Baktır</Text>
          <View style={styles.creditBadge}>
            <Text style={styles.creditIcon}>🪙</Text>
            <Text style={styles.creditText}>{credits}</Text>
          </View>
        </View>

        {/* Photo slots */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Fincan Fotoğrafları</Text>
          <Text style={styles.sectionSubtitle}>
            En az 1, en fazla 5 fotoğraf yükleyin
          </Text>
          <View style={styles.photoGrid}>
            {[0, 1, 2, 3, 4].map((index) => (
              <Pressable
                key={index}
                style={styles.photoSlot}
                onPress={() => pickImage(index)}
                onLongPress={() => photos?.[index] && removePhoto(index)}
              >
                {photos?.[index] ? (
                  <Image
                    source={{ uri: photos[index] }}
                    style={styles.photoImage}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderIcon}>📷</Text>
                    <Text style={styles.photoPlaceholderText}>
                      {index === 0 ? 'Ekle' : ''}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* For self / for guest selection */}
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Kimin İçin?</Text>
          <View style={styles.chipRow}>
            <Chip
              selected={forSelf}
              onPress={() => setForSelf(true)}
              style={[styles.chip, forSelf && styles.chipSelected]}
              textStyle={[styles.chipText, forSelf && styles.chipTextSelected]}
              showSelectedCheck={false}
            >
              Kendim İçin
            </Chip>
            <Chip
              selected={!forSelf}
              onPress={() => setForSelf(false)}
              style={[styles.chip, !forSelf && styles.chipSelected]}
              textStyle={[styles.chipText, !forSelf && styles.chipTextSelected]}
              showSelectedCheck={false}
            >
              Başkası İçin
            </Chip>
          </View>
        </View>

        {/* Guest form */}
        {!forSelf && (
          <View style={styles.guestForm}>
            <Text style={styles.sectionTitle}>Misafir Bilgileri</Text>

            <TextInput
              label="İsim"
              value={guestName}
              onChangeText={setGuestName}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.gold}
              textColor={colors.text}
              theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
            />

            <Menu
              visible={showGenderMenu}
              onDismiss={() => setShowGenderMenu(false)}
              anchor={
                <Pressable onPress={() => setShowGenderMenu(true)}>
                  <TextInput
                    label="Cinsiyet"
                    value={guestGender}
                    mode="outlined"
                    style={styles.input}
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" color={colors.placeholder} />}
                    outlineColor={colors.border}
                    textColor={colors.text}
                    theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
                  />
                </Pressable>
              }
              contentStyle={styles.menuContent}
            >
              {GENDER_OPTIONS.map((option) => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setGuestGender(option);
                    setShowGenderMenu(false);
                  }}
                  title={option}
                  titleStyle={styles.menuItemTitle}
                />
              ))}
            </Menu>

            <Pressable onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Doğum Tarihi"
                value={formatDate(guestBirthDate)}
                mode="outlined"
                style={styles.input}
                editable={false}
                right={<TextInput.Icon icon="calendar" color={colors.placeholder} />}
                outlineColor={colors.border}
                textColor={colors.text}
                theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
              />
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={guestBirthDate ?? new Date(1990, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setGuestBirthDate(selectedDate);
                  }
                }}
              />
            )}

            <Menu
              visible={showRelationshipMenu}
              onDismiss={() => setShowRelationshipMenu(false)}
              anchor={
                <Pressable onPress={() => setShowRelationshipMenu(true)}>
                  <TextInput
                    label="İlişki Durumu"
                    value={guestRelationship}
                    mode="outlined"
                    style={styles.input}
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" color={colors.placeholder} />}
                    outlineColor={colors.border}
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
                    setGuestRelationship(option);
                    setShowRelationshipMenu(false);
                  }}
                  title={option}
                  titleStyle={styles.menuItemTitle}
                />
              ))}
            </Menu>

            <TextInput
              label="Meslek"
              value={guestProfession}
              onChangeText={setGuestProfession}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.gold}
              textColor={colors.text}
              theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
            />
          </View>
        )}

        {/* Submit button */}
        <View style={styles.submitSection}>
          <Text style={styles.costText}>
            🪙 3 kredi düşer
          </Text>
          <GoldButton onPress={handleSubmit} style={styles.submitButton}>
            ✨ Yorumla
          </GoldButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  creditIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  creditText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gold,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoSlot: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  selectionSection: {
    marginBottom: 24,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.background,
    fontWeight: 'bold',
  },
  guestForm: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
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
  submitSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  costText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  submitButton: {
    width: '100%',
    maxWidth: 300,
  },
});
