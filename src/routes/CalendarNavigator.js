import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Calendar from '../screens/Calendar';
import NewSession from '../screens/NewSession';
import SessionDetail from '../screens/SessionDetail';
import NewHomework from '../screens/NewHomework';

const Stack = createNativeStackNavigator();

const CalendarNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Calendar"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen
        name="Calendar"
        component={Calendar}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="NewSession"
        component={NewSession}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen name="SessionDetail" component={SessionDetail} />
      <Stack.Screen
        name="NewHomework"
        component={NewHomework}
        options={{ animation: 'fade_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

export default CalendarNavigator;
