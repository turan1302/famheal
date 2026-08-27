import { View, Text, StatusBar, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors, getTabBarTotalHeight } from '../../theme';
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
  const bottomPad = padTabBar ? getTabBarTotalHeight(insets.bottom) + 16 : Math.max(insets.bottom, 24);

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
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
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor="transparent"
        translucent
      />
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
      {overlay}
    </View>
  );
};

export default ThemedScreen;
