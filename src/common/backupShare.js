import { Platform } from 'react-native';
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

export const shareBackupFile = async (json, fileName) => {
  const baseName = fileName.replace(/\.json$/i, '');
  return Share.open({
    title: 'FamHeal yedek',
    subject: fileName,
    filename: Platform.OS === 'ios' ? fileName : baseName,
    type: 'application/json',
    url: `data:application/json;base64,${utf8ToBase64(json)}`,
    failOnCancel: false,
  });
};

const readUriText = async uri => {
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

    let uri = file.uri;
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
        uri = copy.localUri;
      }
    } catch {
      // fall back to the original picker uri
    }

    const text = await readUriText(uri);
    return { ok: true, text, name: file.name };
  } catch (error) {
    if (isErrorWithCode(error, errorCodes.OPERATION_CANCELED)) {
      return { ok: false, cancelled: true };
    }
    return { ok: false, cancelled: false };
  }
};
