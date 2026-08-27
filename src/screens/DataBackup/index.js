import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import ThemedScreen from '../../components/ThemedScreen';
import { useTheme, useThemeColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  backupErrorMessage,
  backupFileName,
  createBackupPayload,
  parseBackupJson,
  stringifyBackup,
  summarizeBackup,
} from '../../common/backup';
import { pickBackupJson, shareBackupFile } from '../../common/backupShare';

const DataBackup = () => {
  const colors = useThemeColors();
  const { preference, setPreference } = useTheme();
  const clients = useAppStore(state => state.clients);
  const sessions = useAppStore(state => state.sessions);
  const homework = useAppStore(state => state.homework);
  const sessionTypes = useAppStore(state => state.sessionTypes);
  const sessionDurations = useAppStore(state => state.sessionDurations);
  const getBackupData = useAppStore(state => state.getBackupData);
  const importBackupData = useAppStore(state => state.importBackupData);

  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);

  const current = summarizeBackup({
    clients,
    sessions,
    homework,
    sessionTypes,
    sessionDurations,
  });

  const onExport = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const payload = createBackupPayload({
        ...getBackupData(),
        themePreference: preference,
      });
      const fileName = backupFileName();
      const result = await shareBackupFile(stringifyBackup(payload), fileName);
      if (result?.dismissedAction) {
        return;
      }
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Yedek kaydedildi',
        textBody: result?.savedToDownloads
          ? 'JSON dosyası İndirilenler klasörüne yazıldı.'
          : 'JSON dosyasını Dosyalar, Drive veya e-posta ile saklayın.',
      });
    } catch (error) {
      const message = String(error?.message || error?.error || '');
      if (
        /cancel|did not share|ECANCELLED/i.test(message)
      ) {
        return;
      }
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Dışa aktarılamadı',
        textBody: 'JSON dosyası oluşturulamadı. Lütfen tekrar deneyin.',
      });
    } finally {
      setBusy(false);
    }
  };

  const onPickImport = async () => {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      const picked = await pickBackupJson();
      if (!picked.ok) {
        if (!picked.cancelled) {
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Dosya okunamadı',
            textBody: picked.empty
              ? 'Seçilen dosya boş. Yeni bir JSON yedek alın ve onu seçin.'
              : 'JSON yedek dosyasını Dosyalar uygulamasından tekrar seçin.',
          });
        }
        return;
      }

      const parsed = parseBackupJson(picked.text);
      if (!parsed.ok) {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'Geçersiz yedek',
          textBody: backupErrorMessage(parsed.reason),
        });
        return;
      }

      setPending(parsed.data);
    } finally {
      setBusy(false);
    }
  };

  const onConfirmImport = async () => {
    if (!pending || busy) {
      return;
    }
    const nextTheme = pending.themePreference;
    setBusy(true);
    await new Promise(resolve => setTimeout(resolve, 50));
    try {
      await importBackupData(pending);
      setPending(null);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Yedek içe aktarıldı',
        textBody: 'Danışan, seans ve ödev kayıtları geri yüklendi.',
      });
      if (nextTheme && nextTheme !== preference) {
        setTimeout(() => {
          setPreference(nextTheme);
        }, 0);
      }
    } catch {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'İçe aktarılamadı',
        textBody: 'Yedek uygulanırken bir sorun oluştu.',
      });
    } finally {
      setBusy(false);
    }
  };

  const pendingSummary = pending ? summarizeBackup(pending) : null;

  return (
    <ThemedScreen title="Veri yedekleme" showBack padTabBar={false}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Uygulamayı silip yeniden yüklerseniz kayıtlar kaybolur. JSON yedeğini
        telefonunuza, iCloud’a veya Drive’a kaydedip sonra içe aktarabilirsiniz.
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.cardText }]}>
          Bu cihazdaki veriler
        </Text>
        <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
          {current.clients} danışan · {current.sessions} seans · {current.homework}{' '}
          ödev · {current.sessionTypes} seans türü · {current.sessionDurations} süre
        </Text>
      </View>

      <Pressable
        onPress={onExport}
        disabled={busy}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.quickPrimaryBg,
            opacity: busy ? 0.7 : pressed ? 0.88 : 1,
          },
        ]}
      >
        <Icon name="download-outline" size={18} color={colors.quickPrimaryText} />
        <Text style={[styles.buttonText, { color: colors.quickPrimaryText }]}>
          JSON olarak dışa aktar
        </Text>
      </Pressable>

      <Pressable
        onPress={onPickImport}
        disabled={busy}
        style={({ pressed }) => [
          styles.button,
          styles.secondary,
          {
            backgroundColor: colors.card,
            opacity: busy ? 0.7 : pressed ? 0.88 : 1,
          },
        ]}
      >
        <Icon name="folder-open-outline" size={18} color={colors.cardText} />
        <Text style={[styles.buttonText, { color: colors.cardText }]}>
          JSON içe aktar
        </Text>
      </Pressable>

      {pending && pendingSummary ? (
        <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.noticeTitle, { color: colors.cardText }]}>
            Mevcut verilerin üzerine yazılsın mı?
          </Text>
          <Text style={[styles.noticeBody, { color: colors.cardTextMuted }]}>
            Bu yedek {pendingSummary.clients} danışan, {pendingSummary.sessions}{' '}
            seans ve {pendingSummary.homework} ödev içeriyor. Şu anki kayıtlar
            değişecek.
          </Text>
          <View style={styles.noticeActions}>
            <Pressable
              onPress={() => setPending(null)}
              disabled={busy}
              style={[styles.sideBtn, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.sideText, { color: colors.cardText }]}>
                Vazgeç
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirmImport}
              disabled={busy}
              style={[
                styles.sideBtn,
                styles.flexBtn,
                { backgroundColor: colors.danger },
              ]}
            >
              <Text style={[styles.sideText, { color: colors.quickPrimaryText }]}>
                {busy ? 'Yazılıyor...' : 'Üzerine yaz'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Yedek yalnızca bu uygulamadaki danışan, seans, ödev, seans türü,
        bildirim ve görünüm ayarlarını içerir. Dosyayı güvenli bir yerde tutun.
      </Text>
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
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  button: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  secondary: {
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
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
  hint: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});

export default DataBackup;
