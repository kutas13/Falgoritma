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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { adsService } from '../../services/ads';
import { GoldButton } from '../../components/GoldButton';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { StarBackground } from '../../components/StarBackground';
import { colors } from '../../theme';
import { RootStackParamList, GuestData } from '../../types';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const RELATIONSHIP_OPTIONS = ['Bekar', 'İlişkisi Var', 'Evli', 'Platonik', 'Diğer'];
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
      // Show interstitial ad before fortune creation (only on mobile, not for premium users)
      if (Platform.OS !== 'web' && user && !user?.isPremium) {
        try {
          await adsService.showInterstitialAd();
        } catch (adError) {
          // Continue even if ad fails
          console.log('Ad failed to show:', adError);
        }
      }

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
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Merhaba, {user?.fullName?.split(' ')?.[0] || 'Falcı'} 👋</Text>
              <Text style={styles.headerSubtitle}>Bugün fincanında ne var?</Text>
            </View>
            <Pressable style={styles.creditBadge}>
              <Text style={styles.creditIcon}>🪙</Text>
              <Text style={styles.creditText}>{credits} Kredi</Text>
            </Pressable>
          </View>
          
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>☕🔮</Text>
            <Text style={styles.heroTitle}>Kahve Falı</Text>
            <Text style={styles.heroDescription}>
              Fincanınızı çevirin, fotoğrafını çekin ve geleceğinizi keşfedin
            </Text>
          </View>
        </View>

        {/* Photo slots */}
        <View style={styles.photoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📸 Fincan Fotoğrafları</Text>
            <Text style={styles.photoCount}>{photos?.filter(Boolean)?.length ?? 0}/5</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            En az 1 fotoğraf yükleyin • Uzun basarak silin
          </Text>
          <View style={styles.photoGrid}>
            {[0, 1, 2, 3, 4].map((index) => (
              <Pressable
                key={index}
                style={[
                  styles.photoSlot,
                  photos?.[index] && styles.photoSlotFilled,
                  index === 0 && !photos?.[0] && styles.photoSlotMain
                ]}
                onPress={() => pickImage(index)}
                onLongPress={() => photos?.[index] && removePhoto(index)}
              >
                {photos?.[index] ? (
                  <>
                    <Image
                      source={{ uri: photos[index] }}
                      style={styles.photoImage}
                    />
                    <View style={styles.photoOverlay}>
                      <Text style={styles.photoNumber}>{index + 1}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderIcon}>{index === 0 ? '📷' : '+'}</Text>
                    {index === 0 && <Text style={styles.photoPlaceholderText}>Ekle</Text>}
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

            {Platform.OS === 'web' ? (
              <View style={styles.webDateContainer}>
                <Text style={styles.webDateLabel}>Doğum Tarihi</Text>
                <TextInput
                  mode="outlined"
                  style={styles.input}
                  value={guestBirthDate ? guestBirthDate.toISOString().split('T')[0] : ''}
                  onChangeText={(text) => {
                    // Accept format: YYYY-MM-DD
                    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
                      setGuestBirthDate(new Date(text));
                    } else if (text === '') {
                      setGuestBirthDate(null);
                    }
                  }}
                  placeholder="YYYY-AA-GG (ör: 1990-05-15)"
                  outlineColor={colors.border}
                  activeOutlineColor={colors.gold}
                  textColor={colors.text}
                  theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
                  render={(props) => (
                    <input
                      {...(props as any)}
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      style={{
                        flex: 1,
                        padding: 16,
                        fontSize: 16,
                        backgroundColor: 'transparent',
                        color: colors.text,
                        border: 'none',
                        outline: 'none',
                      }}
                      value={guestBirthDate ? guestBirthDate.toISOString().split('T')[0] : ''}
                      onChange={(e: any) => {
                        const dateValue = e.target.value;
                        if (dateValue) {
                          setGuestBirthDate(new Date(dateValue));
                        }
                      }}
                    />
                  )}
                />
              </View>
            ) : (
              <>
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

                {showDatePicker && DateTimePicker && (
                  <DateTimePicker
                    value={guestBirthDate ?? new Date(1990, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setGuestBirthDate(selectedDate);
                      }
                    }}
                  />
                )}
              </>
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
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  creditIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  creditText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gold,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  photoSection: {
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  photoCount: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoSlot: {
    width: 58,
    height: 58,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: colors.gold,
  },
  photoSlotMain: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.gold,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 20,
    color: colors.textMuted,
  },
  photoPlaceholderText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
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
  webDateContainer: {
    marginBottom: 0,
  },
  webDateLabel: {
    color: colors.placeholder,
    fontSize: 12,
    marginBottom: 4,
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
