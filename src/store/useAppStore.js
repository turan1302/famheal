import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SESSION_TYPES } from '../common/mockData';
import { STORAGE_KEYS } from '../common/storageKeys';
import { getInitials, padTime, resolveSessionStatus, isClosedSessionStatus, formatDurationLabel, normalizeSessionDurations, DEFAULT_SESSION_DURATIONS } from '../common/helpers';
import {
  cancelAllReminders,
  cancelHomeworkReminder,
  cancelSessionReminder,
  DEFAULT_NOTIFICATION_SETTINGS,
  resolveNotificationSettings,
  scheduleAllReminders,
  scheduleHomeworkReminder,
  scheduleSessionReminder,
} from '../common/notifications';

const nextId = prefix => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const sanitizeRelations = (clients = [], sessions = [], homework = []) => {
  const clientList = Array.isArray(clients) ? clients : [];
  const sessionList = Array.isArray(sessions) ? sessions : [];
  const homeworkList = Array.isArray(homework) ? homework : [];
  const clientIds = new Set(clientList.map(item => item.id));
  const nextSessions = sessionList.filter(item => clientIds.has(item.clientId));
  const sessionIds = new Set(nextSessions.map(item => item.id));
  const nextHomework = homeworkList
    .filter(item => clientIds.has(item.clientId))
    .map(item =>
      !item.sessionId || sessionIds.has(item.sessionId)
        ? item
        : { ...item, sessionId: '' },
    );
  return {
    clients: clientList,
    sessions: nextSessions,
    homework: nextHomework,
  };
};

const clientAccent = index => (index % 2 === 0 ? 'mint' : 'teal');

export const useAppStore = create(
  persist(
    (set, get) => ({
      clients: [],
      sessions: [],
      homework: [],
      sessionTypes: SESSION_TYPES,
      sessionDurations: DEFAULT_SESSION_DURATIONS,
      notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
      counselorName: '',

      addClient: payload => {
        const client = {
          id: nextId('c'),
          name: payload.name.trim(),
          initials: getInitials(payload.name),
          type: payload.type?.trim() || get().sessionTypes[0]?.name || 'Seans',
          phone: payload.phone?.trim() || '',
          accent: clientAccent(get().clients.length),
        };
        set(state => ({ clients: [client, ...state.clients] }));
        return client;
      },

      updateClient: (id, payload) => {
        const name = payload.name.trim();
        const initials = getInitials(name);
        const type =
          payload.type?.trim() ||
          get().sessionTypes[0]?.name ||
          'Seans';
        const phone = payload.phone?.trim() || '';

        set(state => ({
          clients: state.clients.map(item =>
            item.id === id ? { ...item, name, initials, type, phone } : item,
          ),
          sessions: state.sessions.map(item =>
            item.clientId === id ? { ...item, name, initials } : item,
          ),
          homework: state.homework.map(item =>
            item.clientId === id ? { ...item, client: name } : item,
          ),
        }));
      },

      deleteClient: id => {
        const current = get().clients.find(item => item.id === id);
        if (!current) {
          return { ok: false, reason: 'missing' };
        }

        const relatedSessions = get().sessions.filter(
          item => item.clientId === id,
        );
        const sessionIds = new Set(relatedSessions.map(item => item.id));
        const relatedHomework = get().homework.filter(
          item => item.clientId === id || sessionIds.has(item.sessionId),
        );

        relatedSessions.forEach(item => cancelSessionReminder(item.id));
        relatedHomework.forEach(item => cancelHomeworkReminder(item.id));

        set(state => ({
          clients: state.clients.filter(item => item.id !== id),
          sessions: state.sessions.filter(item => item.clientId !== id),
          homework: state.homework.filter(
            item => item.clientId !== id && !sessionIds.has(item.sessionId),
          ),
        }));

        return {
          ok: true,
          item: current,
          sessionsCount: relatedSessions.length,
          homeworkCount: relatedHomework.length,
        };
      },

      addSession: payload => {
        const client = get().clients.find(item => item.id === payload.clientId);
        const date = payload.date instanceof Date ? payload.date : new Date(payload.date);
        const session = {
          id: nextId('s'),
          clientId: payload.clientId,
          name: client?.name || payload.name || 'Danışan',
          initials: client?.initials || getInitials(payload.name),
          type: payload.type || client?.type || 'Seans',
          time: padTime(date),
          date: date.toISOString(),
          duration:
            payload.duration ||
            formatDurationLabel(get().sessionDurations[0]?.minutes) ||
            '50 dk',
          notes: payload.notes?.trim() || '',
          status: 'upcoming',
          cancelReason: '',
        };
        session.status = resolveSessionStatus(session);
        set(state => ({ sessions: [session, ...state.sessions] }));
        scheduleSessionReminder(session, get().notificationSettings);
        return session;
      },

      updateSession: (id, payload) => {
        const current = get().sessions.find(item => item.id === id);
        if (!current) return null;

        const client = get().clients.find(
          item => item.id === (payload.clientId || current.clientId),
        );
        const date = payload.date
          ? payload.date instanceof Date
            ? payload.date
            : new Date(payload.date)
          : new Date();

        const session = {
          ...current,
          clientId: payload.clientId || current.clientId,
          name: client?.name || current.name,
          initials: client?.initials || current.initials,
          type: payload.type || current.type,
          time: payload.date ? padTime(date) : current.time,
          date: payload.date ? date.toISOString() : current.date,
          duration: payload.duration || current.duration,
          notes:
            payload.notes !== undefined ? payload.notes.trim() : current.notes,
          status: payload.status || current.status,
          cancelReason:
            payload.cancelReason !== undefined
              ? String(payload.cancelReason || '').trim()
              : current.cancelReason || '',
        };

        if (!isClosedSessionStatus(session.status)) {
          session.status = resolveSessionStatus(session);
        }
        if (session.status !== 'cancelled') {
          session.cancelReason = '';
        }

        set(state => ({
          sessions: state.sessions.map(item => (item.id === id ? session : item)),
        }));
        if (isClosedSessionStatus(session.status)) {
          cancelSessionReminder(id);
        } else {
          scheduleSessionReminder(session, get().notificationSettings);
        }
        return session;
      },

      completeSession: id => get().setSessionStatus(id, { status: 'completed' }),

      setSessionStatus: (id, payload) => {
        const current = get().sessions.find(item => item.id === id);
        if (!current) {
          return null;
        }

        const requested = payload.status || current.status;
        const session = {
          ...current,
          status: requested,
          cancelReason:
            requested === 'cancelled'
              ? String(
                  payload.cancelReason !== undefined
                    ? payload.cancelReason
                    : current.cancelReason || '',
                ).trim()
              : '',
        };

        if (!isClosedSessionStatus(session.status)) {
          session.status = resolveSessionStatus({
            ...session,
            status: 'upcoming',
          });
        }

        set(state => ({
          sessions: state.sessions.map(item => (item.id === id ? session : item)),
        }));

        if (isClosedSessionStatus(session.status)) {
          cancelSessionReminder(id);
        } else {
          scheduleSessionReminder(session, get().notificationSettings);
        }
        return session;
      },

      deleteSession: id => {
        const current = get().sessions.find(item => item.id === id);
        if (!current) {
          return { ok: false, reason: 'missing' };
        }

        const homeworkCount = get().homework.filter(
          item => item.sessionId === id,
        ).length;
        cancelSessionReminder(id);
        set(state => ({
          sessions: state.sessions.filter(item => item.id !== id),
          homework: state.homework.map(item =>
            item.sessionId === id ? { ...item, sessionId: '' } : item,
          ),
        }));

        return { ok: true, item: current, homeworkCount };
      },

      addHomework: payload => {
        const client = get().clients.find(item => item.id === payload.clientId);
        const session = get().sessions.find(item => item.id === payload.sessionId);
        const item = {
          id: nextId('h'),
          title: payload.title.trim(),
          clientId: payload.clientId || session?.clientId || '',
          client: client?.name || session?.name || payload.client || '',
          sessionId: payload.sessionId || '',
          due: payload.due
            ? new Date(payload.due).toISOString()
            : new Date().toISOString(),
          notes: payload.notes?.trim() || '',
        };
        set(state => ({ homework: [item, ...state.homework] }));
        scheduleHomeworkReminder(item, get().notificationSettings);
        return item;
      },

      updateHomework: (id, payload) => {
        const client = get().clients.find(item => item.id === payload.clientId);
        const session = get().sessions.find(item => item.id === payload.sessionId);

        set(state => ({
          homework: state.homework.map(item =>
            item.id === id
              ? {
                  ...item,
                  title: payload.title.trim(),
                  clientId: payload.clientId || item.clientId,
                  client:
                    client?.name ||
                    session?.name ||
                    payload.client ||
                    item.client,
                  sessionId:
                    payload.sessionId !== undefined
                      ? payload.sessionId
                      : item.sessionId,
                  due: payload.due
                    ? new Date(payload.due).toISOString()
                    : item.due,
                  notes:
                    payload.notes !== undefined
                      ? payload.notes.trim()
                      : item.notes,
                }
              : item,
          ),
        }));
        const updated = get().homework.find(item => item.id === id);
        if (updated) {
          scheduleHomeworkReminder(updated, get().notificationSettings);
        }
      },

      deleteHomework: id => {
        const current = get().homework.find(item => item.id === id);
        if (!current) {
          return { ok: false, reason: 'missing' };
        }
        set(state => ({
          homework: state.homework.filter(item => item.id !== id),
        }));
        cancelHomeworkReminder(id);
        return { ok: true, item: current };
      },

      addSessionType: name => {
        const nextName = String(name || '').trim();
        if (!nextName) {
          return { ok: false, reason: 'empty' };
        }
        const exists = get().sessionTypes.some(
          item => item.name.toLowerCase() === nextName.toLowerCase(),
        );
        if (exists) {
          return { ok: false, reason: 'duplicate' };
        }
        const item = { id: nextId('t'), name: nextName };
        set(state => ({ sessionTypes: [...state.sessionTypes, item] }));
        return { ok: true, item };
      },

      updateSessionType: (id, name) => {
        const current = get().sessionTypes.find(item => item.id === id);
        const nextName = String(name || '').trim();
        if (!current || !nextName) {
          return { ok: false, reason: 'empty' };
        }
        const exists = get().sessionTypes.some(
          item =>
            item.id !== id && item.name.toLowerCase() === nextName.toLowerCase(),
        );
        if (exists) {
          return { ok: false, reason: 'duplicate' };
        }

        const sessionsCount = get().sessions.filter(
          item => item.type === current.name,
        ).length;
        const clientsCount = get().clients.filter(
          item => item.type === current.name,
        ).length;

        set(state => ({
          sessionTypes: state.sessionTypes.map(item =>
            item.id === id ? { ...item, name: nextName } : item,
          ),
          sessions: state.sessions.map(item =>
            item.type === current.name ? { ...item, type: nextName } : item,
          ),
          clients: state.clients.map(item =>
            item.type === current.name ? { ...item, type: nextName } : item,
          ),
        }));

        return {
          ok: true,
          sessionsCount,
          clientsCount,
          name: nextName,
        };
      },

      getSessionTypeUsage: id => {
        const current = get().sessionTypes.find(item => item.id === id);
        if (!current) {
          return { type: null, sessionsCount: 0, clientsCount: 0 };
        }
        return {
          type: current,
          sessionsCount: get().sessions.filter(
            item => item.type === current.name,
          ).length,
          clientsCount: get().clients.filter(item => item.type === current.name)
            .length,
        };
      },

      deleteSessionType: (id, replacementId) => {
        const current = get().sessionTypes.find(item => item.id === id);
        if (!current) {
          return { ok: false, reason: 'missing' };
        }
        if (get().sessionTypes.length <= 1) {
          return { ok: false, reason: 'last' };
        }

        const sessionsCount = get().sessions.filter(
          item => item.type === current.name,
        ).length;
        const clientsCount = get().clients.filter(
          item => item.type === current.name,
        ).length;
        const hasRecords = sessionsCount + clientsCount > 0;

        if (hasRecords) {
          const replacement = get().sessionTypes.find(
            item => item.id === replacementId,
          );
          if (!replacement || replacement.id === id) {
            return { ok: false, reason: 'replacement' };
          }

          set(state => ({
            sessionTypes: state.sessionTypes.filter(item => item.id !== id),
            sessions: state.sessions.map(item =>
              item.type === current.name
                ? { ...item, type: replacement.name }
                : item,
            ),
            clients: state.clients.map(item =>
              item.type === current.name
                ? { ...item, type: replacement.name }
                : item,
            ),
          }));

          return {
            ok: true,
            migrated: true,
            sessionsCount,
            clientsCount,
            from: current.name,
            to: replacement.name,
          };
        }

        set(state => ({
          sessionTypes: state.sessionTypes.filter(item => item.id !== id),
        }));
        return { ok: true, migrated: false };
      },

      addSessionDuration: minutes => {
        const value = Number(minutes);
        if (!value || value < 1) {
          return { ok: false, reason: 'empty' };
        }
        const exists = get().sessionDurations.some(item => item.minutes === value);
        if (exists) {
          return { ok: false, reason: 'duplicate' };
        }
        const item = { id: nextId('d'), minutes: value };
        set(state => ({
          sessionDurations: normalizeSessionDurations([
            ...state.sessionDurations,
            item,
          ]),
        }));
        return { ok: true, item };
      },

      updateSessionDuration: (id, minutes) => {
        const current = get().sessionDurations.find(item => item.id === id);
        const value = Number(minutes);
        if (!current || !value || value < 1) {
          return { ok: false, reason: 'empty' };
        }
        const exists = get().sessionDurations.some(
          item => item.id !== id && item.minutes === value,
        );
        if (exists) {
          return { ok: false, reason: 'duplicate' };
        }

        const fromLabel = formatDurationLabel(current.minutes);
        const toLabel = formatDurationLabel(value);
        const sessionsCount = get().sessions.filter(
          item => item.duration === fromLabel,
        ).length;

        set(state => ({
          sessionDurations: normalizeSessionDurations(
            state.sessionDurations.map(item =>
              item.id === id ? { ...item, minutes: value } : item,
            ),
          ),
          sessions: state.sessions.map(item =>
            item.duration === fromLabel ? { ...item, duration: toLabel } : item,
          ),
        }));

        return {
          ok: true,
          sessionsCount,
          name: toLabel,
        };
      },

      deleteSessionDuration: (id, replacementId) => {
        const current = get().sessionDurations.find(item => item.id === id);
        if (!current) {
          return { ok: false, reason: 'missing' };
        }
        if (get().sessionDurations.length <= 1) {
          return { ok: false, reason: 'last' };
        }

        const fromLabel = formatDurationLabel(current.minutes);
        const sessionsCount = get().sessions.filter(
          item => item.duration === fromLabel,
        ).length;

        if (sessionsCount > 0) {
          const replacement = get().sessionDurations.find(
            item => item.id === replacementId,
          );
          if (!replacement || replacement.id === id) {
            return { ok: false, reason: 'replacement' };
          }

          const toLabel = formatDurationLabel(replacement.minutes);
          set(state => ({
            sessionDurations: state.sessionDurations.filter(
              item => item.id !== id,
            ),
            sessions: state.sessions.map(item =>
              item.duration === fromLabel
                ? { ...item, duration: toLabel }
                : item,
            ),
          }));

          return {
            ok: true,
            migrated: true,
            sessionsCount,
            from: fromLabel,
            to: toLabel,
          };
        }

        set(state => ({
          sessionDurations: state.sessionDurations.filter(item => item.id !== id),
        }));
        return { ok: true, migrated: false };
      },

      updateCounselorName: name => {
        const counselorName = String(name || '').trim();
        set({ counselorName });
        return counselorName;
      },

      updateNotificationSettings: patch => {
        const current = resolveNotificationSettings(get().notificationSettings);
        const next = {
          types: { ...current.types, ...patch.types },
          quietHours: { ...current.quietHours, ...patch.quietHours },
        };
        set({ notificationSettings: next });
        return next;
      },

      getBackupData: () => {
        const state = get();
        return {
          clients: state.clients,
          sessions: state.sessions,
          homework: state.homework,
          sessionTypes: state.sessionTypes,
          sessionDurations: state.sessionDurations,
          notificationSettings: state.notificationSettings,
          counselorName: state.counselorName || '',
        };
      },

      importBackupData: async payload => {
        const notificationSettings = resolveNotificationSettings(
          payload.notificationSettings,
        );
        const sessionTypes =
          payload.sessionTypes?.length > 0
            ? payload.sessionTypes
            : get().sessionTypes;
        const sessionDurations = normalizeSessionDurations(
          payload.sessionDurations?.length
            ? payload.sessionDurations
            : get().sessionDurations,
        );
        const cleaned = sanitizeRelations(
          payload.clients,
          payload.sessions,
          payload.homework,
        );
        const counselorName =
          payload.counselorName !== undefined
            ? String(payload.counselorName || '').trim()
            : get().counselorName || '';

        set({
          clients: cleaned.clients,
          sessions: cleaned.sessions,
          homework: cleaned.homework,
          sessionTypes,
          sessionDurations,
          notificationSettings,
          counselorName,
        });

        const state = get();
        Promise.resolve()
          .then(() => cancelAllReminders())
          .then(() =>
            scheduleAllReminders(
              state.sessions,
              state.homework,
              state.notificationSettings,
            ),
          )
          .catch(() => {});
        return state;
      },

      resetAllData: async () => {
        await cancelAllReminders();
        set({
          clients: [],
          sessions: [],
          homework: [],
          sessionTypes: SESSION_TYPES,
          sessionDurations: DEFAULT_SESSION_DURATIONS,
          notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
          counselorName: '',
        });
      },
    }),
    {
      name: STORAGE_KEYS.APP_DATA,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        clients: state.clients,
        sessions: state.sessions,
        homework: state.homework,
        sessionTypes: state.sessionTypes,
        sessionDurations: state.sessionDurations,
        notificationSettings: state.notificationSettings,
        counselorName: state.counselorName || '',
      }),
      merge: (persisted, current) => {
        const next = {
          ...current,
          ...(persisted || {}),
          sessionTypes:
            persisted?.sessionTypes?.length > 0
              ? persisted.sessionTypes
              : current.sessionTypes,
          sessionDurations: normalizeSessionDurations(
            persisted?.sessionDurations,
          ),
          notificationSettings: resolveNotificationSettings(
            persisted?.notificationSettings,
          ),
          counselorName: String(
            persisted?.counselorName ?? current.counselorName ?? '',
          ).trim(),
        };
        const cleaned = sanitizeRelations(
          next.clients,
          next.sessions,
          next.homework,
        );
        return { ...next, ...cleaned };
      },
    },
  ),
);
