import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  User,
  OnboardingData,
  CreateFortuneRequest,
  Fortune,
  FortuneListItem,
  CreditPackage,
  CreditBalance,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://10e655aef2.na106.preview.abacusai.app/';

class ApiService {
  private api: AxiosInstance;
  private logoutCallback?: () => void;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 120000, // 2 dakika - LLM işlemi uzun sürebilir
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for 401
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
          this.logoutCallback?.();
        }
        return Promise.reject(error);
      }
    );
  }

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  // Auth endpoints
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/register', { email, password });
    return response?.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/login', { email, password });
    return response?.data;
  }

  async googleAuth(idToken: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/google', { idToken });
    return response?.data;
  }

  async appleAuth(identityToken: string, fullName?: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/apple', { identityToken, fullName });
    return response?.data;
  }

  async getMe(): Promise<User> {
    const response = await this.api.get<User>('/api/auth/me');
    return response?.data;
  }

  // User endpoints
  async completeOnboarding(data: OnboardingData): Promise<User> {
    const response = await this.api.post<User>('/api/users/onboarding', data);
    return response?.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/api/users/profile');
    return response?.data;
  }

  async updateProfile(data: { relationshipStatus?: string; profession?: string }): Promise<User> {
    const response = await this.api.patch<User>('/api/users/profile', data);
    return response?.data;
  }

  // Fortune endpoints
  async createFortune(data: CreateFortuneRequest): Promise<Fortune> {
    const response = await this.api.post<Fortune>('/api/fortunes', data);
    return response?.data;
  }

  async getFortunesList(): Promise<FortuneListItem[]> {
    const response = await this.api.get<FortuneListItem[]>('/api/fortunes');
    return response?.data ?? [];
  }

  async getFortuneById(id: string): Promise<Fortune> {
    const response = await this.api.get<Fortune>(`/api/fortunes/${id}`);
    return response?.data;
  }

  // Credit endpoints
  async getCreditBalance(): Promise<CreditBalance> {
    const response = await this.api.get<CreditBalance>('/api/credits/balance');
    return response?.data;
  }

  async getCreditPackages(): Promise<CreditPackage[]> {
    const response = await this.api.get<CreditPackage[]>('/api/credits/packages');
    return response?.data ?? [];
  }

  async simulatePurchase(packageId: string): Promise<{ credits: number; message: string }> {
    const response = await this.api.post<{ credits: number; message: string }>('/api/credits/simulate-purchase', { packageId });
    return response?.data;
  }

  // Subscription endpoints
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await this.api.get<SubscriptionPlan[]>('/api/subscriptions/plans');
    return response?.data ?? [];
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await this.api.get<SubscriptionStatus>('/api/subscriptions/status');
    return response?.data;
  }

  async subscribe(planType: string): Promise<{ subscription: any; message: string }> {
    const response = await this.api.post<{ subscription: any; message: string }>('/api/subscriptions/subscribe', { planType });
    return response?.data;
  }

  async cancelSubscription(): Promise<{ message: string }> {
    const response = await this.api.post<{ message: string }>('/api/subscriptions/cancel');
    return response?.data;
  }
}

export const apiService = new ApiService();
