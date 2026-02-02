import { ref, computed } from 'vue';
import { dayjs } from '../utils/date';
import { getDateKey, todayKey, formatDateDisplay, diffDays } from '../utils/date';
import { PERIOD_STORAGE_KEY } from '../constants';

function loadPeriodRecords() {
  try {
    const raw = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load period records', e);
    return [];
  }
}

function savePeriodRecords(records) {
  localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(records));
}

export function getCurrentOpenPeriod(periodRecords) {
  return periodRecords
    .filter((r) => !r.endDate)
    .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))[0] || null;
}

export function calcNextPeriodStart(periodRecords) {
  const withStart = periodRecords
    .map((r) => r.startDate)
    .filter(Boolean)
    .sort();
  if (withStart.length < 2) return null;
  const cycles = [];
  for (let i = 1; i < withStart.length; i++) {
    const days = diffDays(withStart[i - 1], withStart[i]);
    if (days > 0 && days < 90) cycles.push(days);
  }
  if (!cycles.length) return null;
  const avgCycle = Math.round(cycles.reduce((s, d) => s + d, 0) / cycles.length);
  const lastStart = withStart[withStart.length - 1];
  const nextKey = dayjs(lastStart).add(avgCycle, 'day').format('YYYY-MM-DD');
  return { dateKey: nextKey, avgCycle };
}

let periodRecordsRef = null;
export function usePeriodRecords() {
  if (!periodRecordsRef) periodRecordsRef = ref(loadPeriodRecords());
  const periodRecords = periodRecordsRef;

  const openPeriod = computed(() => getCurrentOpenPeriod(periodRecords.value));
  const nextPrediction = computed(() => calcNextPeriodStart(periodRecords.value));
  const sortedPeriods = computed(() =>
    [...periodRecords.value].sort((a, b) => (b.startDate > a.startDate ? 1 : -1))
  );

  function startPeriod() {
    const key = todayKey();
    const newPeriod = {
      id: `p-${dayjs().valueOf()}-${Math.random().toString(36).slice(2, 6)}`,
      startDate: key,
      endDate: null,
    };
    periodRecords.value.push(newPeriod);
    savePeriodRecords(periodRecords.value);
  }

  function endPeriod() {
    const open = getCurrentOpenPeriod(periodRecords.value);
    if (!open) return;
    open.endDate = todayKey();
    savePeriodRecords(periodRecords.value);
  }

  function endPreviousAndStart(yesterdayKey, startKey) {
    const open = getCurrentOpenPeriod(periodRecords.value);
    if (open) open.endDate = yesterdayKey;
    const newPeriod = {
      id: `p-${dayjs().valueOf()}-${Math.random().toString(36).slice(2, 6)}`,
      startDate: startKey,
      endDate: null,
    };
    periodRecords.value.push(newPeriod);
    savePeriodRecords(periodRecords.value);
  }

  function addPeriodAt(startDateKey, endDateKey = null) {
    const newPeriod = {
      id: `p-${dayjs().valueOf()}-${Math.random().toString(36).slice(2, 6)}`,
      startDate: startDateKey,
      endDate: endDateKey,
    };
    periodRecords.value.push(newPeriod);
    savePeriodRecords(periodRecords.value);
  }

  function deletePeriod(id) {
    periodRecords.value = periodRecords.value.filter((p) => p.id !== id);
    savePeriodRecords(periodRecords.value);
  }

  function setPeriodRecords(newRecords) {
    periodRecords.value = newRecords;
    savePeriodRecords(periodRecords.value);
  }

  return {
    periodRecords,
    openPeriod,
    nextPrediction,
    sortedPeriods,
    startPeriod,
    endPeriod,
    endPreviousAndStart,
    addPeriodAt,
    deletePeriod,
    setPeriodRecords,
    getCurrentOpenPeriod,
    calcNextPeriodStart,
    formatDateDisplay,
  };
}
