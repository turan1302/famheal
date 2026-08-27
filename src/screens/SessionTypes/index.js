import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

const usageLabel = (sessionsCount, clientsCount) => {
  const parts = [];
  if (sessionsCount) {
    parts.push(`${sessionsCount} seans`);
  }
  if (clientsCount) {
    parts.push(`${clientsCount} danışan`);
  }
  return parts.join(' ve ');
};

const SessionTypes = () => {
  const colors = useThemeColors();
  const sessionTypes = useAppStore(state => state.sessionTypes);
  const sessions = useAppStore(state => state.sessions);
  const clients = useAppStore(state => state.clients);
  const addSessionType = useAppStore(state => state.addSessionType);
  const updateSessionType = useAppStore(state => state.updateSessionType);
  const deleteSessionType = useAppStore(state => state.deleteSessionType);

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [replacementId, setReplacementId] = useState('');

  const usageByName = useMemo(() => {
    const map = {};
    sessionTypes.forEach(type => {
      map[type.id] = {
        sessionsCount: sessions.filter(item => item.type === type.name).length,
        clientsCount: clients.filter(item => item.type === type.name).length,
      };
    });
    return map;
  }, [clients, sessionTypes, sessions]);

  const replacements = pendingDelete
    ? sessionTypes.filter(item => item.id !== pendingDelete.id)
    : [];

  const onSave = () => {
    const result = editingId
      ? updateSessionType(editingId, name)
      : addSessionType(name);

    if (!result.ok) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Kaydedilemedi',
        textBody:
          result.reason === 'duplicate'
            ? 'Bu seans türü zaten var.'
            : 'Tür adı gerekli.',
      });
      return;
    }

    const updatedCount = (result.sessionsCount || 0) + (result.clientsCount || 0);
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: editingId ? 'Tür güncellendi' : 'Tür eklendi',
      textBody: editingId && updatedCount
        ? `${name.trim()} olarak ${usageLabel(
            result.sessionsCount,
            result.clientsCount,
          )} güncellendi.`
        : name.trim(),
    });
    setName('');
    setEditingId('');
  };

  const onEdit = type => {
    setEditingId(type.id);
    setName(type.name);
    setPendingDelete(null);
  };

  const onAskDelete = type => {
    if (sessionTypes.length <= 1) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Silinemedi',
        textBody: 'Son seans türü silinemez. Önce yeni bir tür ekleyin.',
      });
      return;
    }
    const usage = usageByName[type.id] || { sessionsCount: 0, clientsCount: 0 };
    setEditingId('');
    setName('');
    setPendingDelete({ ...type, ...usage });
    const other = sessionTypes.find(item => item.id !== type.id);
    setReplacementId(other?.id || '');
  };

  const onConfirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    const hasRecords =
      pendingDelete.sessionsCount + pendingDelete.clientsCount > 0;
    const result = deleteSessionType(
      pendingDelete.id,
      hasRecords ? replacementId : undefined,
    );

    if (!result.ok) {
      const messages = {
        last: 'Son seans türü silinemez. Önce yeni bir tür ekleyin.',
        replacement: 'Kayıtları aktarmak için başka bir tür seçin.',
        missing: 'Tür bulunamadı.',
      };
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Silinemedi',
        textBody: messages[result.reason] || 'İşlem tamamlanamadı.',
      });
      return;
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Tür silindi',
      textBody: result.migrated
        ? `${usageLabel(result.sessionsCount, result.clientsCount)} "${result.to}" türüne aktarıldı.`
        : `"${pendingDelete.name}" kaldırıldı.`,
    });
    setPendingDelete(null);
    setReplacementId('');
  };

  return (
    <ThemedScreen title="Seans Türleri" showBack padTabBar={false}>
      <Text style={[styles.label, { color: colors.textMuted }]}>
        {editingId ? 'Türü düzenle' : 'Yeni tür ekle'}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Örn. Çocuk Terapisi"
        placeholderTextColor={colors.cardTextMuted}
        autoCapitalize="words"
        autoCorrect={false}
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
              setName('');
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
            “{pendingDelete.name}” silinsin mi?
          </Text>
          {pendingDelete.sessionsCount + pendingDelete.clientsCount > 0 ? (
            <>
              <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
                {usageLabel(
                  pendingDelete.sessionsCount,
                  pendingDelete.clientsCount,
                )}{' '}
                bu türe bağlı. Kayıtlar silinmez; seçtiğiniz türe aktarılır.
              </Text>
              <Text style={[styles.label, { color: colors.cardTextMuted }]}>
                Aktarılacak tür
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
                        backgroundColor: selected
                          ? colors.selectedBg
                          : colors.card,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
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
            </>
          ) : (
            <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
              Bu türe bağlı seans veya danışan kaydı yok.
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
                {pendingDelete.sessionsCount + pendingDelete.clientsCount > 0
                  ? 'Aktar ve sil'
                  : 'Sil'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {sessionTypes.map(type => {
        const usage = usageByName[type.id] || {
          sessionsCount: 0,
          clientsCount: 0,
        };
        const usageText = usageLabel(usage.sessionsCount, usage.clientsCount);
        return (
          <View
            key={type.id}
            style={[styles.row, { backgroundColor: colors.card }]}
          >
            <View style={styles.body}>
              <Text style={[styles.name, { color: colors.cardText }]}>
                {type.name}
              </Text>
              <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
                {usageText || 'Bağlı kayıt yok'}
              </Text>
            </View>
            <Pressable onPress={() => onEdit(type)} hitSlop={8} style={styles.iconBtn}>
              <Icon name="create-outline" size={20} color={colors.teal} />
            </Pressable>
            <Pressable
              onPress={() => onAskDelete(type)}
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

export default SessionTypes;
