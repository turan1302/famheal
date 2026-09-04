import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../theme';
import {
  formatSessionWhen,
  formatShortDate,
  homeworkProgressLabel,
} from '../../common/helpers';

const SessionPrepCard = ({ summary, onOpenHomework }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  if (!summary) {
    return null;
  }

  const lastNotes = String(summary.lastNotesSession?.notes || '').trim();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.kicker, { color: colors.cardTextMuted }]}>
        Seans öncesi özet
      </Text>

      {summary.empty ? (
        <Text style={[styles.empty, { color: colors.cardTextMuted }]}>
          Bu danışan için henüz seans veya açık ödev yok
        </Text>
      ) : null}

      {summary.lastSession ? (
        <Pressable
          onPress={() =>
            navigation.navigate('SessionDetail', {
              sessionId: summary.lastSession.id,
            })
          }
          style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
        >
          <Text style={[styles.label, { color: colors.cardTextMuted }]}>
            Son seans
          </Text>
          <Text style={[styles.value, { color: colors.cardText }]}>
            {formatSessionWhen(summary.lastSession)} · {summary.lastSession.type}
          </Text>
        </Pressable>
      ) : null}

      {lastNotes ? (
        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.cardTextMuted }]}>
            Son not
          </Text>
          <Text
            style={[styles.notes, { color: colors.cardText }]}
            numberOfLines={4}
          >
            {lastNotes}
          </Text>
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={[styles.label, { color: colors.cardTextMuted }]}>
          Açık ödevler
        </Text>
        {summary.openHomework.length === 0 ? (
          <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
            Açık ödev yok
          </Text>
        ) : (
          summary.openHomework.slice(0, 4).map(item => (
            <Pressable
              key={item.id}
              onPress={() =>
                onOpenHomework
                  ? onOpenHomework(item)
                  : navigation.navigate('NewHomework', { homeworkId: item.id })
              }
              style={({ pressed }) => [
                styles.hwRow,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text
                style={[styles.hwTitle, { color: colors.cardText }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
                {homeworkProgressLabel(item.progress)} · Teslim{' '}
                {formatShortDate(new Date(item.due))}
              </Text>
            </Pressable>
          ))
        )}
        {summary.openHomework.length > 4 ? (
          <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
            +{summary.openHomework.length - 4} ödev daha
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  block: {
    marginTop: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
  },
  hwRow: {
    paddingVertical: 6,
  },
  hwTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default SessionPrepCard;
