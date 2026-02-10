import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { StarBackground } from '../../components/StarBackground';
import { colors } from '../../theme';
import { CreditPackage } from '../../types';

export const CreditsScreen: React.FC = () => {
  const { updateUserCredits } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [packagesData, balanceData] = await Promise.all([
            apiService.getCreditPackages(),
            apiService.getCreditBalance(),
          ]);
          setPackages(packagesData ?? []);
          setCredits(balanceData?.credits ?? 0);
        } catch (e) {
          // ignore
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const handlePurchase = async (packageId: string, packageName: string) => {
    setPurchaseLoading(packageId);
    try {
      const result = await apiService.simulatePurchase(packageId);
      setCredits(result?.credits ?? 0);
      updateUserCredits(result?.credits ?? 0);
      Alert.alert(
        'Başarılı! 🎉',
        `${packageName} paketi satın alındı. Yeni bakiyeniz: ${result?.credits ?? 0} kredi`
      );
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Satın alma başarısız. Lütfen tekrar deneyin.';
      Alert.alert('Hata', message);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case 'mini': return '🌟';
      case 'standart': return '⭐';
      case 'avantajli': return '💫';
      case 'power': return '👑';
      default: return '🪙';
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
          <Text style={styles.headerTitle}>🪙 Kredi</Text>
        </View>

        {/* Current balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceIcon}>🪙</Text>
            <Text style={styles.balanceValue}>{credits}</Text>
            <Text style={styles.balanceUnit}>kredi</Text>
          </View>
        </View>

        {/* Packages */}
        <Text style={styles.packagesTitle}>Kredi Paketleri</Text>
        <View style={styles.packagesGrid}>
          {(packages ?? []).map((pkg) => (
            <View
              key={pkg?.id ?? ''}
              style={[
                styles.packageCard,
                pkg?.id === 'power' && styles.packageCardPopular,
              ]}
            >
              {pkg?.id === 'power' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>En Popüler</Text>
                </View>
              )}
              <Text style={styles.packageIcon}>{getPackageIcon(pkg?.id ?? '')}</Text>
              <Text style={styles.packageName}>{pkg?.name ?? ''}</Text>
              <Text style={styles.packageCredits}>{pkg?.credits ?? 0} Kredi</Text>
              <Text style={styles.packagePrice}>{pkg?.priceTL ?? 0} TL</Text>
              <Pressable
                style={[
                  styles.buyButton,
                  pkg?.id === 'power' && styles.buyButtonPopular,
                ]}
                onPress={() => handlePurchase(pkg?.id ?? '', pkg?.name ?? '')}
                disabled={!!purchaseLoading}
              >
                {purchaseLoading === pkg?.id ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={styles.buyButtonText}>Satın Al</Text>
                )}
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          ℹ️ Her fal baktırma 3 kredi düşer
        </Text>
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
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gold,
  },
  balanceUnit: {
    fontSize: 18,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  packagesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  packageCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packageCardPopular: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.background,
  },
  packageIcon: {
    fontSize: 36,
    marginBottom: 8,
    marginTop: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  packageCredits: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonPopular: {
    backgroundColor: colors.gold,
  },
  buyButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});
