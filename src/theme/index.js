import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../common/storageKeys';
import { COLORS, TAB_BAR_HEIGHT, getTabBarTotalHeight } from './colors';

const ThemeContext = createContext({
  preference: 'system',
  scheme: 'light',
  colors: COLORS.light,
  setPreference: async () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState('system');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
        if (
          !cancelled &&
          (stored === 'light' || stored === 'dark' || stored === 'system')
        ) {
          setPreferenceState(stored);
        }
      } catch {
        // keep system default
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const scheme =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const setPreference = useCallback(async value => {
    setPreferenceState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, value);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      scheme,
      colors: COLORS[scheme],
      setPreference,
    }),
    [preference, scheme, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const useThemeColors = () => useTheme().colors;

export { COLORS, TAB_BAR_HEIGHT, getTabBarTotalHeight };
