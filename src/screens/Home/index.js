import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors, getTabBarTotalHeight } from '../../theme';
import SessionCard from '../../components/SessionCard';
import FadeInView from '../../components/FadeInView';
import AppStatusBar from '../../components/AppStatusBar';
import { useAppStore } from '../../store/useAppStore';
import {
  isSameDay,
  isSameMonth,
  sessionDateTime,
  withResolvedStatus,
} from '../../common/helpers';
import styles from './styles';

const QUICK_ACTIONS = [
  {
    key: 'client',
    label: 'YENİ DANIŞAN',
    icon: 'person-add-outline',
    primary: true,
    tab: 'ClientsNavigator',
    screen: 'NewClient',
  },
  {
    key: 'session',
    label: 'YENİ SEANS',
    icon: 'calendar-outline',
    tab: 'CalendarNavigator',
    screen: 'NewSession',
  },
  {
    key: 'report',
    label: 'RAPOR',
    icon: 'stats-chart-outline',
    tab: 'StatsNavigator',
  },
];

const Home = () => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const sessions = useAppStore(state => state.sessions);
  const clients = useAppStore(state => state.clients);
  const homework = useAppStore(state => state.homework);
  const counselorName = useAppStore(state => state.counselorName);
  const today = useMemo(() => new Date(), []);

  const todaySessions = useMemo(
    () =>
      sessions
        .filter(item => isSameDay(sessionDateTime(item), today))
        .sort((a, b) => sessionDateTime(a) - sessionDateTime(b))
        .map(withResolvedStatus),
    [sessions, today],
  );

  const monthCount = useMemo(
    () => sessions.filter(item => isSameMonth(sessionDateTime(item), today)).length,
    [sessions, today],
  );

  const stats = [
    {
      key: 'today',
      value: todaySessions.length,
      label: 'BUGÜNKÜ SEANSLAR',
      icon: 'calendar-outline',
      tone: 'mint',
      tab: 'CalendarNavigator',
    },
    {
      key: 'clients',
      value: clients.length,
      label: 'AKTİF DANIŞAN',
      icon: 'people-outline',
      tone: 'teal',
      tab: 'ClientsNavigator',
    },
    {
      key: 'homework',
      value: homework.length,
      label: 'DANIŞAN ÖDEVLERİ',
      icon: 'create-outline',
      tone: 'danger',
      screen: 'Homework',
    },
    {
      key: 'month',
      value: monthCount,
      label: 'BU AY SEANSLAR',
      icon: 'trending-up-outline',
      tone: 'chart',
      tab: 'StatsNavigator',
    },
  ];

  const toneColors = {
    mint: { bg: colors.mintSoft, icon: colors.teal },
    teal: { bg: colors.tealFill, icon: colors.quickPrimaryText },
    danger: { bg: colors.dangerSoft, icon: colors.danger },
    chart: { bg: colors.chartSoft, icon: colors.chart },
  };

  const goTab = (tab, screen, params) => {
    if (!tab) return;
    const target = screen ? { screen, params } : undefined;
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(tab, target);
      return;
    }
    navigation.navigate(tab, target);
  };

  const onStatPress = item => {
    if (item.screen) {
      navigation.navigate(item.screen);
      return;
    }
    goTab(item.tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppStatusBar barStyle={colors.statusBar} />

      <FadeInView>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 16) + 8,
              paddingBottom: getTabBarTotalHeight(insets.bottom) + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.brand }]}>FamHeal</Text>

            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              style={styles.bellBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Bildirimler"
            >
              <Icon
                name="notifications-outline"
                size={22}
                color={colors.headerIcon}
              />
              <View
                style={[
                  styles.bellDot,
                  {
                    backgroundColor: colors.notificationDot,
                    borderColor: colors.background,
                  },
                ]}
              />
            </Pressable>
          </View>

          <Text
            style={[styles.greeting, { color: colors.text }]}
            numberOfLines={2}
          >
            {counselorName ? `Merhaba ${counselorName} 👋` : 'Merhaba 👋'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Bugün {todaySessions.length} seansınız var
          </Text>

          <View style={styles.statsGrid}>
            {stats.map(item => {
              const tone = toneColors[item.tone];
              return (
                <Pressable
                  key={item.key}
                  onPress={() => onStatPress(item)}
                  style={({ pressed }) => [
                    styles.statCard,
                    {
                      backgroundColor: colors.card,
                      opacity: pressed ? 0.88 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={[styles.statIcon, { backgroundColor: tone.bg }]}>
                    <Icon name={item.icon} size={18} color={tone.icon} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.cardText }]}>
                    {item.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.cardTextMuted }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Hızlı İşlemler
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.actionsScroll}
            contentContainerStyle={styles.actionsRow}
          >
            {QUICK_ACTIONS.map(action => (
              <Pressable
                key={action.key}
                onPress={() => goTab(action.tab, action.screen)}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: action.primary
                      ? colors.quickPrimaryBg
                      : colors.quickSecondaryBg,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Icon
                  name={action.icon}
                  size={16}
                  color={
                    action.primary
                      ? colors.quickPrimaryText
                      : colors.quickSecondaryText
                  }
                />
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: action.primary
                        ? colors.quickPrimaryText
                        : colors.quickSecondaryText,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.section, styles.sectionSessions]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bugünkü Seanslar
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Sessions')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Tümünü gör"
              >
                <Text style={[styles.seeAll, { color: colors.textMuted }]}>
                  TÜMÜNÜ GÖR
                </Text>
              </Pressable>
            </View>

            {todaySessions.length === 0 ? (
              <Text style={[styles.emptySessions, { color: colors.textMuted }]}>
                Bugün planlanmış seans yok
              </Text>
            ) : (
              todaySessions.slice(0, 3).map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onPress={() =>
                    navigation.navigate('SessionDetail', { sessionId: session.id })
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </FadeInView>
    </View>
  );
};

export default Home;
