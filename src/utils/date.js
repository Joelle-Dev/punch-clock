import dayjs from 'dayjs';

/**
 * 日期键 YYYY-MM-DD（用于存储、筛选）
 * @param {Date|string|number|dayjs.Dayjs} date - Date 实例、日期字符串、时间戳或 dayjs
 */
export function getDateKey(date) {
  return dayjs(date).format('YYYY-MM-DD');
}

/** 今天日期键 */
export function todayKey() {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 两日期之间相差的天数（按自然日，含起止日可 +1）
 * @param {string} startKey - YYYY-MM-DD
 * @param {string} endKey - YYYY-MM-DD
 * @param {boolean} inclusive - 是否含结束日（经期天数通常 +1）
 */
export function diffDays(startKey, endKey, inclusive = false) {
  const a = dayjs(startKey).startOf('day');
  const b = dayjs(endKey).startOf('day');
  if (!a.isValid() || !b.isValid()) return 0;
  const days = b.diff(a, 'day');
  return inclusive ? days + 1 : days;
}

/**
 * 格式化为时分秒 HH:mm:ss
 */
export function formatTime(date) {
  return dayjs(date).format('HH:mm:ss');
}

/**
 * 格式化为中文日期展示（如 2024年1月15日）
 * @param {string} dateKey - YYYY-MM-DD
 */
export function formatDateDisplay(dateKey) {
  if (!dateKey || typeof dateKey !== 'string') return '';
  const d = dayjs(dateKey);
  return d.isValid() ? d.format('YYYY年M月D日') : dateKey;
}

export { dayjs };
