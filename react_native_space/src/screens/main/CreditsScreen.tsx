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
import { CreditPackage, SubscriptionPlan, SubscriptionStatus } from '../../types';

export const CreditsScreen: React.FC = () => {
  const { updateUserCredits, refreshUser } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subscription' | 'credits'>('subscription');

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [packagesData, balanceData, plansData, statusData] = await Promise.all([
            apiService.getCreditPackages(),
            apiService.getCreditBalance(),
            apiService.getSubscriptionPlans(),
            apiService.getSubscriptionStatus().catch(() => null),
          ]);
          setPackages(packagesData ?? []);
          setCredits(balanceData?.credits ?? 0);
          setSubscriptionPlans(plansData ?? []);
          setSubscriptionStatus(statusData);
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

  const handleSubscribe = async (planType: string, planName: string) => {
    setPurchaseLoading(planType);
    try {
      const result = await apiService.subscribe(planType);
      Alert.alert('Başarılı! 🎉', result?.message ?? 'Abonelik başarılı!');
      await refreshUser();
      const [balanceData, statusData] = await Promise.all([
        apiService.getCreditBalance(),
        apiService.getSubscriptionStatus().catch(() => null),
      ]);
      setCredits(balanceData?.credits ?? 0);
      setSubscriptionStatus(statusData);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Abonelik başarısız. Lütfen tekrar deneyin.';
      Alert.alert('Hata', message);
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Abonelik İptali',
      'Aboneliğinizi iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelSubscription();
              Alert.alert('Başarılı', 'Aboneliğiniz iptal edildi.');
              await refreshUser();
              const statusData = await apiService.getSubscriptionStatus().catch(() => null);
              setSubscriptionStatus(statusData);
            } catch (err: any) {
              const message = err?.response?.data?.message ?? 'İptal başarısız.';
              Alert.alert('Hata', message);
            }
          },
        },
      ]
    );
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'weekly': return '🌟';
      case 'monthly': return '💎';
      case 'yearly': return '👑';
      default: return '⭐';
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('tr-TR');
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
          <Text style={styles.headerTitle}>🪙 Kredi & Premium</Text>
        </View>

        {/* Current balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
              <View style={styles.creditsRow}>
                <Text style={styles.balanceIcon}>🪙</Text>
                <Text style={styles.balanceValue}>{credits}</Text>
              </View>
            </View>
            {subscriptionStatus?.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>👑 PREMIUM</Text>
                <Text style={styles.premiumExpiry}>
                  {formatDate(subscriptionStatus?.premiumExpiresAt)} kadar
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'subscription' && styles.tabActive]}
            onPress={() => setActiveTab('subscription')}
          >
            <Text style={[styles.tabText, activeTab === 'subscription' && styles.tabTextActive]}>
              Premium Planlar
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'credits' && styles.tabActive]}
            onPress={() => setActiveTab('credits')}
          >
            <Text style={[styles.tabText, activeTab === 'credits' && styles.tabTextActive]}>
              Kredi Paketleri
            </Text>
          </Pressable>
        </View>

        {activeTab === 'subscription' ? (
          <>
            {/* Active subscription info */}
            {subscriptionStatus?.activeSubscription && (
              <View style={styles.activeSubCard}>
                <Text style={styles.activeSubTitle}>Aktif Aboneliğiniz</Text>
                <Text style={styles.activeSubPlan}>
                  {subscriptionStatus.activeSubscription.planType === 'weekly' && 'Haftalık Premium'}
                  {subscriptionStatus.activeSubscription.planType === 'monthly' && 'Aylık Premium'}
                  {subscriptionStatus.activeSubscription.planType === 'yearly' && 'Yıllık Premium'}
                </Text>
                <Text style={styles.activeSubExpiry}>
                  Bitiş: {formatDate(subscriptionStatus.activeSubscription.endDate)}
                </Text>
                <Pressable style={styles.cancelButton} onPress={handleCancelSubscription}>
                  <Text style={styles.cancelButtonText}>Aboneliği İptal Et</Text>
                </Pressable>
              </View>
            )}

            {/* Subscription plans */}
            <View style={styles.plansContainer}>
              {(subscriptionPlans ?? []).map((plan, index) => (
                <View
                  key={plan?.id ?? index}
                  style={[
                    styles.planCard,
                    plan?.planType === 'yearly' && styles.planCardPopular,
                  ]}
                >
                  {plan?.planType === 'yearly' && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>En Avantajlı</Text>
                    </View>
                  )}
                  <Text style={styles.planIcon}>{getPlanIcon(plan?.planType ?? '')}</Text>
                  <Text style={styles.planName}>{plan?.name ?? ''}</Text>
                  <Text style={styles.planPrice}>{plan?.price ?? 0} TL</Text>
                  <Text style={styles.planCredits}>+{plan?.credits ?? 0} Kredi</Text>
                  <View style={styles.featuresContainer}>
                    {(plan?.features ?? []).map((feature, i) => (
                      <Text key={i} style={styles.featureText}>✓ {feature}</Text>
                    ))}
                  </View>
                  <Pressable
                    style={[
                      styles.subscribeButton,
                      plan?.planType === 'yearly' && styles.subscribeButtonPopular,
                      subscriptionStatus?.isPremium && styles.subscribeButtonDisabled,
                    ]}
                    onPress={() => handleSubscribe(plan?.planType ?? '', plan?.name ?? '')}
                    disabled={!!purchaseLoading || subscriptionStatus?.isPremium}
                  >
                    {purchaseLoading === plan?.planType ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Text style={styles.subscribeButtonText}>
                        {subscriptionStatus?.isPremium ? 'Aktif' : 'Abone Ol'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Credit packages */}
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
          </>
        )}

        <Text style={styles.note}>
          ℹ️ Her fal baktırma 3 kredi düşer • Premium üyelerde reklam yok
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
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {},
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.gold,
  },
  premiumBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  premiumExpiry: {
    color: colors.background,
    fontSize: 10,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.background,
  },
  activeSubCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  activeSubTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activeSubPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gold,
    marginTop: 4,
  },
  activeSubExpiry: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.error,
    fontSize: 14,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  planCardPopular: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  planIcon: {
    fontSize: 48,
    marginBottom: 8,
    marginTop: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gold,
    marginTop: 4,
  },
  planCredits: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  featuresContainer: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    paddingLeft: 8,
  },
  subscribeButton: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  subscribeButtonPopular: {
    backgroundColor: colors.gold,
  },
  subscribeButtonDisabled: {
    opacity: 0.5,
  },
  subscribeButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
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
    marginTop: 20,
    marginBottom: 24,
  },
});
