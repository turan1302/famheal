import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './storageKeys';

export async function getOnboardingCompleted() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingCompleted() {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
}
