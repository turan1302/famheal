import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  formatDate,
  formatSessionWhen,
  SESSION_STATUS_OPTIONS,
  withResolvedStatus,
} from '../../common/helpers';

const SessionDetail = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const sessionId = route.params?.sessionId || route.params?.session?.id;
  const sessions = useAppStore(state => state.sessions);
  const homework = useAppStore(state => state.homework);
  const setSessionStatus = useAppStore(state => state.setSessionStatus);
  const deleteSession = useAppStore(state => state.deleteSession);

  const session = useMemo(() => {
    const found = sessions.find(item => item.id === sessionId);
    return found ? withResolvedStatus(found) : null;
  }, [sessionId, sessions]);

  const sessionHomework = useMemo(
    () => homework.filter(item => item.sessionId === sessionId),
    [homework, sessionId],
  );

  const [cancelReason, setCancelReason] = useState(
    session?.cancelReason || '',
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setCancelReason(session?.cancelReason || '');
  }, [session?.cancelReason, session?.id]);

  if (!session) {
    return (
      <ThemedScreen title="Seans" showBack>
        <Text style={{ color: colors.textMuted }}>Seans bulunamadı</Text>
      </ThemedScreen>
    );
  }

  const selectedStatus = ['completed', 'cancelled', 'no_show'].includes(
    session.status,
  )
    ? session.status
    : 'upcoming';

  const onStatus = status => {
    setSessionStatus(session.id, {
      status,
      cancelReason: status === 'cancelled' ? cancelReason : '',
    });
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Durum güncellendi',
      textBody:
        status === 'cancelled'
          ? 'Seans iptal edildi'
          : status === 'no_show'
            ? 'Danışan gelmedi olarak işaretlendi'
            : status === 'completed'
              ? 'Seans tamamlandı'
              : 'Seans planlandı',
    });
  };

  const onSaveReason = () => {
    setSessionStatus(session.id, {
      status: 'cancelled',
      cancelReason,
    });
  };

  const onDelete = () => {
    const result = deleteSession(session.id);
    if (result.ok) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Seans silindi',
        textBody: result.homeworkCount
          ? `${session.name} · ${result.homeworkCount} ödev danışanda kaldı`
          : `${session.name} · ${session.type}`,
      });
      navigation.goBack();
    }
  };

  return (
    <ThemedScreen title="Seans Detayı" showBack>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.name, { color: colors.cardText }]}>
          {session.name}
        </Text>
        <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
          {session.type}
        </Text>
        <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
          {formatSessionWhen(session)}  ·  {session.duration}
        </Text>
        {session.notes ? (
          <Text style={[styles.notes, { color: colors.cardText }]}>
            {session.notes}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Seans durumu</Text>
      <View style={styles.statusGrid}>
        {SESSION_STATUS_OPTIONS.map(item => {
          const selected = selectedStatus === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onStatus(item.key)}
              style={[
                styles.statusChip,
                {
                  backgroundColor: selected ? colors.selectedBg : colors.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: selected ? colors.selectedText : colors.cardText },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selectedStatus === 'cancelled' ? (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.reasonLabel, { color: colors.cardTextMuted }]}>
            İptal nedeni (isteğe bağlı)
          </Text>
          <TextInput
            value={cancelReason}
            onChangeText={setCancelReason}
            onEndEditing={onSaveReason}
            placeholder="Örn. Danışan mazeret bildirdi"
            placeholderTextColor={colors.cardTextMuted}
            multiline
            scrollEnabled={false}
            style={[styles.reasonInput, { color: colors.cardText }]}
          />
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => navigation.navigate('NewSession', { sessionId: session.id })}
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.cardText }]}>
            Düzenle
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            navigation.navigate('NewHomework', {
              sessionId: session.id,
              clientId: session.clientId,
            })
          }
          style={({ pressed }) => [
            styles.actionBtn,
            { backgroundColor: colors.quickPrimaryBg, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={[styles.actionText, { color: colors.quickPrimaryText }]}>
            Ödev ekle
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Seans ödevleri</Text>
      {sessionHomework.length === 0 ? (
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          Bu seansa henüz ödev eklenmedi
        </Text>
      ) : (
        sessionHomework.map(item => (
          <Pressable
            key={item.id}
            onPress={() =>
              navigation.navigate('NewHomework', { homeworkId: item.id })
            }
            style={[styles.hwCard, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.hwTitle, { color: colors.cardText }]}>
              {item.title}
            </Text>
            <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
              Teslim: {formatDate(new Date(item.due))}
            </Text>
            {item.notes ? (
              <Text
                style={[styles.hwNotes, { color: colors.cardTextMuted }]}
                numberOfLines={2}
              >
                {item.notes}
              </Text>
            ) : null}
          </Pressable>
        ))
      )}

      {confirmDelete ? (
        <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.noticeTitle, { color: colors.cardText }]}>
            Bu seans silinsin mi?
          </Text>
          <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
            {`Seans kaydı kaldırılacak.${
              sessionHomework.length
                ? ` ${sessionHomework.length} ödev danışanda kalır.`
                : ''
            } Bu işlem geri alınamaz`}
          </Text>
          <View style={styles.noticeActions}>
            <Pressable
              onPress={() => setConfirmDelete(false)}
              style={[styles.sideBtn, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sideText, { color: colors.cardText }]}>
                Vazgeç
              </Text>
            </Pressable>
            <Pressable
              onPress={onDelete}
              style={[
                styles.sideBtn,
                styles.flexBtn,
                { backgroundColor: colors.danger },
              ]}
            >
              <Text style={[styles.sideText, { color: colors.quickPrimaryText }]}>
                Sil
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setConfirmDelete(true)}
          style={({ pressed }) => [
            styles.deleteBtn,
            { opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={[styles.deleteText, { color: colors.danger }]}>
            Seansı sil
          </Text>
        </Pressable>
      )}
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  notes: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusChip: {
    width: '48%',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  reasonInput: {
    minHeight: 72,
    fontSize: 15,
    textAlignVertical: 'top',
    padding: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  hwCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  hwTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  hwNotes: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  deleteBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
  },
  notice: {
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
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
});

export default SessionDetail;
