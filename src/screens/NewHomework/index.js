import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import DateTimePickerSheet from '../../components/DateTimePickerSheet';
import SearchableSelect from '../../components/SearchableSelect';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { formatDate } from '../../common/helpers';

const NewHomework = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const homeworkId = route.params?.homeworkId;
  const presetSessionId = route.params?.sessionId;
  const presetClientId = route.params?.clientId;

  const clients = useAppStore(state => state.clients);
  const sessions = useAppStore(state => state.sessions);
  const homework = useAppStore(state => state.homework);
  const addHomework = useAppStore(state => state.addHomework);
  const updateHomework = useAppStore(state => state.updateHomework);
  const deleteHomework = useAppStore(state => state.deleteHomework);

  const existing = useMemo(
    () => homework.find(item => item.id === homeworkId),
    [homework, homeworkId],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [clientId, setClientId] = useState(
    existing?.clientId || presetClientId || clients[0]?.id || '',
  );
  const [sessionId, setSessionId] = useState(
    existing?.sessionId || presetSessionId || '',
  );
  const [due, setDue] = useState(
    existing?.due ? new Date(existing.due) : new Date(),
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [showPicker, setShowPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const clientSessions = sessions.filter(item => item.clientId === clientId);

  const clientItems = useMemo(
    () =>
      clients.map(client => ({
        id: client.id,
        title: client.name,
        subtitle: client.phone
          ? `${client.phone} · ${client.type}`
          : client.type,
        search: `${client.name} ${client.phone} ${client.type}`,
      })),
    [clients],
  );

  const onChangeDue = selectedDate => {
    setDue(selectedDate);
  };

  const onSave = () => {
    if (!title.trim()) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Eksik bilgi',
        textBody: 'Ödev başlığı gerekli.',
      });
      return;
    }
    if (!clientId) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Danışan seçin',
        textBody: 'Listeden bir danışan arayıp seçin.',
      });
      return;
    }

    const payload = {
      title,
      clientId,
      sessionId,
      due,
      notes,
    };

    if (existing) {
      updateHomework(existing.id, payload);
    } else {
      addHomework(payload);
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: existing ? 'Ödev güncellendi' : 'Ödev eklendi',
      textBody: title.trim(),
    });
    navigation.goBack();
  };

  const onDelete = () => {
    if (!existing) {
      return;
    }
    const result = deleteHomework(existing.id);
    if (result.ok) {
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Ödev silindi',
        textBody: existing.title,
      });
      navigation.goBack();
    }
  };

  return (
    <ThemedScreen
      title={existing ? 'Ödevi Düzenle' : 'Seansa Ödev Ekle'}
      showBack
      padTabBar={false}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Ödev başlığı</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Örn. Duygu günlüğü"
        placeholderTextColor={colors.cardTextMuted}
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.cardText },
        ]}
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>Danışan</Text>
      {clients.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          Önce danışan ekleyin.
        </Text>
      ) : (
        <SearchableSelect
          items={clientItems}
          selectedId={clientId}
          onSelect={id => {
            setClientId(id);
            if (sessionId) {
              const stillValid = sessions.some(
                item => item.id === sessionId && item.clientId === id,
              );
              if (!stillValid) {
                setSessionId('');
              }
            }
          }}
          placeholder="Danışan adı veya telefon ara"
          emptyLabel="Eşleşen danışan yok"
        />
      )}

      <Text style={[styles.label, { color: colors.textMuted, marginTop: 8 }]}>
        Bağlı seans
      </Text>
      <Pressable
        onPress={() => setSessionId('')}
        style={[
          styles.choice,
          { backgroundColor: !sessionId ? colors.selectedBg : colors.card },
        ]}
      >
        <Text
          style={[
            styles.choiceText,
            { color: !sessionId ? colors.selectedText : colors.cardText },
          ]}
        >
          Seansa bağlama
        </Text>
      </Pressable>
      {clientSessions.map(session => {
        const selected = sessionId === session.id;
        return (
          <Pressable
            key={session.id}
            onPress={() => setSessionId(session.id)}
            style={[
              styles.choice,
              { backgroundColor: selected ? colors.selectedBg : colors.card },
            ]}
          >
            <Text
              style={[
                styles.choiceText,
                { color: selected ? colors.selectedText : colors.cardText },
              ]}
            >
              {session.time} · {session.type}
            </Text>
          </Pressable>
        );
      })}

      <Text style={[styles.label, { color: colors.textMuted, marginTop: 8 }]}>
        Teslim tarihi
      </Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.pickerBtn, { backgroundColor: colors.card }]}
      >
        <Icon name="calendar-outline" size={18} color={colors.teal} />
        <Text style={[styles.pickerText, { color: colors.cardText }]}>
          {formatDate(due)}
        </Text>
      </Pressable>

      <DateTimePickerSheet
        visible={showPicker}
        value={due}
        mode="date"
        onChange={onChangeDue}
        onClose={() => setShowPicker(false)}
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>Not</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Ödev açıklaması"
        placeholderTextColor={colors.cardTextMuted}
        multiline
        style={[
          styles.notes,
          { backgroundColor: colors.card, color: colors.cardText },
        ]}
      />

      <Pressable
        onPress={onSave}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.quickPrimaryBg, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.quickPrimaryText }]}>
          Kaydet
        </Text>
      </Pressable>

      {existing ? (
        confirmDelete ? (
          <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
            <Text style={[styles.noticeTitle, { color: colors.cardText }]}>
              “{existing.title}” silinsin mi?
            </Text>
            <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
              Bu ödev kaydı kaldırılacak. Bu işlem geri alınamaz.
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
                style={[styles.sideBtn, styles.flexBtn, { backgroundColor: colors.danger }]}
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
              Ödevi sil
            </Text>
          </Pressable>
        )
      ) : null}
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  empty: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 15,
    marginBottom: 16,
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
  pickerBtn: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  notes: {
    minHeight: 88,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  deleteBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
  },
  notice: {
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
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

export default NewHomework;
