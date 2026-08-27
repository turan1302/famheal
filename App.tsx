import { useEffect } from 'react';
import { Platform } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';
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
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      const ImmersiveMode = require('react-native-immersive-mode').default;
      ImmersiveMode.setBarMode('FullSticky');
      ImmersiveMode.setBarTranslucent(true);
    } catch {
      // Android-only native module
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
