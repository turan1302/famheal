import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useThemeColors } from '../../theme';
import { formatSessionWhen, isClosedSessionStatus } from '../../common/helpers';
import styles from './styles';

const statusBadge = (status, colors) => {
  if (status === 'pending') {
    return {
      bg: colors.badgePendingBg,
      text: colors.badgePendingText,
      label: 'BEKLEYEN',
    };
  }
  if (status === 'upcoming') {
    return {
      bg: colors.badgeSoonBg,
      text: colors.badgeSoonText,
      label: 'YAKLAŞIYOR',
    };
  }
  if (status === 'cancelled') {
    return { bg: colors.dangerSoft, text: colors.danger, label: 'İPTAL' };
  }
  if (status === 'no_show') {
    return { bg: colors.chartSoft, text: colors.chart, label: 'GELMEDİ' };
  }
  return { bg: colors.badgeDoneBg, text: colors.badgeDoneText, label: 'TAMAMLANDI' };
};

const SessionCard = ({ session, onPress }) => {
  const colors = useThemeColors();
  const status = session.status;
  const closed = isClosedSessionStatus(status);
  const badge = statusBadge(status, colors);

  const avatarBg =
    status === 'pending'
      ? colors.mintSoft
      : status === 'upcoming'
        ? colors.tealFill
        : status === 'cancelled' || status === 'no_show'
          ? colors.dangerSoft
          : colors.chartSoft;

  const avatarColor =
    status === 'upcoming' ? colors.badgeSoonText : colors.cardText;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: closed ? colors.cardMuted : colors.card,
          opacity: pressed ? 0.88 : closed ? 0.86 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${session.name} seansı`}
    >
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.initials, { color: avatarColor }]}>
          {session.initials}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.cardText }]} numberOfLines={1}>
            {session.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Icon name="location-outline" size={13} color={colors.cardTextMuted} />
          <Text style={[styles.meta, { color: colors.cardTextMuted }]}>
            {session.type}
          </Text>
        </View>

        <Text style={[styles.time, { color: colors.cardTextMuted }]}>
          {formatSessionWhen(session)}  ·  {session.duration}
        </Text>
        {status === 'cancelled' && session.cancelReason ? (
          <Text style={[styles.time, { color: colors.cardTextMuted }]} numberOfLines={1}>
            {session.cancelReason}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

export default SessionCard;
