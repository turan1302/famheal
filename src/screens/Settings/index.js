import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ThemedScreen from '../../components/ThemedScreen';
import { useTheme, useThemeColors } from '../../theme';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { formatHm } from '../../common/helpers';

const THEME_OPTIONS = [
  { key: 'system', label: 'Sistem', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Açık', icon: 'sunny-outline' },
  { key: 'dark', label: 'Koyu', icon: 'moon-outline' },
];

const SettingsRow = ({ icon, label, hint, onPress, colors }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.row,
      { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
    ]}
  >
    <View style={[styles.iconWrap, { backgroundColor: colors.mintSoft }]}>
      <Icon name={icon} size={18} color={colors.teal} />
    </View>
    <View style={styles.body}>
      <Text style={[styles.label, { color: colors.cardText }]}>{label}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.cardTextMuted }]}>{hint}</Text>
      ) : null}
    </View>
    <Icon name="chevron-forward" size={18} color={colors.cardTextMuted} />
  </Pressable>
);

const Settings = () => {
  const colors = useThemeColors();
  const { preference, setPreference } = useTheme();
  const navigation = useNavigation();
  const notificationSettings = useNotificationSettings();

  const typeHint = [
    notificationSettings.types.session ? 'Seans' : null,
    notificationSettings.types.homework ? 'Ödev' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const quietHint = notificationSettings.quietHours.enabled
    ? `${formatHm(notificationSettings.quietHours.start)} – ${formatHm(
        notificationSettings.quietHours.end,
      )}`
    : 'Kapalı';

  return (
    <ThemedScreen title="Ayarlar">
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Görünüm
      </Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map(option => {
          const selected = preference === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setPreference(option.key)}
              style={({ pressed }) => [
                styles.themeCard,
                {
                  backgroundColor: selected ? colors.selectedBg : colors.card,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={option.label}
            >
              <Icon
                name={option.icon}
                size={18}
                color={selected ? colors.selectedText : colors.cardText}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: selected ? colors.selectedText : colors.cardText },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Uygulama
      </Text>
      <SettingsRow
        icon="layers-outline"
        label="Seans türleri"
        hint="Verdiğiniz seansları ekleyin, düzenleyin veya silin"
        onPress={() => navigation.navigate('SessionTypes')}
        colors={colors}
      />

      <Text style={[styles.sectionLabel, styles.sectionGap, { color: colors.textMuted }]}>
        Bildirimler
      </Text>
      <SettingsRow
        icon="notifications-outline"
        label="Bildirim türleri"
        hint={typeHint || 'Tümü kapalı'}
        onPress={() => navigation.navigate('NotificationTypes')}
        colors={colors}
      />
      <SettingsRow
        icon="moon-outline"
        label="Sessiz saatler"
        hint={quietHint}
        onPress={() => navigation.navigate('QuietHours')}
        colors={colors}
      />

      <Text style={[styles.sectionLabel, styles.sectionGap, { color: colors.textMuted }]}>
        Yasal
      </Text>
      <SettingsRow
        icon="document-text-outline"
        label="Gizlilik politikası"
        hint="Verilerin nerede ve nasıl tutulduğu"
        onPress={() => navigation.navigate('LegalText', { doc: 'privacy' })}
        colors={colors}
      />
      <SettingsRow
        icon="reader-outline"
        label="KVKK kapsamı"
        hint="Aydınlatma metni ve ilgili kişi hakları"
        onPress={() => navigation.navigate('LegalText', { doc: 'kvkk' })}
        colors={colors}
      />

      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.mintSoft }]}>
          <Icon name="shield-checkmark-outline" size={18} color={colors.teal} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.cardText }]}>
            Veriler cihazda
          </Text>
          <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
            Hesap veya giriş yoktur. Kayıtlar bu cihazda tutulur.
          </Text>
        </View>
      </View>
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  themeCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionGap: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 14,
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
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default Settings;
