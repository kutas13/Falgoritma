import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../../context/AuthContext';
import { GoldButton } from '../../components/GoldButton';
import { StarBackground } from '../../components/StarBackground';
import { colors } from '../../theme';
import { AuthStackParamList } from '../../types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, googleSignIn, appleSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setGoogleLoading(true);
    setError('');
    try {
      await googleSignIn(idToken);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Google ile giriş başarısız.';
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Bilgi', 'Apple ile giriş sadece iOS cihazlarda desteklenmektedir.');
      return;
    }
    
    setAppleLoading(true);
    setError('');
    try {
      const AppleAuthentication = require('expo-apple-authentication');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const fullName = credential.fullName
        ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
        : undefined;
      
      await appleSignIn(credential.identityToken, fullName);
    } catch (err: any) {
      if (err?.code !== 'ERR_CANCELED') {
        const message = err?.response?.data?.message ?? 'Apple ile giriş başarısız.';
        setError(message);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if ((password?.length ?? 0) < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(email.trim(), password);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Kayıt başarısız. Lütfen tekrar deneyin.';
      setError(message);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.logo}>☕🔮</Text>
            <Text style={styles.title}>Kayıt Ol</Text>
            <Text style={styles.subtitle}>Yeni hesap oluştur</Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.gold}
              textColor={colors.text}
              theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
            />

            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.gold}
              textColor={colors.text}
              theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  color={colors.placeholder}
                />
              }
            />

            <TextInput
              label="Şifre Tekrar"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              style={styles.input}
              outlineColor={colors.border}
              activeOutlineColor={colors.gold}
              textColor={colors.text}
              theme={{ colors: { onSurfaceVariant: colors.placeholder } }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GoldButton
              onPress={handleRegister}
              loading={loading}
              style={styles.button}
            >
              Kayıt Ol
            </GoldButton>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => promptAsync()}
              disabled={!request || googleLoading}
            >
              <Text style={styles.socialButtonIcon}>G</Text>
              <Text style={styles.socialButtonText}>
                {googleLoading ? 'Kaydediliyor...' : 'Google ile Kayıt Ol'}
              </Text>
            </Pressable>

            {Platform.OS === 'ios' && (
              <Pressable
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
                disabled={appleLoading}
              >
                <Text style={styles.socialButtonIcon}></Text>
                <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                  {appleLoading ? 'Kaydediliyor...' : 'Apple ile Kayıt Ol'}
                </Text>
              </Pressable>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
              <Text
                style={styles.loginLink}
                onPress={() => navigation?.navigate?.('Login')}
              >
                Giriş Yap
              </Text>
            </View>
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
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gold,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
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
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  socialButtonIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appleButtonText: {
    color: '#fff',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
