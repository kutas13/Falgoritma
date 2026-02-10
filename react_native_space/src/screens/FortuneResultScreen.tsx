import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from '../services/api';
import { GoldButton } from '../components/GoldButton';
import { StarBackground } from '../components/StarBackground';
import { colors } from '../theme';
import { RootStackParamList, Fortune } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'FortuneResult'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export const FortuneResultScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFortune = async () => {
      try {
        const fortuneId = route?.params?.fortuneId;
        if (fortuneId) {
          const data = await apiService.getFortuneById(fortuneId);
          setFortune(data);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadFortune();
  }, [route?.params?.fortuneId]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🔮 Falgoritma'da baktırdığım fal:\n\n${fortune?.interpretation?.substring?.(0, 500) ?? ''}...`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleGoHome = () => {
    navigation?.reset?.({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StarBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Falınız yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StarBackground />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🔮</Text>
          <Text style={styles.headerTitle}>Falınız Hazır!</Text>
        </View>

        {/* Fortune card */}
        <View style={styles.fortuneCard}>
          <View style={styles.cardBorderTop} />
          <Text style={styles.interpretation}>
            {fortune?.interpretation ?? 'Fal yorumu bulunamadı.'}
          </Text>
          <View style={styles.cardBorderBottom} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <GoldButton onPress={handleGoHome} style={styles.homeButton}>
            Ana Sayfaya Dön
          </GoldButton>

          {Platform.OS !== 'web' && (
            <GoldButton
              onPress={handleShare}
              mode="outlined"
              style={styles.shareButton}
              icon="share"
            >
              Paylaş
            </GoldButton>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
  },
  fortuneCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  cardBorderTop: {
    height: 2,
    backgroundColor: colors.gold,
    marginBottom: 24,
    opacity: 0.5,
  },
  cardBorderBottom: {
    height: 2,
    backgroundColor: colors.gold,
    marginTop: 24,
    opacity: 0.5,
  },
  interpretation: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'left',
  },
  actions: {
    gap: 12,
  },
  homeButton: {
    marginBottom: 8,
  },
  shareButton: {},
});
