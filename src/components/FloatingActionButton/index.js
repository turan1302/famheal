import { Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors, getTabBarTotalHeight } from '../../theme';

const FloatingActionButton = ({
  onPress,
  icon = 'add',
  accessibilityLabel,
  padTabBar = true,
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const bottom = (padTabBar ? getTabBarTotalHeight(insets.bottom) : Math.max(insets.bottom, 16)) + 12;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        {
          bottom,
          backgroundColor: colors.fab,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name={icon} size={28} color={colors.fabIcon} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});

export default FloatingActionButton;
