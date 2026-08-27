import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Stats from '../screens/Stats';
import Homework from '../screens/Homework';
import NewHomework from '../screens/NewHomework';

const Stack = createNativeStackNavigator();

const StatsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Stats"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen
        name="Stats"
        component={Stats}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Homework" component={Homework} />
      <Stack.Screen
        name="NewHomework"
        component={NewHomework}
        options={{ animation: 'fade_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

export default StatsNavigator;
