import { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBarItem from '../TabBarItem';
import { useThemeColors, getTabBarTotalHeight } from '../../theme';

const HIDDEN_TAB_ROUTES = new Set([
  'NewClient',
  'NewSession',
  'NewHomework',
  'Homework',
  'SessionDetail',
  'SessionTypes',
  'SessionDurations',
  'LegalText',
  'NotificationTypes',
  'QuietHours',
  'DataBackup',
]);
const PILL_WIDTH = 42;

const TAB_CONFIG = {
  HomeNavigator: { label: 'Ana Sayfa', icon: 'home' },
  ClientsNavigator: { label: 'Danışanlar', icon: 'people' },
  CalendarNavigator: { label: 'Takvim', icon: 'calendar' },
  StatsNavigator: { label: 'Raporlar', icon: 'stats' },
  SettingsNavigator: { label: 'Ayarlar', icon: 'settings' },
};

const TabBar = ({ state, descriptors, navigation }) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const focusedRoute = state.routes[state.index];
  const nested = getFocusedRouteNameFromRoute(focusedRoute);
  const hide = HIDDEN_TAB_ROUTES.has(nested);
  const itemWidth = width / state.routes.length;
  const translateX = useRef(
    new Animated.Value(state.index * itemWidth + (itemWidth - PILL_WIDTH) / 2),
  ).current;
  const barOpacity = useRef(new Animated.Value(hide ? 0 : 1)).current;
  const barTranslate = useRef(new Animated.Value(hide ? 24 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * itemWidth + (itemWidth - PILL_WIDTH) / 2,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [itemWidth, state.index, translateX]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(barOpacity, {
        toValue: hide ? 0 : 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(barTranslate, {
        toValue: hide ? 28 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [barOpacity, barTranslate, hide]);

  if (hide) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: getTabBarTotalHeight(insets.bottom),
          paddingBottom: Math.max(
            insets.bottom - (Platform.OS === 'ios' ? 4 : 0),
            Platform.OS === 'ios' ? 6 : 10,
          ),
          backgroundColor: colors.tabBar,
          shadowColor: colors.shadow,
          opacity: barOpacity,
          transform: [{ translateY: barTranslate }],
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor: colors.tabActive,
            transform: [{ translateX }],
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const config = TAB_CONFIG[route.name] ?? { label: route.name, icon: 'circle' };
        const { options } = descriptors[route.key];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
          >
            <TabBarItem
              focused={focused}
              icon={config.icon}
              label={config.label}
            />
          </Pressable>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 4 : 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 16,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    zIndex: 20,
  },
  indicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 4 : 8,
    width: PILL_WIDTH,
    height: 32,
    borderRadius: 16,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 2,
  },
});

export default TabBar;
