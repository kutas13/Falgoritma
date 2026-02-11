# Falgoritma - Türk Kahvesi Falı Uygulaması ☕🔮

Yapay zeka destekli Türk kahvesi falı mobil uygulaması.

## 🎯 Özellikler

- ✅ Email/Password + Google/Apple OAuth girişi
- ✅ Onboarding (Ad, doğum tarihi, burç, ilişki durumu, meslek)
- ✅ 6 hoşgeldin kredisi
- ✅ Fotoğraf yükleme (5 slot, kamera/galeri)
- ✅ AI fal yorumu (GPT-4o)
- ✅ Burç analizli yorum
- ✅ Fal geçmişi
- ✅ Kredi sistemi (3 kredi/fal)
- ✅ Premium abonelik (Haftalık/Aylık/Yıllık)
- ✅ AdMob video reklamları (Ödüllü + Interstitial)
- ✅ Push notification
- ✅ Türkçe dil desteği
- ✅ Mistik mor/altın tema

## 🏗️ Teknoloji

**Backend:** NestJS + PostgreSQL + Prisma ORM  
**Frontend:** React Native + Expo  
**AI:** OpenAI GPT-4o  
**Ads:** Google AdMob  
**Auth:** JWT + OAuth (Google/Apple)

## 📱 Kurulum

### Backend
```bash
cd nodejs_space
yarn install
yarn run build
yarn start
```

### Mobile App
```bash
cd react_native_space
yarn install
yarn start
```

## 🚀 Build

### Android APK (GitHub Actions)
1. GitHub'a push yapın
2. Actions tab'ında "Build Android APK" workflow'u çalışacak
3. APK'yı Artifacts'ten indirin

### Manuel Build
```bash
cd react_native_space
eas build --platform android --profile preview
```

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
OPENAI_API_KEY=...
GOOGLE_CLIENT_ID=...
APPLE_CLIENT_ID=...
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=https://...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=...
EXPO_PUBLIC_ADMOB_IOS_APP_ID=...
EXPO_PUBLIC_ADMOB_ANDROID_REWARDED=...
EXPO_PUBLIC_ADMOB_IOS_REWARDED=...
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL=...
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL=...
```

## 📄 Lisans

Tüm hakları saklıdır © 2026 Falgoritma
