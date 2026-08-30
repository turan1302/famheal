import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors, getTabBarTotalHeight } from '../../theme';
import AppStatusBar from '../AppStatusBar';
import FadeInView from '../FadeInView';
import styles from './styles';

const ThemedScreen = ({
  title,
  children,
  showBack = false,
  right,
  scroll = true,
  padTabBar = true,
  overlay,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event => {
      const kb = event.endCoordinates?.height || 0;
      if (Platform.OS === 'ios') {
        setKeyboardInset(32);
        return;
      }
      const frameY = event.endCoordinates?.screenY ?? 0;
      const windowHeight = Dimensions.get('window').height;
      const alreadyResized = frameY > 0 && windowHeight <= frameY + 24;
      setKeyboardInset(alreadyResized ? 24 : kb + 24);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const restPad = padTabBar
    ? getTabBarTotalHeight(insets.bottom) + 16
    : Math.max(insets.bottom, 24);

  const bottomPad = keyboardInset > 0 ? keyboardInset : restPad;

  const body = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[
        styles.content,
        styles.scrollContent,
        { paddingBottom: bottomPad },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      automaticallyAdjustKeyboardInsets={false}
      nestedScrollEnabled
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, { paddingBottom: bottomPad }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppStatusBar barStyle={colors.statusBar} />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={0}
      >
        <FadeInView>
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(insets.top, 16) },
            ]}
          >
            {showBack ? (
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={12}
                style={styles.backBtn}
                accessibilityRole="button"
                accessibilityLabel="Geri"
              >
                <Icon name="chevron-back" size={24} color={colors.text} />
              </Pressable>
            ) : null}
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  textAlign: showBack ? 'center' : 'left',
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {right ? (
              <View style={styles.right}>{right}</View>
            ) : showBack ? (
              <View style={styles.backBtn} />
            ) : null}
          </View>
          {body}
        </FadeInView>
      </KeyboardAvoidingView>
      {overlay}
    </View>
  );
};

export default ThemedScreen;
