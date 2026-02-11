import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.log('Project ID not found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FFD700',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  async scheduleFortuneDoneNotification(delayMinutes: number = 2) {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '✨ Falınız Hazır!',
          body: 'Kahve falınız yorumlandı. Sonuçları görüntülemek için tıklayın.',
          data: { type: 'fortune_ready' },
          sound: true,
        },
        trigger: {
          seconds: delayMinutes * 60,
        },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async scheduleCreditsLowNotification() {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🪙 Krediniz Azaldı',
          body: 'Kredi bakiyeniz düşük. Yeni fallar için kredi satın alabilirsiniz.',
          data: { type: 'credits_low' },
          sound: true,
        },
        trigger: null, // Immediate
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelAllNotifications() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  getToken() {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
