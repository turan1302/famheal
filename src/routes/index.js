import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../common/NavigationService';
import Splash from '../screens/Splash';
import OnBoard from '../screens/OnBoard';
import WelcomeNavigator from './WelcomeNavigator';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator();

const Routes = () => {
  const { scheme, colors } = useTheme();
  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.background,
          primary: colors.teal,
        },
      }}
    >
      <Stack.Navigator
        id={'1'}
        initialRouteName={'Splash'}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animation: 'slide_from_right',
          animationDuration: 320,
        }}
      >
        <Stack.Screen
          name={'Splash'}
          component={Splash}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name={'OnBoard'}
          component={OnBoard}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
        <Stack.Screen
          name={'WelcomeNavigator'}
          component={WelcomeNavigator}
          options={{ gestureEnabled: false, animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
