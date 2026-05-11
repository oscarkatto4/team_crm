import { format, formatInTimeZone } from 'date-fns-tz';
import CryptoJS from 'crypto-js';

const TIMEZONE = 'Asia/Jakarta';
const ENCRYPTION_KEY = 'TWRS_SECRET_KEY_2024';

export const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

export const getWIBDate = () => {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
};

export const getWIBDateTime = () => {
  return formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
};

export const getWIBTime = () => {
  return formatInTimeZone(new Date(), TIMEZONE, 'HH:mm');
};

export const formatWIBDate = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const formatWIBDateTime = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy HH:mm');
  } catch {
    return dateStr;
  }
};

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return CryptoJS.SHA256(password).toString() === hash;
};

export const encryptPassword = (password: string): string => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
};

export const decryptPassword = (encrypted: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
};

export const validateWebAppUrl = (url: string): { valid: boolean; error?: string } => {
  const trimmedUrl = url.trim();
  
  if (!trimmedUrl) {
    return { valid: false, error: 'Apps Script Web App URL belum dikonfigurasi. Silakan isi di Setup Spreadsheet.' };
  }
  
  if (!trimmedUrl.startsWith('https://script.google.com/macros/s/')) {
    return { valid: false, error: 'URL salah. Gunakan URL Apps Script Web App yang dimulai dengan https://script.google.com/macros/s/' };
  }
  
  if (!trimmedUrl.endsWith('/exec')) {
    return { valid: false, error: 'URL salah. Gunakan URL Apps Script Web App yang berakhiran /exec. Jangan gunakan URL Spreadsheet.' };
  }
  
  return { valid: true };
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const calculateWorkDuration = (startTime: string, endTime: string): number => {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
};
