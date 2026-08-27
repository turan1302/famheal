import { useState } from 'react';
import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedScreen from '../../components/ThemedScreen';
import DateTimePickerSheet from '../../components/DateTimePickerSheet';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { dateFromHm, formatHm, padTime } from '../../common/helpers';

const QuietHours = () => {
  const colors = useThemeColors();
  const settings = useNotificationSettings();
  const updateNotificationSettings = useAppStore(
    state => state.updateNotificationSettings,
  );
  const { quietHours } = settings;
  const [pickerField, setPickerField] = useState(null);

  const pickerValue = pickerField
    ? dateFromHm(quietHours[pickerField])
    : new Date();

  const onChangeTime = selectedDate => {
    if (!pickerField) {
      return;
    }
    updateNotificationSettings({
      quietHours: { [pickerField]: padTime(selectedDate) },
    });
  };

  return (
    <ThemedScreen title="Sessiz Saatler" showBack padTabBar={false}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Bu aralıkta düşen hatırlatmalar sessiz saat bitimine ertelenir. Seans
        saatini geçmiş bir hatırlatma gönderilmez.
      </Text>

      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.cardText }]}>
            Sessiz saatler
          </Text>
          <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
            {quietHours.enabled
              ? `${formatHm(quietHours.start)} – ${formatHm(quietHours.end)}`
              : 'Kapalı'}
          </Text>
        </View>
        <Switch
          value={quietHours.enabled}
          onValueChange={value =>
            updateNotificationSettings({
              quietHours: { enabled: value },
            })
          }
          trackColor={{ false: colors.cardMuted, true: colors.mint }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.cardMuted}
        />
      </View>

      <Pressable
        onPress={() => setPickerField('start')}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.mintSoft }]}>
          <Icon name="moon-outline" size={18} color={colors.teal} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.cardText }]}>Başlangıç</Text>
          <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
            {formatHm(quietHours.start)}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => setPickerField('end')}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.mintSoft }]}>
          <Icon name="sunny-outline" size={18} color={colors.teal} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.cardText }]}>Bitiş</Text>
          <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
            {formatHm(quietHours.end)}
          </Text>
        </View>
      </Pressable>

      <DateTimePickerSheet
        visible={Boolean(pickerField)}
        value={pickerValue}
        mode="time"
        onChange={onChangeTime}
        onClose={() => setPickerField(null)}
      />
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default QuietHours;
