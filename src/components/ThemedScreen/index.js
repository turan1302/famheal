import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  const bottomPad = padTabBar
    ? getTabBarTotalHeight(insets.bottom) + 16
    : Math.max(insets.bottom, 24);

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
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
        behavior={Platform.OS === 'ios' && !scroll ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
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
