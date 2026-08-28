import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { formatDurationLabel, parseDurationMinutes } from '../../common/helpers';

const usageLabel = sessionsCount =>
  sessionsCount ? `${sessionsCount} seans` : '';

const SessionDurations = () => {
  const colors = useThemeColors();
  const sessionDurations = useAppStore(state => state.sessionDurations);
  const sessions = useAppStore(state => state.sessions);
  const addSessionDuration = useAppStore(state => state.addSessionDuration);
  const updateSessionDuration = useAppStore(state => state.updateSessionDuration);
  const deleteSessionDuration = useAppStore(state => state.deleteSessionDuration);

  const [minutes, setMinutes] = useState('');
  const [editingId, setEditingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [replacementId, setReplacementId] = useState('');

  const sorted = useMemo(
    () => [...sessionDurations].sort((a, b) => a.minutes - b.minutes),
    [sessionDurations],
  );

  const usageById = useMemo(() => {
    const map = {};
    sessionDurations.forEach(item => {
      const label = formatDurationLabel(item.minutes);
      map[item.id] = sessions.filter(session => session.duration === label).length;
    });
    return map;
  }, [sessionDurations, sessions]);

  const replacements = pendingDelete
    ? sorted.filter(item => item.id !== pendingDelete.id)
    : [];

  const onSave = () => {
    const value = parseDurationMinutes(minutes);
    const result = editingId
      ? updateSessionDuration(editingId, value)
      : addSessionDuration(value);

    if (!result.ok) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Kaydedilemedi',
        textBody:
          result.reason === 'duplicate'
            ? 'Bu süre zaten var'
            : 'Geçerli bir dakika girin',
      });
      return;
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: editingId ? 'Süre güncellendi' : 'Süre eklendi',
      textBody:
        editingId && result.sessionsCount
          ? `${result.name} olarak ${usageLabel(result.sessionsCount)} güncellendi`
          : formatDurationLabel(value),
    });
    setMinutes('');
    setEditingId('');
  };

  const onEdit = item => {
    setEditingId(item.id);
    setMinutes(String(item.minutes));
    setPendingDelete(null);
  };

  const onAskDelete = item => {
    if (sessionDurations.length <= 1) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Silinemedi',
        textBody: 'Son seans süresi silinemez. Önce yeni bir süre ekleyin',
      });
      return;
    }
    setEditingId('');
    setMinutes('');
    setPendingDelete({ ...item, sessionsCount: usageById[item.id] || 0 });
    const other = sorted.find(entry => entry.id !== item.id);
    setReplacementId(other?.id || '');
  };

  const onConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    const result = deleteSessionDuration(
      pendingDelete.id,
      pendingDelete.sessionsCount > 0 ? replacementId : undefined,
    );

    if (!result.ok) {
      const messages = {
        last: 'Son seans süresi silinemez. Önce yeni bir süre ekleyin',
        replacement: 'Kayıtları aktarmak için başka bir süre seçin',
        missing: 'Süre bulunamadı',
      };
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Silinemedi',
        textBody: messages[result.reason] || 'İşlem tamamlanamadı',
      });
      return;
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Süre silindi',
      textBody: result.migrated
        ? `${usageLabel(result.sessionsCount)} "${result.to}" süresine aktarıldı`
        : `"${formatDurationLabel(pendingDelete.minutes)}" kaldırıldı`,
    });
    setPendingDelete(null);
    setReplacementId('');
  };

  return (
    <ThemedScreen title="Seans Süreleri" showBack padTabBar={false}>
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {editingId ? 'Süreyi düzenle' : 'Yeni süre ekle'}
      </Text>
      <TextInput
        value={minutes}
        onChangeText={setMinutes}
        placeholder="Örn. 50"
        placeholderTextColor={colors.cardTextMuted}
        keyboardType="number-pad"
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.cardText },
        ]}
      />
      <View style={styles.actions}>
        {editingId ? (
          <Pressable
            onPress={() => {
              setEditingId('');
              setMinutes('');
            }}
            style={[styles.sideBtn, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sideText, { color: colors.cardText }]}>Vazgeç</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onSave}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: colors.quickPrimaryBg, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={[styles.saveText, { color: colors.quickPrimaryText }]}>
            {editingId ? 'Güncelle' : 'Ekle'}
          </Text>
        </Pressable>
      </View>

      {pendingDelete ? (
        <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.noticeTitle, { color: colors.cardText }]}>
            “{formatDurationLabel(pendingDelete.minutes)}” silinsin mi?
          </Text>
          {pendingDelete.sessionsCount > 0 ? (
            <>
              <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
                {usageLabel(pendingDelete.sessionsCount)} bu süreye bağlı.
                Kayıtlar silinmez; seçtiğiniz süreye aktarılır
              </Text>
              <Text style={[styles.label, { color: colors.cardTextMuted }]}>
                Aktarılacak süre
              </Text>
              {replacements.map(item => {
                const selected = replacementId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setReplacementId(item.id)}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: selected ? colors.selectedBg : colors.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        {
                          color: selected ? colors.selectedText : colors.cardText,
                        },
                      ]}
                    >
                      {formatDurationLabel(item.minutes)}
                    </Text>
                  </Pressable>
                );
              })}
            </>
          ) : (
            <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
              Bu süreye bağlı seans kaydı yok
            </Text>
          )}
          <View style={styles.actions}>
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
              style={[styles.saveBtn, { backgroundColor: colors.danger }]}
            >
              <Text style={[styles.saveText, { color: colors.quickPrimaryText }]}>
                {pendingDelete.sessionsCount > 0 ? 'Aktar ve sil' : 'Sil'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {sorted.map(item => {
        const sessionsCount = usageById[item.id] || 0;
        return (
          <View
            key={item.id}
            style={[styles.row, { backgroundColor: colors.card }]}
          >
            <View style={styles.body}>
              <Text style={[styles.name, { color: colors.cardText }]}>
                {formatDurationLabel(item.minutes)}
              </Text>
              <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
                {usageLabel(sessionsCount) || 'Bağlı kayıt yok'}
              </Text>
            </View>
            <Pressable onPress={() => onEdit(item)} hitSlop={8} style={styles.iconBtn}>
              <Icon name="create-outline" size={20} color={colors.teal} />
            </Pressable>
            <Pressable
              onPress={() => onAskDelete(item)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <Icon name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        );
      })}
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 15,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sideBtn: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideText: {
    fontSize: 15,
    fontWeight: '600',
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
  choice: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    marginTop: 3,
  },
  iconBtn: {
    paddingHorizontal: 6,
  },
});

export default SessionDurations;
