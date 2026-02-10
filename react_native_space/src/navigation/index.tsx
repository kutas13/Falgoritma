import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { navigationTheme, colors } from '../theme';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { CreditsScreen } from '../screens/main/CreditsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { FortuneResultScreen } from '../screens/FortuneResultScreen';
import { FortuneDetailScreen } from '../screens/FortuneDetailScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingTop: 8, height: 60 },
      tabBarActiveTintColor: colors.gold,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 12, marginBottom: 8 },
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Ana Sayfa', tabBarIcon: () => <Text style={{ fontSize: 20 }}>☕</Text> }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Geçmiş', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📜</Text> }} />
    <Tab.Screen name="Credits" component={CreditsScreen} options={{ tabBarLabel: 'Kredi', tabBarIcon: () => <Text style={{ fontSize: 20 }}>🪙</Text> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profil', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !user?.onboardingCompleted ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen name="FortuneResult" component={FortuneResultScreen} />
            <RootStack.Screen name="FortuneDetail" component={FortuneDetailScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
