import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../theme';
import styles from './styles';

const ICON_MAP = {
  home: { on: 'home', off: 'home-outline' },
  people: { on: 'people', off: 'people-outline' },
  calendar: { on: 'calendar', off: 'calendar-outline' },
  stats: { on: 'stats-chart', off: 'bar-chart-outline' },
  settings: { on: 'settings', off: 'settings-outline' },
  circle: { on: 'ellipse', off: 'ellipse-outline' },
};

const TabBarItem = ({ focused, icon, label }) => {
  const colors = useThemeColors();
  const icons = ICON_MAP[icon] ?? ICON_MAP.circle;
  const scale = useRef(new Animated.Value(focused ? 1 : 0.88)).current;
  const lift = useRef(new Animated.Value(focused ? -1 : 2)).current;
  const labelOpacity = useRef(new Animated.Value(focused ? 1 : 0.62)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.08 : 0.88,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(lift, {
        toValue: focused ? -2 : 2,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: focused ? 1 : 0.62,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, labelOpacity, lift, scale]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { transform: [{ translateY: lift }, { scale }] },
      ]}
    >
      <Animated.View style={styles.iconWrap}>
        <Icon
          name={focused ? icons.on : icons.off}
          size={20}
          color={focused ? colors.tabActiveText : colors.tabInactive}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          {
            color: focused ? colors.tabActiveText : colors.tabInactive,
            opacity: labelOpacity,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

export default TabBarItem;
