import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../theme';
import { matchesQuery } from '../../common/helpers';

const SearchableSelect = ({
  items,
  selectedId,
  onSelect,
  placeholder = 'Seçin',
  searchPlaceholder = 'Ara',
  emptyLabel = 'Kayıt bulunamadı',
  title = 'Seçim yapın',
}) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = items.find(item => item.id === selectedId);

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

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const choose = (id, item) => {
    onSelect(id, item);
    close();
  };

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.trigger,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.triggerBody,
            { opacity: pressed ? 0.88 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <Text
            style={[
              styles.triggerTitle,
              { color: selected ? colors.cardText : colors.cardTextMuted },
            ]}
            numberOfLines={1}
          >
            {selected?.title || placeholder}
          </Text>
          {selected?.subtitle ? (
            <Text
              style={[styles.triggerMeta, { color: colors.cardTextMuted }]}
              numberOfLines={1}
            >
              {selected.subtitle}
            </Text>
          ) : null}
        </Pressable>
        {selected ? (
          <Pressable
            onPress={() => onSelect('', null)}
            hitSlop={8}
            accessibilityLabel="Seçimi temizle"
          >
            <Icon name="close-circle" size={20} color={colors.cardTextMuted} />
          </Pressable>
        ) : (
          <Pressable onPress={() => setOpen(true)} hitSlop={8}>
            <Icon name="chevron-down" size={20} color={colors.cardTextMuted} />
          </Pressable>
        )}
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={close} />
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.card,
                  maxHeight: height * 0.72,
                  paddingBottom: Math.max(insets.bottom, 16),
                },
              ]}
            >
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.sheetTitle, { color: colors.cardText }]}>
                {title}
              </Text>
              <View
                style={[
                  styles.search,
                  { backgroundColor: colors.cardMuted, borderColor: colors.border },
                ]}
              >
                <Icon
                  name="search-outline"
                  size={18}
                  color={colors.cardTextMuted}
                />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.cardTextMuted}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                  autoFocus
                  style={[styles.input, { color: colors.cardText }]}
                />
                {query ? (
                  <Pressable onPress={() => setQuery('')} hitSlop={8}>
                    <Icon
                      name="close-circle"
                      size={18}
                      color={colors.cardTextMuted}
                    />
                  </Pressable>
                ) : null}
              </View>
              <FlatList
                data={filtered}
                keyExtractor={item => String(item.id)}
                style={{ maxHeight: height * 0.48 }}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="none"
                ListEmptyComponent={
                  <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
                    {emptyLabel}
                  </Text>
                }
                renderItem={({ item }) => {
                  const active = item.id === selectedId;
                  return (
                    <Pressable
                      onPress={() => choose(item.id, item)}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: active
                            ? colors.selectedBg
                            : colors.cardMuted,
                          opacity: pressed ? 0.88 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionTitle,
                          {
                            color: active
                              ? colors.selectedText
                              : colors.cardText,
                          },
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
                }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  trigger: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  triggerBody: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  triggerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  search: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  empty: {
    fontSize: 13,
    paddingVertical: 20,
    textAlign: 'center',
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
