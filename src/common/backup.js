import { resolveNotificationSettings } from './notifications';
import { normalizeHomeworkItem } from './helpers';

export const BACKUP_APP = 'famheal';
export const BACKUP_VERSION = 2;

const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const asArray = value => (Array.isArray(value) ? value : null);

export const createBackupPayload = ({
  clients,
  sessions,
  homework,
  sessionTypes,
  sessionDurations,
  notificationSettings,
  themePreference,
  counselorName,
}) => ({
  app: BACKUP_APP,
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  data: {
    clients,
    sessions,
    homework: (Array.isArray(homework) ? homework : []).map(item =>
      isObject(item) ? normalizeHomeworkItem(item) : item,
    ),
    sessionTypes,
    sessionDurations,
    notificationSettings: resolveNotificationSettings(notificationSettings),
    themePreference:
      themePreference === 'light' || themePreference === 'dark'
        ? themePreference
        : 'system',
    counselorName: String(counselorName || '').trim(),
  },
});

export const stringifyBackup = payload => `${JSON.stringify(payload, null, 2)}\n`;

export const backupFileName = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `famheal-yedek-${year}-${month}-${day}.json`;
};

export const summarizeBackup = data => ({
  clients: data.clients.length,
  sessions: data.sessions.length,
  homework: data.homework.length,
  sessionTypes: data.sessionTypes.length,
  sessionDurations: Array.isArray(data.sessionDurations)
    ? data.sessionDurations.length
    : 0,
});

export const parseBackupJson = text => {
  const raw = String(text || '').trim();
  if (!raw) {
    return { ok: false, reason: 'empty' };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'json' };
  }

  if (!isObject(parsed)) {
    return { ok: false, reason: 'shape' };
  }

  const envelope = parsed.app || parsed.data ? parsed : { data: parsed };
  if (envelope.app && envelope.app !== BACKUP_APP) {
    return { ok: false, reason: 'app' };
  }

  const data = isObject(envelope.data) ? envelope.data : envelope;
  const clients = asArray(data.clients);
  const sessions = asArray(data.sessions);
  const homework = asArray(data.homework);
  const sessionTypes = asArray(data.sessionTypes);
  const sessionDurations = asArray(data.sessionDurations) || [];

  if (!clients || !sessions || !homework || !sessionTypes) {
    return { ok: false, reason: 'shape' };
  }

  const homeworkWithFields = homework.map(item =>
    isObject(item) ? normalizeHomeworkItem(item) : item,
  );

  return {
    ok: true,
    data: {
      clients,
      sessions,
      homework: homeworkWithFields,
      sessionTypes,
      sessionDurations,
      notificationSettings: resolveNotificationSettings(data.notificationSettings),
      themePreference:
        data.themePreference === 'light' || data.themePreference === 'dark'
          ? data.themePreference
          : 'system',
      ...(Object.prototype.hasOwnProperty.call(data, 'counselorName')
        ? { counselorName: String(data.counselorName || '').trim() }
        : {}),
    },
  };
};

export const backupErrorMessage = reason => {
  switch (reason) {
    case 'empty':
      return 'Seçilen dosya boş';
    case 'json':
      return 'Dosya geçerli bir JSON değil';
    case 'app':
      return 'Bu dosya FamHeal yedeği değil';
    case 'shape':
      return 'Yedek dosyasının içeriği eksik veya bozuk';
    default:
      return 'Yedek okunamadı';
  }
};
