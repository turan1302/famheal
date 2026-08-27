import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Settings from '../screens/Settings';
import Notifications from '../screens/Notifications';
import SessionTypes from '../screens/SessionTypes';
import SessionDurations from '../screens/SessionDurations';
import LegalText from '../screens/LegalText';
import NotificationTypes from '../screens/NotificationTypes';
import QuietHours from '../screens/QuietHours';
import DataBackup from '../screens/DataBackup';

const Stack = createNativeStackNavigator();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="SessionTypes" component={SessionTypes} />
      <Stack.Screen name="SessionDurations" component={SessionDurations} />
      <Stack.Screen name="NotificationTypes" component={NotificationTypes} />
      <Stack.Screen name="QuietHours" component={QuietHours} />
      <Stack.Screen name="DataBackup" component={DataBackup} />
      <Stack.Screen name="LegalText" component={LegalText} />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
