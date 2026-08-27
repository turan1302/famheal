export const getInitials = name =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || '??';

export const sessionDateTime = session => {
  const base = session?.date ? new Date(session.date) : new Date();
  const [hours, minutes] = String(session?.time || '00:00')
    .split(':')
    .map(part => Number(part) || 0);
  const value = new Date(base);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

export const reminderDateTime = (session, minutesBefore = 15) =>
  new Date(sessionDateTime(session).getTime() - minutesBefore * 60 * 1000);

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const isSameYear = (a, b) => a.getFullYear() === b.getFullYear();

export const dateKey = value => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const startOfDay = value => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const homeworkStatus = (item, now = new Date()) => {
  const due = startOfDay(item?.due);
  const today = startOfDay(now);
  if (due.getTime() < today.getTime()) {
    return 'overdue';
  }
  if (due.getTime() === today.getTime()) {
    return 'today';
  }
  return 'upcoming';
};

export const formatDate = value =>
  value.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatShortDate = value =>
  value.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatTime = value =>
  value.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

export const CLOSED_SESSION_STATUSES = ['completed', 'cancelled', 'no_show'];

export const isClosedSessionStatus = status =>
  CLOSED_SESSION_STATUSES.includes(status);

export const SESSION_STATUS_OPTIONS = [
  { key: 'upcoming', label: 'Planlandı' },
  { key: 'completed', label: 'Tamamlandı' },
  { key: 'no_show', label: 'Gelmedi' },
  { key: 'cancelled', label: 'İptal' },
];

export const resolveSessionStatus = session => {
  if (isClosedSessionStatus(session?.status)) {
    return session.status;
  }

  const diff = sessionDateTime(session).getTime() - Date.now();
  if (diff <= 90 * 60 * 1000) {
    return 'pending';
  }
  return 'upcoming';
};

export const withResolvedStatus = session => ({
  ...session,
  status: resolveSessionStatus(session),
});

export const formatSessionWhen = session => {
  const date = sessionDateTime(session);
  return `${formatShortDate(date)}  ·  ${formatTime(date)}`;
};

export const sessionStatusLabel = status => {
  if (status === 'pending') {
    return 'Bekleyen';
  }
  const option = SESSION_STATUS_OPTIONS.find(item => item.key === status);
  return option?.label || 'Planlandı';
};

export const padTime = date => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const parseHm = value => {
  const [hours, minutes] = String(value || '00:00')
    .split(':')
    .map(part => Number(part) || 0);
  return { hours, minutes };
};

export const dateFromHm = value => {
  const { hours, minutes } = parseHm(value);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatHm = value => formatTime(dateFromHm(value));

export const isInQuietHours = (date, start, end) => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const startM = parseHm(start).hours * 60 + parseHm(start).minutes;
  const endM = parseHm(end).hours * 60 + parseHm(end).minutes;
  if (startM === endM) {
    return false;
  }
  if (startM < endM) {
    return minutes >= startM && minutes < endM;
  }
  return minutes >= startM || minutes < endM;
};

export const shiftOutOfQuietHours = (date, start, end) => {
  if (!isInQuietHours(date, start, end)) {
    return date;
  }
  const { hours, minutes } = parseHm(end);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= date.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
};

export const parseDurationMinutes = value => {
  const minutes = Number(String(value ?? '').replace(/[^\d]/g, ''));
  return minutes > 0 ? minutes : 0;
};

export const formatDurationLabel = minutes => {
  const value = parseDurationMinutes(minutes);
  return value ? `${value} dk` : '';
};

export const DEFAULT_SESSION_DURATIONS = [
  { id: 'd1', minutes: 50 },
  { id: 'd2', minutes: 60 },
  { id: 'd3', minutes: 90 },
];

export const normalizeSessionDurations = list => {
  if (!Array.isArray(list) || list.length === 0) {
    return DEFAULT_SESSION_DURATIONS;
  }

  const seen = new Set();
  const items = [];
  list.forEach((item, index) => {
    const minutes = parseDurationMinutes(
      item && typeof item === 'object' ? item.minutes ?? item.name : item,
    );
    if (!minutes || seen.has(minutes)) {
      return;
    }
    seen.add(minutes);
    items.push({
      id: item?.id || `d-${minutes}-${index}`,
      minutes,
    });
  });

  return items.length
    ? items.sort((a, b) => a.minutes - b.minutes)
    : DEFAULT_SESSION_DURATIONS;
};

export const matchesQuery = (value, query) => {
  const q = String(query || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  if (!q) {
    return true;
  }
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '');
  return normalized.includes(q);
};
