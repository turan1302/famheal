import { useMemo, useState } from 'react';
import { Text, TextInput, Pressable, StyleSheet } from 'react-native';
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
  const existing = useMemo(
    () => clients.find(item => item.id === clientId),
    [clientId, clients],
  );

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState(
    existing?.type ?? sessionTypes[0]?.name ?? '',
  );
  const [phone, setPhone] = useState(existing?.phone ?? '');

  const onSave = () => {
    if (!name.trim()) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Eksik bilgi',
        textBody: 'Danışan adı gerekli.',
      });
      return;
    }
    if (!type) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Seans türü seçin',
        textBody: 'Ayarlardan seans türü ekleyebilirsiniz.',
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
    navigation.goBack();
  };

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
          Ayarlar → Seans türleri bölümünden tür ekleyin.
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
});

export default NewClient;
