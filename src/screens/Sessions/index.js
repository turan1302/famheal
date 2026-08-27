import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import ThemedScreen from '../../components/ThemedScreen';
import SessionCard from '../../components/SessionCard';
import { useAppStore } from '../../store/useAppStore';
import {
  isSameDay,
  sessionDateTime,
  withResolvedStatus,
} from '../../common/helpers';

const Sessions = () => {
  const navigation = useNavigation();
  const sessions = useAppStore(state => state.sessions);
  const today = useMemo(() => new Date(), []);
  const todaySessions = useMemo(
    () =>
      sessions
        .filter(item => isSameDay(sessionDateTime(item), today))
        .sort((a, b) => sessionDateTime(a) - sessionDateTime(b))
        .map(withResolvedStatus),
    [sessions, today],
  );

  return (
    <ThemedScreen title="Bugünkü Seanslar" showBack>
      {todaySessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          onPress={() =>
            navigation.navigate('SessionDetail', { sessionId: session.id })
          }
        />
      ))}
    </ThemedScreen>
  );
};

export default Sessions;
