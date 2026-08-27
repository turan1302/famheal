import notifee, {
  AndroidImportance,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import {
  reminderDateTime,
  sessionDateTime,
  shiftOutOfQuietHours,
  formatShortDate,
  isClosedSessionStatus,
} from './helpers';

const CHANNEL_ID = 'famheal-sessions';

const iosNotification = {
  sound: 'default',
  foregroundPresentationOptions: {
    badge: true,
    sound: true,
    banner: true,
    list: true,
  },
};

const timestampTrigger = timestamp => ({
  type: TriggerType.TIMESTAMP,
  timestamp,
  ...(Platform.OS === 'android' ? { alarmManager: { allowWhileIdle: true } } : {}),
});

export const DEFAULT_NOTIFICATION_SETTINGS = {
  types: {
    session: true,
    homework: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export const resolveNotificationSettings = settings => ({
  types: {
    session: settings?.types?.session !== false,
    homework: settings?.types?.homework !== false,
  },
  quietHours: {
    enabled: Boolean(settings?.quietHours?.enabled),
    start: settings?.quietHours?.start || '22:00',
    end: settings?.quietHours?.end || '08:00',
  },
});

const applyQuietHours = (date, prefs) => {
  if (!prefs.quietHours.enabled) {
    return date;
  }
  return shiftOutOfQuietHours(
    date,
    prefs.quietHours.start,
    prefs.quietHours.end,
  );
};

let setupPromise = null;

export async function ensureNotificationSetup() {
  if (!setupPromise) {
    setupPromise = (async () => {
      try {
        await notifee.requestPermission({
          alert: true,
          sound: true,
          badge: true,
        });

        if (Platform.OS === 'android') {
          await notifee.createChannel({
            id: CHANNEL_ID,
            name: 'FamHeal hatırlatmaları',
            importance: AndroidImportance.HIGH,
            vibration: true,
          });
        }
      } catch {
        // permission denied or native module unavailable
      }
    })();
  }
  await setupPromise;
}

export async function cancelSessionReminder(sessionId) {
  try {
    await notifee.cancelNotification(`session-${sessionId}`);
  } catch {
    // ignore missing notification
  }
}

export async function cancelHomeworkReminder(homeworkId) {
  try {
    await notifee.cancelNotification(`homework-${homeworkId}`);
  } catch {
    // ignore missing notification
  }
}

export async function scheduleSessionReminder(session, settings, options = {}) {
  const prefs = resolveNotificationSettings(settings);
  const skipCancel = Boolean(options.skipCancel);
  const skipSetup = Boolean(options.skipSetup);
  try {
    if (!prefs.types.session || isClosedSessionStatus(session?.status)) {
      if (!skipCancel) {
        await cancelSessionReminder(session.id);
      }
      return false;
    }

    const sessionAt = sessionDateTime(session);
    let reminderAt = applyQuietHours(reminderDateTime(session), prefs);
    if (reminderAt.getTime() >= sessionAt.getTime()) {
      if (!skipCancel) {
        await cancelSessionReminder(session.id);
      }
      return false;
    }
    if (reminderAt.getTime() <= Date.now()) {
      return false;
    }

    if (!skipSetup) {
      await ensureNotificationSetup();
    }
    if (!skipCancel) {
      await cancelSessionReminder(session.id);
    }

    await notifee.createTriggerNotification(
      {
        id: `session-${session.id}`,
        title: 'Seans yaklaşıyor',
        body: `${session.name} · ${formatShortDate(sessionDateTime(session))} · ${session.time} · ${session.type}`,
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
        ios: iosNotification,
      },
      timestampTrigger(reminderAt.getTime()),
    );

    return true;
  } catch {
    return false;
  }
}

export async function scheduleHomeworkReminder(item, settings, options = {}) {
  const prefs = resolveNotificationSettings(settings);
  const skipCancel = Boolean(options.skipCancel);
  const skipSetup = Boolean(options.skipSetup);
  try {
    if (!prefs.types.homework || !item?.due) {
      if (!skipCancel) {
        await cancelHomeworkReminder(item.id);
      }
      return false;
    }

    const due = new Date(item.due);
    let reminderAt = new Date(due);
    reminderAt.setHours(9, 0, 0, 0);
    reminderAt = applyQuietHours(reminderAt, prefs);

    if (reminderAt.getTime() <= Date.now()) {
      if (!skipCancel) {
        await cancelHomeworkReminder(item.id);
      }
      return false;
    }

    if (!skipSetup) {
      await ensureNotificationSetup();
    }
    if (!skipCancel) {
      await cancelHomeworkReminder(item.id);
    }

    await notifee.createTriggerNotification(
      {
        id: `homework-${item.id}`,
        title: 'Ödev teslim günü',
        body: `${item.client || 'Danışan'} · ${item.title} · ${formatShortDate(due)}`,
        android: {
          channelId: CHANNEL_ID,
          pressAction: { id: 'default' },
        },
        ios: iosNotification,
      },
      timestampTrigger(reminderAt.getTime()),
    );

    return true;
  } catch {
    return false;
  }
}

const SCHEDULE_CHUNK = 6;

const runInChunks = async jobs => {
  for (let index = 0; index < jobs.length; index += SCHEDULE_CHUNK) {
    await Promise.allSettled(
      jobs.slice(index, index + SCHEDULE_CHUNK).map(job => job()),
    );
    if (index + SCHEDULE_CHUNK < jobs.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
};

export async function scheduleUpcomingSessionReminders(sessions = [], settings) {
  try {
    await ensureNotificationSetup();
    await runInChunks(
      sessions.map(
        session => () =>
          scheduleSessionReminder(session, settings, {
            skipSetup: true,
            skipCancel: true,
          }),
      ),
    );
  } catch {
    // native module or permission missing
  }
}

export async function scheduleUpcomingHomeworkReminders(
  homework = [],
  settings,
) {
  try {
    await ensureNotificationSetup();
    await runInChunks(
      homework.map(
        item => () =>
          scheduleHomeworkReminder(item, settings, {
            skipSetup: true,
            skipCancel: true,
          }),
      ),
    );
  } catch {
    // native module or permission missing
  }
}

export async function cancelAllReminders() {
  try {
    await notifee.cancelAllNotifications();
  } catch {
    // native module unavailable
  }
}

export async function scheduleAllReminders(
  sessions = [],
  homework = [],
  settings,
) {
  await scheduleUpcomingSessionReminders(sessions, settings);
  await scheduleUpcomingHomeworkReminders(homework, settings);
}

export function upcomingSessionNotifications(sessions = []) {
  return sessions
    .filter(session => !isClosedSessionStatus(session.status))
    .map(session => ({
      id: session.id,
      title: `${session.time} seansı yaklaşıyor`,
      body: `${session.name} · ${session.type}`,
      dateLabel: formatShortDate(sessionDateTime(session)),
      at: sessionDateTime(session),
    }))
    .filter(item => item.at.getTime() > Date.now() - 60 * 60 * 1000)
    .sort((a, b) => a.at - b.at);
}
