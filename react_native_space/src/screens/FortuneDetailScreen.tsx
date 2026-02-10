import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  Platform,
  Pressable,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';
import { GoldButton } from '../components/GoldButton';
import { StarBackground } from '../components/StarBackground';
import { colors } from '../theme';
import { RootStackParamList, Fortune } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'FortuneDetail'>;

export const FortuneDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StarBackground />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StarBackground />
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation?.goBack?.()} style={styles.backButton}>
          <Text style={styles.backText}>← Geri</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🔮</Text>
          <Text style={styles.headerDate}>{formatDate(fortune?.createdAt)}</Text>
          {fortune?.guestName && (
            <Text style={styles.guestInfo}>
              👤 {fortune.guestName} için bakıldı
            </Text>
          )}
        </View>

        {/* Fortune card */}
        <View style={styles.fortuneCard}>
          <View style={styles.cardBorderTop} />
          <Text style={styles.interpretation}>
            {fortune?.interpretation ?? 'Fal yorumu bulunamadı.'}
          </Text>
          <View style={styles.cardBorderBottom} />
        </View>

        {/* Share button */}
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
  headerBar: {
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  guestInfo: {
    fontSize: 14,
    color: colors.gold,
    marginTop: 4,
  },
  fortuneCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
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
  shareButton: {
    marginBottom: 32,
  },
});
