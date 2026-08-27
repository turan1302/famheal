import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Sessions from '../screens/Sessions';
import SessionDetail from '../screens/SessionDetail';
import Homework from '../screens/Homework';
import NewHomework from '../screens/NewHomework';
import NewSession from '../screens/NewSession';
import Notifications from '../screens/Notifications';

const Stack = createNativeStackNavigator();

const HomeNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen name="Home" component={Home} options={{ animation: 'fade' }} />
      <Stack.Screen name="Sessions" component={Sessions} />
      <Stack.Screen name="SessionDetail" component={SessionDetail} />
      <Stack.Screen name="Homework" component={Homework} />
      <Stack.Screen
        name="NewHomework"
        component={NewHomework}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen
        name="NewSession"
        component={NewSession}
        options={{ animation: 'fade_from_bottom' }}
      />
      <Stack.Screen name="Notifications" component={Notifications} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
