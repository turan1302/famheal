import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import { useTheme, useThemeColors } from '../../theme';
import { useNotificationSettings } from '../../hooks/useNotificationSettings';
import { formatHm } from '../../common/helpers';
import { useAppStore } from '../../store/useAppStore';
import VersionNumber from 'react-native-version-number';

const appVersionLabel = () => VersionNumber?.appVersion || '1.0.0';

const THEME_OPTIONS = [
  {
    key: 'light',
    label: 'Açık',
    icon: 'sunny-outline',
    previewBg: '#F5F9F7',
    previewText: '#1A3F3C',
    previewIcon: '#2A5F5A',
    swatches: ['#FFFFFF', '#DCEFEA', '#7EC8BD'],
  },
  {
    key: 'dark',
    label: 'Koyu',
    icon: 'moon-outline',
    previewBg: '#3E6F69',
    previewText: '#F5FBFA',
    previewIcon: '#E9F6F2',
    swatches: ['#EDF5F2', '#9FD9CF', '#2F635D'],
  },
  {
    key: 'system',
    label: 'Sistem',
    icon: 'phone-portrait-outline',
  },
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
  const resetAllData = useAppStore(state => state.resetAllData);
  const counselorName = useAppStore(state => state.counselorName);
  const updateCounselorName = useAppStore(state => state.updateCounselorName);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [name, setName] = useState(counselorName || '');

  useEffect(() => {
    setName(counselorName || '');
  }, [counselorName]);

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

  const onSaveName = () => {
    const saved = updateCounselorName(name);
    setName(saved);
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: saved ? 'Ad kaydedildi' : 'Ad kaldırıldı',
      textBody: saved || 'Ana sayfada yalnızca Merhaba görünür',
    });
  };

  return (
    <ThemedScreen title="Ayarlar">
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        Danışman
      </Text>
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
      <Pressable
        onPress={onSaveName}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: colors.quickPrimaryBg, opacity: pressed ? 0.88 : 1 },
        ]}
      >
        <Text style={[styles.saveText, { color: colors.quickPrimaryText }]}>
          Kaydet
        </Text>
      </Pressable>

      <Text style={[styles.sectionLabel, styles.sectionGap, { color: colors.textMuted }]}>
        Görünüm
      </Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map(option => {
          const selected = preference === option.key;
          const preview =
            option.key === 'system'
              ? {
                  previewBg: colors.card,
                  previewText: colors.cardText,
                  previewIcon: colors.teal,
                  swatches: [colors.background, colors.mintSoft, colors.mint],
                  iconWrap: colors.mintSoft,
                }
              : {
                  previewBg: option.previewBg,
                  previewText: option.previewText,
                  previewIcon: option.previewIcon,
                  swatches: option.swatches,
                  iconWrap: option.swatches[0],
                };
          return (
            <Pressable
              key={option.key}
              onPress={() => setPreference(option.key)}
              style={({ pressed }) => [
                styles.themeCard,
                {
                  backgroundColor: preview.previewBg,
                  borderColor: selected ? colors.mint : 'transparent',
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
            >
              <View
                style={[
                  styles.themeIconWrap,
                  { backgroundColor: preview.iconWrap },
                ]}
              >
                <Icon name={option.icon} size={18} color={preview.previewIcon} />
              </View>
              <Text style={[styles.themeLabel, { color: preview.previewText }]}>
                {option.label}
              </Text>
              <View style={styles.swatchRow}>
                {preview.swatches.map(color => (
                  <View
                    key={color}
                    style={[styles.swatch, { backgroundColor: color }]}
                  />
                ))}
              </View>
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
      <SettingsRow
        icon="time-outline"
        label="Seans süreleri"
        hint="Seans süresi seçeneklerini ekleyin veya düzenleyin"
        onPress={() => navigation.navigate('SessionDurations')}
        colors={colors}
      />
      <SettingsRow
        icon="cloud-download-outline"
        label="Veri yedekleme"
        hint="JSON olarak dışa aktarın veya geri yükleyin"
        onPress={() => navigation.navigate('DataBackup')}
        colors={colors}
      />

      {confirmClear ? (
        <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.noticeTitle, { color: colors.cardText }]}>
            Tüm veriler silinsin mi?
          </Text>
          <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
            Danışan, seans ve ödev kayıtları kaldırılır. Danışman adı silinir.
            Seans türleri varsayılana döner. Bu işlem geri alınamaz; önce JSON
            yedek alabilirsiniz
          </Text>
          <View style={styles.noticeActions}>
            <Pressable
              onPress={() => setConfirmClear(false)}
              disabled={clearing}
              style={[styles.sideBtn, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sideText, { color: colors.cardText }]}>
                Vazgeç
              </Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                if (clearing) {
                  return;
                }
                setClearing(true);
                try {
                  await resetAllData();
                  setConfirmClear(false);
                  Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Veriler silindi',
                    textBody: 'Uygulama boş kuruluma döndü',
                  });
                } catch {
                  Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: 'Silinemedi',
                    textBody: 'Kayıtlar temizlenirken bir sorun oluştu',
                  });
                } finally {
                  setClearing(false);
                }
              }}
              disabled={clearing}
              style={[
                styles.sideBtn,
                styles.flexBtn,
                { backgroundColor: colors.danger, opacity: clearing ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.sideText, { color: colors.quickPrimaryText }]}>
                Tümünü sil
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setConfirmClear(true)}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
            <Icon name="trash-outline" size={18} color={colors.danger} />
          </View>
          <View style={styles.body}>
            <Text style={[styles.label, { color: colors.danger }]}>
              Tüm verileri sil
            </Text>
            <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
              Danışan, seans ve ödevleri sıfırlar
            </Text>
          </View>
        </Pressable>
      )}

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
            Hesap veya giriş yoktur. Kayıtlar bu cihazda tutulur
          </Text>
        </View>
      </View>

      <View style={[styles.row, { backgroundColor: colors.card }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.mintSoft }]}>
          <Icon name="information-circle-outline" size={18} color={colors.teal} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.cardText }]}>Sürüm</Text>
          <Text style={[styles.hint, { color: colors.cardTextMuted }]}>
            FamHeal {appVersionLabel()}
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
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    borderWidth: 2,
    minHeight: 118,
  },
  themeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(15, 61, 58, 0.12)',
  },
  sectionGap: {
    marginTop: 8,
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 0,
    fontSize: 15,
    marginBottom: 10,
  },
  saveBtn: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
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
  notice: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
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

export default Settings;
