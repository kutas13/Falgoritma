# 🚀 GitHub Actions ile APK Build Kurulumu

## Adım 1: GitHub Repository Oluştur

1. https://github.com/new adresine git
2. Repository adı: **falgoritma** (veya istediğin ad)
3. **Private** seç (önerilen)
4. **Create repository** tıkla

---

## Adım 2: Expo Token Al

1. https://expo.dev/accounts/abacus.ai/settings/access-tokens adresine git
2. **Create Token** butonu
3. İsim: **GitHub Actions**
4. Token'ı kopyala (bir daha gösterilmeyecek!)

---

## Adım 3: GitHub Secrets Ekle

1. GitHub repo sayfanda: **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** butonu
3. Name: `EXPO_TOKEN`
4. Value: *(Adım 2'deki token'ı yapıştır)*
5. **Add secret**

---

## Adım 4: Kodu GitHub'a Push Et

Aşağıdaki komutları sırayla çalıştır:

```bash
cd /home/ubuntu/falgoritma

# GitHub repo URL'ini ekle (kendi repo URL'inle değiştir):
git remote add origin https://github.com/KULLANICI_ADIN/falgoritma.git

# Push yap:
git branch -M main
git push -u origin main
```

---

## Adım 5: Build Başlat

**Otomatik:** Push sonrası GitHub Actions otomatik başlayacak!

**Manuel:** 
1. GitHub repo → **Actions** tab
2. **Build Android APK** workflow'u seç
3. **Run workflow** butonu
4. **Run workflow** onayla

---

## Adım 6: APK İndir

Build tamamlanınca (~10-15 dakika):

1. **Actions** tab → Tamamlanan workflow'a tıkla
2. En altta **Artifacts** bölümü
3. **falgoritma-android** indir
4. ZIP'i aç, APK'yı telefonuna yükle!

---

## ⚠️ Önemli Notlar

- **Expo token** gizli tutulmalı!
- Build credits Expo hesabından kesilecek
- APK test amaçlıdır (Google Play'e yüklenemez)
- Production build için **production** profile kullan

