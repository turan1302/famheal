import { NativeModules, Platform } from 'react-native';
import Share from 'react-native-share';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';

const utf8ToBase64 = value => {
  const binary = unescape(encodeURIComponent(value));
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(binary);
  }

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let i = 0; i < binary.length; i += 3) {
    const c1 = binary.charCodeAt(i);
    const c2 = i + 1 < binary.length ? binary.charCodeAt(i + 1) : NaN;
    const c3 = i + 2 < binary.length ? binary.charCodeAt(i + 2) : NaN;
    output += chars.charAt(c1 >> 2);
    output += chars.charAt(((c1 & 3) << 4) | (Number.isNaN(c2) ? 0 : c2 >> 4));
    output += Number.isNaN(c2)
      ? '='
      : chars.charAt(((c2 & 15) << 2) | (Number.isNaN(c3) ? 0 : c3 >> 6));
    output += Number.isNaN(c3) ? '=' : chars.charAt(c3 & 63);
  }
  return output;
};

const isShareCancelled = error => {
  if (isErrorWithCode(error, errorCodes.OPERATION_CANCELED)) {
    return true;
  }
  const message = String(error?.message || error?.error || error || '');
  return /cancel|did not share|ECANCELLED|user.?did.?not/i.test(message);
};

const openShare = ({ fileName, mime, url, useInternalStorage }) => {
  const baseName = fileName.replace(/\.json$/i, '');
  return Share.open({
    title: 'FamHeal yedek',
    subject: fileName,
    filename: Platform.OS === 'ios' ? fileName : baseName,
    type: mime,
    url,
    failOnCancel: false,
    useInternalStorage,
  });
};

const androidFiles = () => NativeModules.BackupFileModule;

export const shareBackupFile = async (json, fileName) => {
  if (Platform.OS === 'android' && androidFiles()?.saveJson) {
    const saved = await androidFiles().saveJson(fileName, json);
    if (!saved?.size) {
      throw new Error('empty-file');
    }
    return { success: true, savedToDownloads: true, size: saved.size };
  }

  const encoded = utf8ToBase64(json);
  if (Platform.OS === 'android') {
    try {
      return await openShare({
        fileName,
        mime: 'application/json',
        url: `data:application/json;base64,${encoded}`,
        useInternalStorage: true,
      });
    } catch (error) {
      if (isShareCancelled(error)) {
        throw error;
      }
      return openShare({
        fileName,
        mime: 'text/plain',
        url: `data:text/plain;base64,${encoded}`,
        useInternalStorage: true,
      });
    }
  }

  return openShare({
    fileName,
    mime: 'application/json',
    url: `data:application/json;base64,${encoded}`,
    useInternalStorage: false,
  });
};

const readUriText = async uri => {
  if (androidFiles()?.readText) {
    return androidFiles().readText(uri);
  }
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('read-failed');
  }
  return response.text();
};

export const pickBackupJson = async () => {
  try {
    const [file] = await pick({
      allowMultiSelection: false,
      type: [types.json, types.plainText, types.allFiles],
    });
    if (!file?.uri) {
      return { ok: false, cancelled: true };
    }

    const uris = [file.uri];
    try {
      const [copy] = await keepLocalCopy({
        destination: 'cachesDirectory',
        files: [
          {
            uri: file.uri,
            fileName: file.name || 'famheal-yedek.json',
          },
        ],
      });
      if (copy?.status === 'success' && copy.localUri) {
        uris.unshift(copy.localUri);
      }
    } catch {
      // keep the original picker uri
    }

    let lastError = null;
    for (const uri of uris) {
      try {
        const text = await readUriText(uri);
        if (String(text || '').trim()) {
          return { ok: true, text, name: file.name };
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      throw lastError;
    }
    return { ok: false, cancelled: false, empty: true };
  } catch (error) {
    if (isErrorWithCode(error, errorCodes.OPERATION_CANCELED) || isShareCancelled(error)) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, cancelled: false };
  }
};
