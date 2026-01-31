import { ref, computed } from 'vue';
import { dayjs } from '../utils/date';
import { groupByDate, calcStreak, filterByType } from './usePunchRecords';
import { ACHIEVEMENT_STORAGE_KEY } from '../constants';

const ACHIEVEMENTS = [
  { id: 'streak7', title: '连续 7 天', desc: '连续打我满 7 天', icon: '🔥', check: (records) => calcStreak(records) >= 7 },
  { id: 'toilet30', title: '如厕达人', desc: '如厕打我满 30 次', icon: '🚽', check: (records) => filterByType(records, 'toilet').length >= 30 },
  { id: 'meal30', title: '饭否达人', desc: '饭否打我满 30 次', icon: '🍚', check: (records) => filterByType(records, 'meal').length >= 30 },
  { id: 'fitness30', title: '健身达人', desc: '健身打我满 30 次', icon: '💪', check: (records) => filterByType(records, 'fitness').length >= 30 },
  { id: 'days100', title: '坚持 100 天', desc: '用打我小本本满 100 天', icon: '📅', check: (records) => {
    if (!records.length) return false;
    const first = records.slice().sort((a, b) => a.timestamp - b.timestamp)[0];
    const days = dayjs().diff(dayjs(first.timestamp), 'day');
    return days >= 100;
  }},
  { id: 'all4', title: '全能日', desc: '同一天打过全部 4 种类型～', icon: '🌟', check: (records) => {
    const byDate = groupByDate(records);
    return byDate.some(({ recs }) => new Set(recs.map((r) => r.type || 'other')).size >= 4);
  }},
];

function loadUnlocked() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUnlocked(ids) {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(ids));
}

let unlockedRef = null;
export function useAchievements() {
  if (!unlockedRef) unlockedRef = ref(loadUnlocked());
  const unlocked = unlockedRef;

  function checkAll(records) {
    const current = loadUnlocked();
    const newly = [];
    ACHIEVEMENTS.forEach((a) => {
      if (current.includes(a.id)) return;
      if (a.check(records)) {
        newly.push(a);
        current.push(a.id);
      }
    });
    if (newly.length) {
      saveUnlocked(current);
      unlocked.value = current;
    }
    return newly;
  }

  const unlockedList = computed(() => unlocked.value);

  return { unlockedList, achievements: ACHIEVEMENTS, checkAll, loadUnlocked };
}
