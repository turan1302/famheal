import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedScreen from '../../components/ThemedScreen';
import SessionCard from '../../components/SessionCard';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  dateKey,
  formatDate,
  isSameDay,
  isSameMonth,
  matchesQuery,
  sessionDateTime,
  withResolvedStatus,
} from '../../common/helpers';

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const monthTitle = value => {
  const label = value.toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const shiftMonth = (value, amount) => {
  const next = new Date(value);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  return next;
};

const shiftYear = (value, amount) => {
  const next = new Date(value);
  next.setFullYear(next.getFullYear() + amount);
  return next;
};

const buildWeeks = cursor => {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

const Calendar = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const sessions = useAppStore(state => state.sessions);
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('day');
  const [showPicker, setShowPicker] = useState(false);

  const resolved = useMemo(
    () => sessions.map(withResolvedStatus),
    [sessions],
  );

  const sessionDays = useMemo(() => {
    const map = {};
    resolved.forEach(item => {
      const key = dateKey(sessionDateTime(item));
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [resolved]);

  const weeks = useMemo(() => buildWeeks(cursor), [cursor]);

  const visibleSessions = useMemo(() => {
    const q = query.trim();
    return resolved
      .filter(item => {
        const at = sessionDateTime(item);
        const matchesSearch = matchesQuery(
          `${item.name} ${item.type} ${item.time} ${formatDate(at)} ${at.getFullYear()}`,
          q,
        );
        if (!matchesSearch) {
          return false;
        }
        if (q) {
          return true;
        }
        if (range === 'month') {
          return isSameMonth(at, cursor);
        }
        return isSameDay(at, selected);
      })
      .sort((a, b) => sessionDateTime(a) - sessionDateTime(b));
  }, [cursor, query, range, resolved, selected]);

  const jumpTo = date => {
    setCursor(date);
    setSelected(date);
    setRange('day');
  };

  const onPickDate = (event, date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !date) {
      return;
    }
    jumpTo(date);
  };

  const listTitle = query.trim()
    ? `"${query.trim()}" için sonuçlar`
    : range === 'month'
      ? `${monthTitle(cursor)} seansları`
      : isSameDay(selected, today)
        ? 'Bugünkü seanslar'
        : formatDate(selected);

  return (
    <ThemedScreen
      title="Takvim"
      right={
        <Pressable
          onPress={() => navigation.navigate('NewSession')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Yeni seans"
        >
          <Icon name="add" size={26} color={colors.text} />
        </Pressable>
      }
    >
      <View style={[styles.search, { backgroundColor: colors.card }]}>
        <Icon name="search-outline" size={18} color={colors.cardTextMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Danışan, tür veya yıl ara"
          placeholderTextColor={colors.cardTextMuted}
          style={[styles.searchInput, { color: colors.cardText }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Icon name="close-circle" size={18} color={colors.cardTextMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.nav}>
        <Pressable onPress={() => setCursor(prev => shiftYear(prev, -1))} hitSlop={8}>
          <Icon name="play-skip-back-outline" size={18} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => setCursor(prev => shiftMonth(prev, -1))} hitSlop={8}>
          <Icon name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => setShowPicker(true)} style={styles.monthBtn}>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthTitle(cursor)}
          </Text>
        </Pressable>
        <Pressable onPress={() => setCursor(prev => shiftMonth(prev, 1))} hitSlop={8}>
          <Icon name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => setCursor(prev => shiftYear(prev, 1))} hitSlop={8}>
          <Icon name="play-skip-forward-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.chips}>
        <Pressable
          onPress={() => jumpTo(today)}
          style={[
            styles.chip,
            {
              backgroundColor:
                range === 'day' && isSameDay(selected, today)
                  ? colors.selectedBg
                  : colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  range === 'day' && isSameDay(selected, today)
                    ? colors.selectedText
                    : colors.cardText,
              },
            ]}
          >
            Bugün
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRange('month')}
          style={[
            styles.chip,
            {
              backgroundColor: range === 'month' ? colors.selectedBg : colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              {
                color: range === 'month' ? colors.selectedText : colors.cardText,
              },
            ]}
          >
            Bu ay
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.chip, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.chipText, { color: colors.cardText }]}>
            Tarihe git
          </Text>
        </Pressable>
      </View>

      {showPicker ? (
        <View>
          <DateTimePicker
            value={selected}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onPickDate}
            locale="tr-TR"
            themeVariant={colors.statusBar === 'light-content' ? 'dark' : 'light'}
          />
          {Platform.OS === 'ios' ? (
            <Pressable
              onPress={() => setShowPicker(false)}
              style={[styles.doneBtn, { backgroundColor: colors.mintSoft }]}
            >
              <Text style={[styles.doneText, { color: colors.teal }]}>Tamam</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.cal, { backgroundColor: colors.card }]}>
        <View style={styles.weekRow}>
          {WEEKDAYS.map(label => (
            <Text
              key={label}
              style={[styles.weekday, { color: colors.cardTextMuted }]}
            >
              {label}
            </Text>
          ))}
        </View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return <View key={`empty-${dayIndex}`} style={styles.dayCell} />;
              }
              const key = dateKey(day);
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              const count = sessionDays[key] || 0;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    setSelected(day);
                    setRange('day');
                    setQuery('');
                  }}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: colors.selectedBg },
                    isToday && !isSelected && { backgroundColor: colors.mintSoft },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      {
                        color: isSelected
                          ? colors.selectedText
                          : colors.cardText,
                      },
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {count ? (
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isSelected
                            ? colors.selectedText
                            : colors.teal,
                        },
                      ]}
                    />
                  ) : (
                    <View style={styles.dotSpacer} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {listTitle}  ·  {visibleSessions.length} seans
      </Text>
      {visibleSessions.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          Bu tarih aralığında seans yok. Yıl oklarıyla veya Tarihe git ile geçmişe
          bakabilirsiniz.
        </Text>
      ) : (
        visibleSessions.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            onPress={() =>
              navigation.navigate('SessionDetail', { sessionId: session.id })
            }
          />
        ))
      )}
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  search: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthBtn: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  doneBtn: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cal: {
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 12,
    margin: 1,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },
  dotSpacer: {
    height: 8,
  },
  hint: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Calendar;
