import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  isSameDay,
  isSameMonth,
  homeworkStatus,
  sessionDateTime,
  withResolvedStatus,
} from '../../common/helpers';

const WEEK_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const parseMinutes = duration => {
  const value = Number(String(duration || '').replace(/[^\d]/g, ''));
  return value > 0 ? value : 50;
};

const startOfWeek = value => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const weekday = date.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + diff);
  return date;
};

const formatDuration = minutes => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours && rest) {
    return `${hours} sa ${rest} dk`;
  }
  if (hours) {
    return `${hours} sa`;
  }
  return `${rest} dk`;
};

const monthTitle = value => {
  const label = value.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const Stats = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const sessions = useAppStore(state => state.sessions);
  const clients = useAppStore(state => state.clients);
  const homework = useAppStore(state => state.homework);
  const sessionTypes = useAppStore(state => state.sessionTypes);
  const now = useMemo(() => new Date(), []);

  const report = useMemo(() => {
    const weekStart = startOfWeek(now);
    const resolved = sessions.map(withResolvedStatus);
    const monthSessions = resolved.filter(item =>
      isSameMonth(sessionDateTime(item), now),
    );
    const todaySessions = resolved.filter(item =>
      isSameDay(sessionDateTime(item), now),
    );
    const monthMinutes = monthSessions.reduce(
      (sum, item) => sum + parseMinutes(item.duration),
      0,
    );
    const completed = monthSessions.filter(item => item.status === 'completed')
      .length;
    const upcoming = monthSessions.length - completed;

    const weekDays = WEEK_LABELS.map((label, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      const count = resolved.filter(item =>
        isSameDay(sessionDateTime(item), day),
      ).length;
      return {
        label,
        count,
        isToday: isSameDay(day, now),
      };
    });
    const weekMax = Math.max(...weekDays.map(item => item.count), 1);

    const typeRows = sessionTypes.map(type => ({
      id: type.id,
      name: type.name,
      count: monthSessions.filter(item => item.type === type.name).length,
    }));
    const typeMax = Math.max(...typeRows.map(item => item.count), 1);

    const clientRows = Object.values(
      monthSessions.reduce((map, item) => {
        const key = item.clientId || item.name;
        if (!map[key]) {
          map[key] = {
            id: key,
            name: item.name,
            initials: item.initials,
            count: 0,
          };
        }
        map[key].count += 1;
        return map;
      }, {}),
    )
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const dueToday = homework.filter(
      item => homeworkStatus(item, now) === 'today',
    ).length;
    const overdue = homework.filter(
      item => homeworkStatus(item, now) === 'overdue',
    ).length;
    const upcomingHw = homework.filter(
      item => homeworkStatus(item, now) === 'upcoming',
    ).length;

    return {
      monthLabel: monthTitle(now),
      todayCount: todaySessions.length,
      monthCount: monthSessions.length,
      monthMinutes,
      completed,
      upcoming,
      weekDays,
      weekMax,
      typeRows,
      typeMax,
      clientRows,
      dueToday,
      overdue,
      upcomingHw,
      homeworkCount: homework.length,
      clientCount: clients.length,
    };
  }, [clients.length, homework, now, sessionTypes, sessions]);

  const goTab = (tab, screen) => {
    const parent = navigation.getParent();
    if (!parent) {
      return;
    }
    parent.navigate(tab, screen ? { screen } : undefined);
  };

  const completionRatio =
    report.monthCount === 0 ? 0 : report.completed / report.monthCount;

  return (
    <ThemedScreen title="Raporlar">
      <View style={[styles.hero, { backgroundColor: colors.quickPrimaryBg }]}>
        <Text style={[styles.heroKicker, { color: colors.quickPrimaryText }]}>
          {report.monthLabel}
        </Text>
        <Text style={[styles.heroValue, { color: colors.quickPrimaryText }]}>
          {report.monthCount} seans
        </Text>
        <Text style={[styles.heroMeta, { color: colors.quickPrimaryText }]}>
          {formatDuration(report.monthMinutes)} seans süresi  ·  {report.completed}{' '}
          tamamlandı
        </Text>
      </View>

      <View style={styles.grid}>
        <MetricCard
          colors={colors}
          icon="calendar-outline"
          value={report.todayCount}
          label="Bugün"
          tone="mint"
          onPress={() => goTab('CalendarNavigator')}
        />
        <MetricCard
          colors={colors}
          icon="people-outline"
          value={report.clientCount}
          label="Danışan"
          tone="teal"
          onPress={() => goTab('ClientsNavigator')}
        />
        <MetricCard
          colors={colors}
          icon="checkmark-done-outline"
          value={report.completed}
          label="Tamamlanan"
          tone="chart"
        />
        <MetricCard
          colors={colors}
          icon="create-outline"
          value={report.homeworkCount}
          label="Ödev"
          tone="danger"
          onPress={() => goTab('HomeNavigator', 'Homework')}
        />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Bu hafta</Text>
      <View style={[styles.panel, { backgroundColor: colors.card }]}>
        <View style={styles.weekRow}>
          {report.weekDays.map(day => {
            const height = 8 + (day.count / report.weekMax) * 72;
            return (
              <View key={day.label} style={styles.weekCol}>
                <Text style={[styles.weekCount, { color: colors.cardTextMuted }]}>
                  {day.count || ''}
                </Text>
                <View
                  style={[
                    styles.weekBar,
                    {
                      height,
                      backgroundColor: day.isToday
                        ? colors.teal
                        : day.count
                          ? colors.mint
                          : colors.cardMuted,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.weekLabel,
                    {
                      color: day.isToday ? colors.teal : colors.cardTextMuted,
                      fontWeight: day.isToday ? '800' : '600',
                    },
                  ]}
                >
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Ay içi durum</Text>
      <View style={[styles.panel, { backgroundColor: colors.card }]}>
        <View style={styles.statusHead}>
          <Text style={[styles.statusLabel, { color: colors.cardText }]}>
            Tamamlanma
          </Text>
          <Text style={[styles.statusValue, { color: colors.cardTextMuted }]}>
            {report.completed}/{report.monthCount || 0}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.cardMuted }]}>
          <View
            style={[
              styles.trackFill,
              {
                width: `${Math.round(completionRatio * 100)}%`,
                backgroundColor: colors.teal,
              },
            ]}
          />
        </View>
        <View style={styles.statusRow}>
          <StatusChip
            colors={colors}
            label="Tamamlanan"
            value={report.completed}
            bg={colors.mintSoft}
          />
          <StatusChip
            colors={colors}
            label="Kalan"
            value={report.upcoming}
            bg={colors.chartSoft}
          />
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Seans türleri</Text>
      <View style={[styles.panel, { backgroundColor: colors.card }]}>
        {report.typeRows.length === 0 ? (
          <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
            Henüz seans türü yok.
          </Text>
        ) : (
          report.typeRows.map(item => (
            <View key={item.id} style={styles.typeRow}>
              <View style={styles.typeHead}>
                <Text style={[styles.typeName, { color: colors.cardText }]}>
                  {item.name}
                </Text>
                <Text style={[styles.typeCount, { color: colors.cardTextMuted }]}>
                  {item.count}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: colors.cardMuted }]}>
                <View
                  style={[
                    styles.trackFill,
                    {
                      width: `${Math.round((item.count / report.typeMax) * 100)}%`,
                      backgroundColor: colors.mint,
                    },
                  ]}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Ödevler</Text>
      <View style={styles.hwGrid}>
        <HomeworkStat
          colors={colors}
          label="Bugün teslim"
          value={report.dueToday}
          onPress={() => navigation.navigate('Homework', { filter: 'today' })}
        />
        <HomeworkStat
          colors={colors}
          label="Yaklaşan"
          value={report.upcomingHw}
          onPress={() =>
            navigation.navigate('Homework', { filter: 'upcoming' })
          }
        />
        <HomeworkStat
          colors={colors}
          label="Geciken"
          value={report.overdue}
          onPress={() =>
            navigation.navigate('Homework', { filter: 'overdue' })
          }
        />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>
        Bu ay en çok seans
      </Text>
      {report.clientRows.length === 0 ? (
        <View style={[styles.panel, { backgroundColor: colors.card }]}>
          <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
            Bu ay henüz seans yok.
          </Text>
        </View>
      ) : (
        report.clientRows.map((item, index) => (
          <View
            key={item.id}
            style={[styles.clientRow, { backgroundColor: colors.card }]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    index % 2 === 0 ? colors.mintSoft : colors.teal,
                },
              ]}
            >
              <Text
                style={[
                  styles.initials,
                  {
                    color:
                      index % 2 === 0
                        ? colors.cardText
                        : colors.quickPrimaryText,
                  },
                ]}
              >
                {item.initials}
              </Text>
            </View>
            <Text style={[styles.clientName, { color: colors.cardText }]}>
              {item.name}
            </Text>
            <Text style={[styles.clientCount, { color: colors.cardTextMuted }]}>
              {item.count} seans
            </Text>
          </View>
        ))
      )}
    </ThemedScreen>
  );
};

const MetricCard = ({ colors, icon, value, label, tone, onPress }) => {
  const tones = {
    mint: { bg: colors.mintSoft, icon: colors.teal },
    teal: { bg: colors.teal, icon: colors.quickPrimaryText },
    danger: { bg: colors.dangerSoft, icon: colors.danger },
    chart: { bg: colors.chartSoft, icon: colors.chart },
  };
  const palette = tones[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.metric,
        {
          backgroundColor: colors.card,
          opacity: pressed && onPress ? 0.88 : 1,
        },
      ]}
    >
      <View style={[styles.metricIcon, { backgroundColor: palette.bg }]}>
        <Icon name={icon} size={16} color={palette.icon} />
      </View>
      <Text style={[styles.metricValue, { color: colors.cardText }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.cardTextMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const StatusChip = ({ colors, label, value, bg }) => (
  <View style={[styles.chip, { backgroundColor: bg }]}>
    <Text style={[styles.chipValue, { color: colors.cardText }]}>{value}</Text>
    <Text style={[styles.chipLabel, { color: colors.cardTextMuted }]}>{label}</Text>
  </View>
);

const HomeworkStat = ({ colors, label, value, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.hwCard,
      { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
    ]}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <Text style={[styles.hwValue, { color: colors.cardText }]}>{value}</Text>
    <Text style={[styles.hwLabel, { color: colors.cardTextMuted }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  heroKicker: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.82,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroMeta: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.88,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metric: {
    width: '48%',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  panel: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 118,
  },
  weekCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  weekCount: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    minHeight: 14,
  },
  weekBar: {
    width: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  weekLabel: {
    fontSize: 11,
  },
  statusHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  trackFill: {
    height: 8,
    borderRadius: 8,
    minWidth: 0,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chipValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  typeRow: {
    marginBottom: 12,
  },
  typeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    fontSize: 13,
    fontWeight: '500',
  },
  hwGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  hwCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  hwValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  hwLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    fontSize: 12,
    fontWeight: '800',
  },
  clientName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  clientCount: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Stats;
