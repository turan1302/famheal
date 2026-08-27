import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { setOnboardingCompleted } from '../../common/onboarding';
import { replace } from '../../common/NavigationService';
import useDimensions from '../../hooks/useDimensions';
import { useThemeColors } from '../../theme';
import styles from './styles';

const SLIDES = [
  {
    key: 'clients',
    icon: 'people-outline',
    title: 'Danışanlarınızı yönetin',
    description:
      'Her danışanın profilini, görüşme geçmişini ve durumunu tek ekrandan takip edin.',
  },
  {
    key: 'sessions',
    icon: 'calendar-outline',
    title: 'Seans ve takvim',
    description:
      'Günlük seanslarınızı planlayın, notlarınızı kaydedin ve bir sonraki görüşmeye hazır olun.',
  },
  {
    key: 'goals',
    icon: 'flag-outline',
    title: 'Danışan ödevleri',
    description:
      'Danışanlarınıza ödev atayın, içeriğini düzenleyin ve takibini sade kartlarla yürütün.',
  },
  {
    key: 'offline',
    icon: 'notifications-outline',
    title: 'Randevu hatırlatması',
    description:
      'Yaklaşan seanslar için yerel bildirim alın. Ödev teslimi bildirimi yoktur.',
  },
];

const OnBoard = () => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { width } = useDimensions();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const finishOnboarding = useCallback(async () => {
    await setOnboardingCompleted();
    replace('WelcomeNavigator');
  }, []);

  const goNext = useCallback(() => {
    if (index >= SLIDES.length - 1) {
      finishOnboarding();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }, [index, finishOnboarding]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0 && viewableItems[0].index != null) {
      setIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const isLast = index === SLIDES.length - 1;

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.iconBg }]}>
        <Icon name={item.icon} size={44} color={colors.icon} />
      </View>
      <Text style={[styles.title, { color: colors.title }]}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.body }]}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBar}
        backgroundColor="transparent"
        translucent
      />

      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 16), paddingHorizontal: 24 },
        ]}
      >
        <Text style={[styles.brand, { color: colors.brand }]}>FamHeal</Text>
        <Pressable
          onPress={finishOnboarding}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Atla"
        >
          <Text style={[styles.skip, { color: colors.skip }]}>Atla</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
      />

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 24), paddingHorizontal: 24 },
        ]}
      >
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? colors.dotActive : colors.dot,
                  width: i === index ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.buttonBg,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Başla' : 'İlerle'}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {isLast ? 'Başla' : 'İlerle'}
          </Text>
          <Icon
            name={isLast ? 'checkmark' : 'arrow-forward'}
            size={18}
            color={colors.buttonText}
            style={styles.buttonIcon}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default OnBoard;
