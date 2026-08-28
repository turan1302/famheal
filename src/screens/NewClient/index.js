import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';

const NewClient = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const clientId = route.params?.clientId;
  const clients = useAppStore(state => state.clients);
  const sessionTypes = useAppStore(state => state.sessionTypes);
  const addClient = useAppStore(state => state.addClient);
  const updateClient = useAppStore(state => state.updateClient);
  const deleteClient = useAppStore(state => state.deleteClient);
  const sessions = useAppStore(state => state.sessions);
  const homework = useAppStore(state => state.homework);
  const existing = useMemo(
    () => clients.find(item => item.id === clientId),
    [clientId, clients],
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState(
    existing?.type ?? sessionTypes[0]?.name ?? '',
  );
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const relatedSessionsCount = useMemo(
    () =>
      existing
        ? sessions.filter(item => item.clientId === existing.id).length
        : 0,
    [existing, sessions],
  );
  const relatedHomeworkCount = useMemo(() => {
    if (!existing) {
      return 0;
    }
    const sessionIds = new Set(
      sessions
        .filter(item => item.clientId === existing.id)
        .map(item => item.id),
    );
    return homework.filter(
      item => item.clientId === existing.id || sessionIds.has(item.sessionId),
    ).length;
  }, [existing, homework, sessions]);

  const onSave = () => {
    if (!name.trim()) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Eksik bilgi',
        textBody: 'Danışan adı gerekli',
      });
      return;
    }
    if (!type) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Seans türü seçin',
        textBody: 'Ayarlardan seans türü ekleyebilirsiniz',
      });
      return;
    }

    if (existing) {
      updateClient(existing.id, { name, type, phone });
    } else {
      addClient({ name, type, phone });
    }

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: existing ? 'Danışan güncellendi' : 'Danışan eklendi',
      textBody: phone.trim()
        ? `${name.trim()} · ${phone.trim()}`
        : name.trim(),
    });
    if (!existing) {
      navigation.goBack();
    }
  };

  const onDelete = () => {
    if (!existing) {
      return;
    }
    const result = deleteClient(existing.id);
    if (result.ok) {
      const extra = [];
      if (result.sessionsCount) {
        extra.push(`${result.sessionsCount} seans`);
      }
      if (result.homeworkCount) {
        extra.push(`${result.homeworkCount} ödev`);
      }
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Danışan silindi',
        textBody: extra.length
          ? `${existing.name} · ${extra.join(', ')}`
          : existing.name,
      });
      navigation.goBack();
    }
  };

  const relatedParts = [];
  if (relatedSessionsCount) {
    relatedParts.push(`${relatedSessionsCount} seans`);
  }
  if (relatedHomeworkCount) {
    relatedParts.push(`${relatedHomeworkCount} ödev`);
  }
  const relatedText = relatedParts.length
    ? ` Bu danışana ait ${relatedParts.join(' ve ')} kaydı da silinecek.`
    : '';

  return (
    <ThemedScreen
      title={existing ? 'Danışanı Düzenle' : 'Yeni Danışan'}
      showBack
      padTabBar={false}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Ad soyad</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Örn. Ayşe Yılmaz"
          placeholderTextColor={colors.cardTextMuted}
          autoCapitalize="words"
          autoCorrect={false}
          style={[
            styles.input,
            { backgroundColor: colors.card, color: colors.cardText },
          ]}
        />
      <Text style={[styles.label, { color: colors.textMuted }]}>Telefon</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Örn. 0532 111 22 33"
        placeholderTextColor={colors.cardTextMuted}
        keyboardType="phone-pad"
        style={[
          styles.input,
          { backgroundColor: colors.card, color: colors.cardText },
        ]}
      />
      <Text style={[styles.label, { color: colors.textMuted }]}>Seans türü</Text>
      {sessionTypes.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          Ayarlar → Seans türleri bölümünden tür ekleyin
        </Text>
      ) : (
        sessionTypes.map(item => {
          const selected = type === item.name;
          return (
            <Pressable
              key={item.id}
              onPress={() => setType(item.name)}
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
                  { color: selected ? colors.selectedText : colors.cardText },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })
      )}
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
              “{existing.name}” silinsin mi?
            </Text>
            <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
              Danışan kaydı kaldırılacak.{relatedText} Bu işlem geri alınamaz
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
              Danışanı sil
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
  empty: {
    marginBottom: 16,
  },
  button: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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

export default NewClient;
