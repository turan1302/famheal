import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedScreen from '../../components/ThemedScreen';
import FloatingActionButton from '../../components/FloatingActionButton';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { matchesQuery, formatShortDate, sessionDateTime } from '../../common/helpers';

const Clients = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const clients = useAppStore(state => state.clients);
  const sessions = useAppStore(state => state.sessions);
  const sessionTypes = useAppStore(state => state.sessionTypes);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const lastSessionByClient = useMemo(() => {
    const map = {};
    sessions.forEach(item => {
      if (!item.clientId) {
        return;
      }
      const at = sessionDateTime(item);
      if (!map[item.clientId] || at > map[item.clientId]) {
        map[item.clientId] = at;
      }
    });
    return map;
  }, [sessions]);

  const filtered = useMemo(
    () =>
      clients.filter(client => {
        const matchesType = !typeFilter || client.type === typeFilter;
        const matchesSearch = matchesQuery(
          `${client.name} ${client.phone} ${client.type}`,
          query,
        );
        return matchesType && matchesSearch;
      }),
    [clients, query, typeFilter],
  );

  return (
    <ThemedScreen
      title="Danışanlar"
      overlay={
        <FloatingActionButton
          onPress={() => navigation.navigate('NewClient')}
          accessibilityLabel="Yeni danışan"
        />
      }
    >
      <View style={[styles.search, { backgroundColor: colors.card }]}>
        <Icon name="search-outline" size={18} color={colors.cardTextMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ad, telefon veya seans türü ara"
          placeholderTextColor={colors.cardTextMuted}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.cardText }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Icon name="close-circle" size={18} color={colors.cardTextMuted} />
          </Pressable>
        ) : null}
      </View>

      {sessionTypes.length > 0 ? (
        <View style={styles.chips}>
          <Pressable
            onPress={() => setTypeFilter('')}
            style={[
              styles.chip,
              {
                backgroundColor: !typeFilter
                  ? colors.selectedBg
                  : colors.card,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: !typeFilter ? colors.selectedText : colors.cardText,
                },
              ]}
            >
              Tümü
            </Text>
          </Pressable>
          {sessionTypes.map(item => {
            const selected = typeFilter === item.name;
            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setTypeFilter(selected ? '' : item.name)
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? colors.selectedBg
                      : colors.card,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selected
                        ? colors.selectedText
                        : colors.cardText,
                    },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {filtered.length} / {clients.length} danışan
      </Text>

      {filtered.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          {clients.length === 0
            ? 'Henüz danışan yok. Sağ alttan ekleyebilirsiniz.'
            : 'Bu filtreye uyan danışan yok.'}
        </Text>
      ) : (
        filtered.map(client => (
          <Pressable
            key={client.id}
            onPress={() =>
              navigation.navigate('NewClient', { clientId: client.id })
            }
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    client.accent === 'mint' ? colors.mintSoft : colors.teal,
                },
              ]}
            >
              <Text
                style={[
                  styles.initials,
                  {
                    color:
                      client.accent === 'mint'
                        ? colors.cardText
                        : colors.quickPrimaryText,
                  },
                ]}
              >
                {client.initials}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={[styles.name, { color: colors.cardText }]}>
                {client.name}
              </Text>
              <Text style={[styles.type, { color: colors.cardTextMuted }]}>
                {client.phone
                  ? `${client.phone}  ·  ${client.type}`
                  : client.type}
              </Text>
              {lastSessionByClient[client.id] ? (
                <Text style={[styles.type, { color: colors.cardTextMuted }]}>
                  Son seans: {formatShortDate(lastSessionByClient[client.id])}
                </Text>
              ) : null}
            </View>
          </Pressable>
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
  hint: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  initials: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  type: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default Clients;
