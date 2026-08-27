import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import ImmersiveMode from 'react-native-immersive-mode';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Routes from './src/routes';
import { ThemeProvider, useTheme } from './src/theme';

const ThemedRoot = () => {
  const { scheme } = useTheme();

  return (
    <AlertNotificationRoot theme={scheme === 'dark' ? 'dark' : 'light'}>
      <Routes />
    </AlertNotificationRoot>
  );
};

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      ImmersiveMode.setBarMode('FullSticky');
      ImmersiveMode.setBarTranslucent(true);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedRoot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
