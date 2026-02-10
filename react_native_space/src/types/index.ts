// User types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  birthDate?: string;
  relationshipStatus?: string;
  profession?: string;
  credits: number;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// Onboarding
export interface OnboardingData {
  fullName: string;
  birthDate: string;
  relationshipStatus: string;
  profession: string;
}

// Fortune types
export interface GuestData {
  name: string;
  gender: string;
  birthDate: string;
  relationshipStatus: string;
  profession: string;
}

export interface CreateFortuneRequest {
  photos: string[];
  forSelf: boolean;
  guestData?: GuestData;
}

export interface Fortune {
  id: string;
  createdAt: string;
  interpretation: string;
  photos?: string[];
  forSelf?: boolean;
  guestName?: string;
}

export interface FortuneListItem {
  id: string;
  createdAt: string;
  preview: string;
}

// Credit types
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceTL: number;
}

export interface CreditBalance {
  credits: number;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
  FortuneResult: { fortuneId: string };
  FortuneDetail: { fortuneId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Credits: undefined;
  Profile: undefined;
};
