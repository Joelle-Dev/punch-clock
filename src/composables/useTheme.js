import { dayjs } from '../utils/date';

const THEME_STORAGE_KEY = 'punch_theme_v1';

function getStoredTheme() {
  try {
    const hex = localStorage.getItem(THEME_STORAGE_KEY);
    if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  } catch (e) {
    console.error('Failed to load theme', e);
  }
  return null;
}

export function saveTheme(hex) {
  if (hex) localStorage.setItem(THEME_STORAGE_KEY, hex);
  else localStorage.removeItem(THEME_STORAGE_KEY);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function darkenHex(hex, ratio) {
  const { r, g, b } = hexToRgb(hex);
  return '#' + [r, g, b]
    .map((c) => Math.round(Math.max(0, c * (1 - ratio))).toString(16).padStart(2, '0'))
    .join('');
}

function clearDayClasses(root) {
  Array.from(root.classList).forEach((c) => {
    if (c.startsWith('theme-day-')) root.classList.remove(c);
  });
}

export function applyCustomTheme(hex) {
  const root = document.documentElement;
  clearDayClasses(root);
  root.style.setProperty('--primary', hex);
  root.style.setProperty('--primary-dark', darkenHex(hex, 0.15));
  const { r, g, b } = hexToRgb(hex);
  root.style.setProperty('--primary-soft', `rgba(${r}, ${g}, ${b}, 0.15)`);
}

/** 按星期应用主题色，day 为 0–6（可选，缺省为当天） */
export function applyDayTheme(day = dayjs().day()) {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--primary-dark');
  root.style.removeProperty('--primary-soft');
  clearDayClasses(root);
  root.classList.add('theme-day-' + day);
}

export function initTheme() {
  const custom = getStoredTheme();
  if (custom) applyCustomTheme(custom);
  else applyDayTheme();
}

export function useTheme() {
  return { getStoredTheme, saveTheme, applyCustomTheme, applyDayTheme, initTheme };
}
