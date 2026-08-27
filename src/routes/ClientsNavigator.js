import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Clients from '../screens/Clients';
import NewClient from '../screens/NewClient';

const Stack = createNativeStackNavigator();

const ClientsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Clients"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
        animationDuration: 280,
      }}
    >
      <Stack.Screen
        name="Clients"
        component={Clients}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="NewClient"
        component={NewClient}
        options={{ animation: 'fade_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

export default ClientsNavigator;
