import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../theme';
import { matchesQuery } from '../../common/helpers';

const SearchableSelect = ({
  items,
  selectedId,
  onSelect,
  placeholder = 'Ara',
  emptyLabel = 'Kayıt bulunamadı',
}) => {
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const selected = items.find(item => item.id === selectedId);
  const searching = query.trim().length > 0;

  const filtered = useMemo(
    () =>
      items.filter(item =>
        matchesQuery(
          `${item.title || ''} ${item.subtitle || ''} ${item.search || ''}`,
          query,
        ),
      ),
    [items, query],
  );

  const visible = selected && !searching ? [] : filtered;

  return (
    <View style={styles.wrap}>
      {selected ? (
        <View style={[styles.selected, { backgroundColor: colors.mintSoft }]}>
          <View style={styles.selectedBody}>
            <Text style={[styles.selectedTitle, { color: colors.teal }]}>
              {selected.title}
            </Text>
            {selected.subtitle ? (
              <Text style={[styles.selectedMeta, { color: colors.cardTextMuted }]}>
                {selected.subtitle}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => {
              setQuery('');
              onSelect('', null);
            }}
            hitSlop={8}
            accessibilityLabel="Seçimi temizle"
          >
            <Icon name="close-circle" size={20} color={colors.teal} />
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.search, { backgroundColor: colors.card }]}>
        <Icon name="search-outline" size={18} color={colors.cardTextMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.cardTextMuted}
          style={[styles.input, { color: colors.cardText }]}
        />
      </View>

      {selected && !searching ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          Başka bir kayıt için arayın
        </Text>
      ) : visible.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          {emptyLabel}
        </Text>
      ) : (
        visible.map(item => {
          const active = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setQuery('');
                onSelect(item.id, item);
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: active ? colors.selectedBg : colors.card,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionTitle,
                  { color: active ? colors.selectedText : colors.cardText },
                ]}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text
                  style={[
                    styles.optionMeta,
                    {
                      color: active
                        ? colors.selectedText
                        : colors.cardTextMuted,
                    },
                  ]}
                >
                  {item.subtitle}
                </Text>
              ) : null}
            </Pressable>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  selected: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBody: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  selectedMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  search: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  empty: {
    fontSize: 13,
    marginBottom: 12,
  },
  option: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default SearchableSelect;
