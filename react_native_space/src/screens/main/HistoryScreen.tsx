import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiService } from '../../services/api';
import { StarBackground } from '../../components/StarBackground';
import { colors } from '../../theme';
import { RootStackParamList, FortuneListItem } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fortunes, setFortunes] = useState<FortuneListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFortunes = async () => {
    try {
      const data = await apiService.getFortunesList();
      setFortunes(data ?? []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFortunes();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadFortunes();
  };

  const formatDate = (dateString: string) => {
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
      return dateString ?? '';
    }
  };

  const renderItem = ({ item }: { item: FortuneListItem }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation?.navigate?.('FortuneDetail', { fortuneId: item?.id ?? '' })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>🔮</Text>
        <Text style={styles.cardDate}>{formatDate(item?.createdAt ?? '')}</Text>
      </View>
      <Text style={styles.cardPreview} numberOfLines={3}>
        {item?.preview ?? ''}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.viewMore}>Detayı Gör →</Text>
      </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌙</Text>
      <Text style={styles.emptyTitle}>Henüz fal baktırmadınız</Text>
      <Text style={styles.emptySubtitle}>
        Ana sayfadan yeni bir fal baktırabilirsiniz
      </Text>
    </View>
  );

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📜 Fal Geçmişi</Text>
      </View>
      <FlatList
        data={fortunes ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item?.id ?? ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardPreview: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  viewMore: {
    color: colors.gold,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
