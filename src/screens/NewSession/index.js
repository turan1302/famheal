import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import SearchableSelect from '../../components/SearchableSelect';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  SESSION_DURATIONS,
  formatDate,
  formatTime,
  sessionDateTime,
} from '../../common/helpers';
import { scheduleSessionReminder } from '../../common/notifications';

const NewSession = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const sessionId = route.params?.sessionId;
  const presetClientId = route.params?.clientId;
  const clients = useAppStore(state => state.clients);
  const sessions = useAppStore(state => state.sessions);
  const sessionTypes = useAppStore(state => state.sessionTypes);
  const addSession = useAppStore(state => state.addSession);
  const updateSession = useAppStore(state => state.updateSession);
  const existing = useMemo(
    () => sessions.find(item => item.id === sessionId),
    [sessionId, sessions],
  );

  const [clientId, setClientId] = useState(
    existing?.clientId || presetClientId || '',
  );
  const [type, setType] = useState(
    existing?.type || sessionTypes[0]?.name || '',
  );
  const [duration, setDuration] = useState(existing?.duration || '50 dk');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [date, setDate] = useState(
    existing ? sessionDateTime(existing) : new Date(),
  );
  const [pickerMode, setPickerMode] = useState('date');
  const [showPicker, setShowPicker] = useState(false);

  const clientItems = useMemo(
    () =>
      clients.map(client => ({
        id: client.id,
        title: client.name,
        subtitle: client.phone
          ? `${client.phone} · ${client.type}`
          : client.type,
        search: `${client.name} ${client.phone} ${client.type}`,
        type: client.type,
      })),
    [clients],
  );

  const openPicker = mode => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }
    setDate(prev => {
      const next = new Date(prev);
      if (pickerMode === 'date') {
        next.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
      } else {
        next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      }
      return next;
    });
  };

  const onSave = async () => {
    if (!clientId) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Danışan seçin',
        textBody: 'Listeden bir danışan arayıp seçin.',
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

    const payload = { clientId, type, duration, notes, date };
    const saved = existing
      ? updateSession(existing.id, payload)
      : addSession(payload);

    const scheduled = saved ? await scheduleSessionReminder(saved) : false;
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: existing ? 'Seans güncellendi' : 'Seans kaydedildi',
      textBody: scheduled
        ? 'Yaklaşan randevu için yerel hatırlatma kuruldu.'
        : 'Seans kaydedildi.',
    });
    navigation.goBack();
  };

  return (
    <ThemedScreen
      title={existing ? 'Seansı Düzenle' : 'Yeni Seans'}
      showBack
      padTabBar={false}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>Danışan</Text>
      {clients.length === 0 ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          Önce danışan ekleyin.
        </Text>
      ) : (
        <SearchableSelect
          items={clientItems}
          selectedId={clientId}
          onSelect={(id, item) => {
            setClientId(id);
            if (item?.type) {
              setType(item.type);
            }
          }}
          placeholder="Danışan adı veya telefon ara"
          emptyLabel="Eşleşen danışan yok"
        />
      )}

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
                { backgroundColor: selected ? colors.selectedBg : colors.card },
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

      <Text style={[styles.label, { color: colors.textMuted }]}>Süre</Text>
      <View style={styles.row}>
        {SESSION_DURATIONS.map(item => {
          const selected = duration === item;
          return (
            <Pressable
              key={item}
              onPress={() => setDuration(item)}
              style={[
                styles.chip,
                { backgroundColor: selected ? colors.selectedBg : colors.card },
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  { color: selected ? colors.selectedText : colors.cardText },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.label, { color: colors.textMuted }]}>Tarih</Text>
      <Pressable
        onPress={() => openPicker('date')}
        style={[styles.pickerBtn, { backgroundColor: colors.card }]}
      >
        <Icon name="calendar-outline" size={18} color={colors.teal} />
        <Text style={[styles.pickerText, { color: colors.cardText }]}>
          {formatDate(date)}
        </Text>
      </Pressable>

      <Text style={[styles.label, { color: colors.textMuted }]}>Saat</Text>
      <Pressable
        onPress={() => openPicker('time')}
        style={[styles.pickerBtn, { backgroundColor: colors.card }]}
      >
        <Icon name="time-outline" size={18} color={colors.teal} />
        <Text style={[styles.pickerText, { color: colors.cardText }]}>
          {formatTime(date)}
        </Text>
      </Pressable>

      {showPicker ? (
        <View>
          <DateTimePicker
            value={date}
            mode={pickerMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour
            onChange={onChange}
            locale="tr-TR"
            themeVariant={colors.statusBar === 'light-content' ? 'dark' : 'light'}
          />
          {Platform.OS === 'ios' ? (
            <Pressable
              onPress={() => setShowPicker(false)}
              style={[styles.doneBtn, { backgroundColor: colors.mintSoft }]}
            >
              <Text style={[styles.doneText, { color: colors.teal }]}>Tamam</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.label, { color: colors.textMuted }]}>Not</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Seans notu"
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
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  empty: {
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
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
  doneBtn: {
    alignSelf: 'flex-end',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
  },
  notes: {
    minHeight: 96,
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
});

export default NewSession;
