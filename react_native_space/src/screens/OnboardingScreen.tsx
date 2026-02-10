import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Text, TextInput, Menu } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { GoldButton } from '../components/GoldButton';
import { StarBackground } from '../components/StarBackground';
import { colors } from '../theme';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

const RELATIONSHIP_OPTIONS = ['Bekar', 'İlişkisi Var', 'Evli', 'Platonik', 'Diğer'];

export const OnboardingScreen: React.FC = () => {
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRelationshipMenu, setShowRelationshipMenu] = useState(false);

  const handleSubmit = async () => {
    if (!fullName?.trim()) {
      setError('Lütfen adınızı girin');
      return;
    }
    if (!birthDate) {
      setError('Lütfen doğum tarihinizi seçin');
      return;
    }
    if (!relationshipStatus) {
      setError('Lütfen ilişki durumunuzu seçin');
      return;
    }
    if (!profession?.trim()) {
      setError('Lütfen mesleğinizi girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.completeOnboarding({
        fullName: fullName.trim(),
        birthDate: birthDate.toISOString().split('T')[0],
        relationshipStatus,
        profession: profession.trim(),
      });
      await refreshUser();
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <View style={styles.container}>
      <StarBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Hoş Geldin!</Text>
            <Text style={styles.subtitle}>Seni tanıyalım</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.gold}
              textColor={colors.text}
              theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
            />

            {Platform.OS === 'web' ? (
              <View style={styles.webDateContainer}>
                <Text style={styles.webDateLabel}>Doğum Tarihi</Text>
                <input
                  type="date"
                  value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      setBirthDate(new Date(dateValue));
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: 16,
                    fontSize: 16,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    marginBottom: 16,
                  }}
                />
              </View>
            ) : (
              <>
                <Pressable onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    label="Doğum Tarihi"
                    value={formatDate(birthDate)}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.gold}
                    textColor={colors.text}
                    editable={false}
                    right={<TextInput.Icon icon="calendar" color={colors.placeholder} />}
                    theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
                  />
                </Pressable>

                {showDatePicker && DateTimePicker && (
                  <DateTimePicker
                    value={birthDate ?? new Date(1990, 0, 1)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setBirthDate(selectedDate);
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
                    value={relationshipStatus}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.gold}
                    textColor={colors.text}
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" color={colors.placeholder} />}
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

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.bonusContainer}>
              <Text style={styles.bonusIcon}>🎁</Text>
              <Text style={styles.bonusText}>
                Bilgilerini tamamla, <Text style={styles.bonusHighlight}>6 kredi kazan!</Text>
              </Text>
            </View>

            <GoldButton
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            >
              Devam Et
            </GoldButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gold,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
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
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  bonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  bonusIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  bonusText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  bonusHighlight: {
    color: colors.gold,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 8,
  },
});
