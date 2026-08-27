import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getOnboardingCompleted } from '../../common/onboarding';
import { replace } from '../../common/NavigationService';
import { useThemeColors } from '../../theme';
import AppStatusBar from '../../components/AppStatusBar';
import styles from './styles';

const logo = require('../../assets/famheal-icon.png');

const Splash = () => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 380,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.35,
            duration: 380,
            useNativeDriver: true,
          }),
        ]),
      );

    const loop1 = pulse(dot1, 0);
    const loop2 = pulse(dot2, 160);
    const loop3 = pulse(dot3, 320);
    loop1.start();
    loop2.start();
    loop3.start();

    let cancelled = false;
    const timer = setTimeout(async () => {
      const completed = await getOnboardingCompleted();
      if (cancelled) return;
      replace(completed ? 'WelcomeNavigator' : 'OnBoard');
    }, 2400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [fadeAnim, scaleAnim, dot1, dot2, dot3]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppStatusBar barStyle={colors.statusBar} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 28) }]}>
        <View style={styles.loaderRow}>
          <Animated.View
            style={[styles.dot, { backgroundColor: colors.dotActive, opacity: dot1 }]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: colors.dotActive, opacity: dot2 }]}
          />
          <Animated.View
            style={[styles.dot, { backgroundColor: colors.dotActive, opacity: dot3 }]}
          />
        </View>
        <Text style={[styles.version, { color: colors.version }]}>
          FamHeal · Offline First
        </Text>
      </View>
    </View>
  );
};

export default Splash;
