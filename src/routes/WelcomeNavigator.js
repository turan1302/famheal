import { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/TabBar';
import { useThemeColors } from '../theme';
import { scheduleAllReminders } from '../common/notifications';
import { useAppStore } from '../store/useAppStore';
import HomeNavigator from './HomeNavigator';
import ClientsNavigator from './ClientsNavigator';
import CalendarNavigator from './CalendarNavigator';
import StatsNavigator from './StatsNavigator';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator();

const renderTabBar = props => <TabBar {...props} />;

const WelcomeNavigator = () => {
  const colors = useThemeColors();
  const sessions = useAppStore(state => state.sessions);
  const homework = useAppStore(state => state.homework);
  const notificationSettings = useAppStore(state => state.notificationSettings);

  useEffect(() => {
    scheduleAllReminders(sessions, homework, notificationSettings);
  }, [homework, notificationSettings, sessions]);

  return (
    <Tab.Navigator
      initialRouteName="HomeNavigator"
      tabBar={renderTabBar}
      sceneContainerStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="HomeNavigator" component={HomeNavigator} />
      <Tab.Screen name="ClientsNavigator" component={ClientsNavigator} />
      <Tab.Screen name="CalendarNavigator" component={CalendarNavigator} />
      <Tab.Screen name="StatsNavigator" component={StatsNavigator} />
      <Tab.Screen name="SettingsNavigator" component={SettingsNavigator} />
    </Tab.Navigator>
  );
};

export default WelcomeNavigator;
