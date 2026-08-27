import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { resolveNotificationSettings } from '../common/notifications';

export const useNotificationSettings = () => {
  const raw = useAppStore(state => state.notificationSettings);
  return useMemo(() => resolveNotificationSettings(raw), [raw]);
};
