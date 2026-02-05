import { ref, computed } from 'vue';
import { dayjs, todayKey } from '../utils/date';
import { STORAGE_KEY } from '../constants';

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load records', e);
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function groupByDate(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!map.has(r.dateKey)) map.set(r.dateKey, []);
    map.get(r.dateKey).push(r);
  });
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, recs]) => ({ dateKey, recs }));
}

export function calcTodayCount(records) {
  const key = todayKey();
  return records.filter((r) => r.dateKey === key).length;
}

export function calcStreak(records) {
  if (!records.length) return 0;
  const grouped = groupByDate(records);
  let streak = 0;
  let cur = dayjs();
  for (let i = 0; i < grouped.length; i++) {
    const { dateKey } = grouped[i];
    if (dateKey === cur.format('YYYY-MM-DD')) {
      streak++;
      cur = cur.subtract(1, 'day');
    } else break;
  }
  return streak;
}

export function applyFilter(records, filter) {
  const key = todayKey();
  if (filter === 'today') return records.filter((r) => r.dateKey === key);
  if (filter === 'week') {
    const minKey = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    return records.filter((r) => r.dateKey >= minKey);
  }
  if (filter === 'month') {
    const prefix = dayjs().format('YYYY-MM');
    return records.filter((r) => r.dateKey.startsWith(prefix));
  }
  return records;
}

export function filterByType(records, type) {
  if (!type) return records;
  return records.filter((r) => (r.type || 'fitness') === type);
}

export function getMonthHeatmap(records, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const map = {};
  records.forEach((r) => {
    if (!r.dateKey.startsWith(prefix)) return;
    map[r.dateKey] = (map[r.dateKey] || 0) + 1;
  });
  return map;
}

let recordsRef = null;
export function usePunchRecords() {
  if (!recordsRef) recordsRef = ref(loadRecords());
  const records = recordsRef;

  function addRecord(type) {
    const now = dayjs();
    const record = {
      id: `${now.valueOf()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now.valueOf(),
      dateKey: now.format('YYYY-MM-DD'),
      type: type || 'fitness',
    };
    records.value.push(record);
    saveRecords(records.value);
    return record;
  }

  /** 补打卡：在指定时间点添加一条记录 */
  function addRecordAt(at, type) {
    const d = dayjs(at);
    const record = {
      id: `${d.valueOf()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: d.valueOf(),
      dateKey: d.format('YYYY-MM-DD'),
      type: type || 'fitness',
    };
    records.value.push(record);
    records.value.sort((a, b) => a.timestamp - b.timestamp);
    saveRecords(records.value);
    return record;
  }

  function deleteRecord(id) {
    records.value = records.value.filter((r) => r.id !== id);
    saveRecords(records.value);
  }

  function setRecords(newRecords) {
    records.value = newRecords;
    saveRecords(records.value);
  }

  const todayCount = computed(() => calcTodayCount(records.value));
  const streak = computed(() => calcStreak(records.value));
  const lastRecord = computed(() => {
    if (!records.value.length) return null;
    return records.value.reduce((max, r) => (r.timestamp > max.timestamp ? r : max));
  });

  return {
    records,
    todayCount,
    streak,
    lastRecord,
    addRecord,
    addRecordAt,
    deleteRecord,
    setRecords,
    loadRecords,
    saveRecords,
    groupByDate,
    applyFilter,
    getMonthHeatmap,
  };
}
