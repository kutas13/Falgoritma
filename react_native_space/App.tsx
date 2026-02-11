import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { paperTheme } from './src/theme';
import { adsService } from './src/services/ads';
import { notificationService } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    // Initialize AdMob and Notifications
    adsService.initialize();
    notificationService.initialize();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <PaperProvider theme={paperTheme}>
            <AuthProvider>
              <StatusBar barStyle="light-content" backgroundColor="#1a0a2e" />
              <AppNavigator />
            </AuthProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
