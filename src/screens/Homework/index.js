import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import FloatingActionButton from '../../components/FloatingActionButton';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { formatShortDate, homeworkStatus } from '../../common/helpers';

const FILTERS = {
  today: {
    title: 'Bugün teslim',
    hint: 'Teslim günü bugün olan ödevler',
    empty: 'Bugün teslim edilecek ödev yok.',
  },
  upcoming: {
    title: 'Yaklaşan ödevler',
    hint: 'Teslim günü henüz gelmemiş ödevler',
    empty: 'Yaklaşan ödev yok.',
  },
  overdue: {
    title: 'Geciken ödevler',
    hint: 'Teslim günü geçmiş ödevler',
    empty: 'Geciken ödev yok.',
  },
};

const Homework = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const filter = route.params?.filter;
  const homework = useAppStore(state => state.homework);
  const deleteHomework = useAppStore(state => state.deleteHomework);
  const [pendingDelete, setPendingDelete] = useState(null);
  const meta = FILTERS[filter];

  const items = useMemo(() => {
    if (!filter) {
      return homework;
    }
    return homework.filter(item => homeworkStatus(item) === filter);
  }, [filter, homework]);

  const onConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }
    const result = deleteHomework(pendingDelete.id);
    if (result.ok) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Ödev silindi',
        textBody: pendingDelete.title,
      });
    }
    setPendingDelete(null);
  };

  return (
    <ThemedScreen
      title={meta?.title || 'Danışan Ödevleri'}
      showBack
      padTabBar={false}
      overlay={
        <FloatingActionButton
          onPress={() => navigation.navigate('NewHomework')}
          accessibilityLabel="Yeni ödev"
          padTabBar={false}
        />
      }
    >
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {meta?.hint ||
          'Danışanlarınıza verdiğiniz ödevleri buradan düzenleyin veya silin.'}
      </Text>

      {pendingDelete ? (
        <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.noticeTitle, { color: colors.cardText }]}>
            “{pendingDelete.title}” silinsin mi?
          </Text>
          <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
            Bu ödev kaydı kaldırılacak. Bu işlem geri alınamaz.
          </Text>
          <View style={styles.noticeActions}>
            <Pressable
              onPress={() => setPendingDelete(null)}
              style={[styles.sideBtn, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sideText, { color: colors.cardText }]}>
                Vazgeç
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirmDelete}
              style={[styles.sideBtn, styles.flexBtn, { backgroundColor: colors.danger }]}
            >
              <Text style={[styles.sideText, { color: colors.quickPrimaryText }]}>
                Sil
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          {meta?.empty || 'Henüz ödev yok. Sağ alttan ekleyebilirsiniz.'}
        </Text>
      ) : (
        items.map(item => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Pressable
              onPress={() =>
                navigation.navigate('NewHomework', { homeworkId: item.id })
              }
              style={({ pressed }) => [
                styles.body,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text style={[styles.title, { color: colors.cardText }]}>
                {item.title}
              </Text>
              <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
                {item.client}  ·  Teslim {formatShortDate(new Date(item.due))}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPendingDelete(item)}
              hitSlop={8}
              style={styles.iconBtn}
              accessibilityLabel="Ödevi sil"
            >
              <Icon name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        ))
      )}
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  notice: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  noticeBody: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  noticeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sideBtn: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBtn: {
    flex: 1,
  },
  sideText: {
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconBtn: {
    paddingLeft: 8,
  },
});

export default Homework;
