import { View, Text, Switch, StyleSheet } from 'react-native';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';

const TYPES = [
  {
    key: 'session',
    label: 'Seans hatırlatması',
    hint: 'Seans saatinden 15 dakika önce',
  },
  {
    key: 'homework',
    label: 'Ödev hatırlatması',
    hint: 'Teslim günü sabah 09:00',
  },
];

const NotificationTypes = () => {
  const colors = useThemeColors();
  const settings = useNotificationSettings();
  const updateNotificationSettings = useAppStore(
    state => state.updateNotificationSettings,
  );

  return (
    <ThemedScreen title="Bildirim Türleri" showBack padTabBar={false}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Hangi yerel hatırlatmaların kurulacağını seçin. Bildirimler bu cihazda
        kalır, sunucuya gönderilmez.
      </Text>
      {TYPES.map(item => {
        const enabled = settings.types[item.key];
        return (
          <View
            key={item.key}
            style={[styles.row, { backgroundColor: colors.card }]}
          >
            <View style={styles.body}>
              <Text style={[styles.label, { color: colors.cardText }]}>
                {item.label}
              </Text>
              <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
                {item.hint}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={value =>
                updateNotificationSettings({
                  types: { [item.key]: value },
                })
              }
              trackColor={{ false: colors.cardMuted, true: colors.mint }}
              thumbColor="#FFFFFF"
            />
          </View>
        );
      })}
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

export default NotificationTypes;
