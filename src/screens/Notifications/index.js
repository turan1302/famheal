import { View, Text, StyleSheet } from 'react-native';
import ThemedScreen from '../../components/ThemedScreen';
import { useThemeColors } from '../../theme';
import { upcomingSessionNotifications } from '../../common/notifications';
import { useAppStore } from '../../store/useAppStore';

const Notifications = () => {
  const colors = useThemeColors();
  const sessions = useAppStore(state => state.sessions);
  const items = upcomingSessionNotifications(sessions);

  return (
    <ThemedScreen title="Bildirimler" showBack>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Yalnızca yaklaşan randevu hatırlatmaları gösterilir. Türleri ve sessiz
        saatleri Ayarlar bölümünden değiştirebilirsiniz
      </Text>
      {items.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.cardText }]}>
            Yaklaşan seans yok
          </Text>
          <Text style={[styles.body, { color: colors.cardTextMuted }]}>
            Yeni seans eklediğinizde 15 dakika önce yerel bildirim gönderilir
          </Text>
        </View>
      ) : (
        items.map(item => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.title, { color: colors.cardText }]}>
              {item.title}
            </Text>
            <Text style={[styles.body, { color: colors.cardTextMuted }]}>
              {item.dateLabel}  ·  {item.body}
            </Text>
          </View>
        ))
      )}
    </ThemedScreen>
  );
};

const styles = StyleSheet.create({
  hint: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 14,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Notifications;
