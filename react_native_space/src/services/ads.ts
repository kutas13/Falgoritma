import { Platform } from 'react-native';
import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Ad Unit IDs
const REWARDED_AD_UNIT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_REWARDED || TestIds.REWARDED,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED || TestIds.REWARDED,
  default: TestIds.REWARDED,
});

const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  ios: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL || TestIds.INTERSTITIAL,
  android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL || TestIds.INTERSTITIAL,
  default: TestIds.INTERSTITIAL,
});

class AdsService {
  private rewardedAd: RewardedAd | null = null;
  private interstitialAd: InterstitialAd | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized || Platform.OS === 'web') return;
    
    try {
      await mobileAds().initialize();
      this.isInitialized = true;
      
      // Preload ads
      this.loadRewardedAd();
      this.loadInterstitialAd();
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }

  private loadRewardedAd() {
    if (Platform.OS === 'web') return;

    this.rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID);
    
    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
    });

    this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('User earned reward:', reward);
    });

    this.rewardedAd.load();
  }

  private loadInterstitialAd() {
    if (Platform.OS === 'web') return;

    this.interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);
    
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
    });

    this.interstitialAd.load();
  }

  async showRewardedAd(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    return new Promise((resolve) => {
      if (!this.rewardedAd) {
        this.loadRewardedAd();
        resolve(false);
        return;
      }

      const loadedListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          loadedListener();
          this.rewardedAd?.show();
        }
      );

      const earnedListener = this.rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earnedListener();
          closedListener();
          this.loadRewardedAd(); // Preload next ad
          resolve(true);
        }
      );

      const closedListener = this.rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          closedListener();
          earnedListener();
          loadedListener();
          this.loadRewardedAd(); // Preload next ad
          resolve(false);
        }
      );

      // If ad is already loaded, show immediately
      if (this.rewardedAd.loaded) {
        loadedListener();
        this.rewardedAd.show();
      }
    });
  }

  async showInterstitialAd(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    return new Promise((resolve) => {
      if (!this.interstitialAd) {
        this.loadInterstitialAd();
        resolve(false);
        return;
      }

      const loadedListener = this.interstitialAd.addAdEventListener(
        AdEventType.LOADED,
        () => {
          loadedListener();
          this.interstitialAd?.show();
        }
      );

      const closedListener = this.interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          closedListener();
          loadedListener();
          this.loadInterstitialAd(); // Preload next ad
          resolve(true);
        }
      );

      // If ad is already loaded, show immediately
      if (this.interstitialAd.loaded) {
        loadedListener();
        this.interstitialAd.show();
      }
    });
  }
}

export const adsService = new AdsService();
