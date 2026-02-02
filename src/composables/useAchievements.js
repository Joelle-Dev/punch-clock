import { ref, computed } from 'vue';
import { dayjs } from '../utils/date';
import { groupByDate, calcStreak, filterByType } from './usePunchRecords';
import { ACHIEVEMENT_STORAGE_KEY } from '../constants';

/** 最近 7 天内是否打过全部 4 种类型 */
function allTypesInLast7Days(records) {
  const minKey = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
  const recent = records.filter((r) => r.dateKey >= minKey);
  return new Set(recent.map((r) => r.type || 'other')).size >= 4;
}

/** 单日最多打我次数 */
function maxCountPerDay(records) {
  const byDate = groupByDate(records);
  if (!byDate.length) return 0;
  return Math.max(...byDate.map(({ recs }) => recs.length));
}

/** 是否有某天 6:00 前打过 */
function hasEarlyBird(records) {
  return records.some((r) => dayjs(r.timestamp).hour() < 6);
}

/** 是否有某天 23:00 后打过 */
function hasNightOwl(records) {
  return records.some((r) => dayjs(r.timestamp).hour() >= 23);
}

/** 从第一条记录起的天数 */
function daysSinceFirst(records) {
  if (!records.length) return 0;
  const first = records.slice().sort((a, b) => a.timestamp - b.timestamp)[0];
  return dayjs().diff(dayjs(first.timestamp), 'day');
}

const ACHIEVEMENTS = [
  // ---------- 连续 ----------
  { id: 'streak3', category: 'streak', title: '连续 3 天', desc: '连续打我满 3 天～', icon: '🌱', hidden: false, check: (r) => calcStreak(r) >= 3, getProgress: (r) => ({ current: calcStreak(r), target: 3 }) },
  { id: 'streak7', category: 'streak', title: '连续 7 天', desc: '连续打我满 7 天～', icon: '🔥', hidden: false, check: (r) => calcStreak(r) >= 7, getProgress: (r) => ({ current: calcStreak(r), target: 7 }) },
  { id: 'streak14', category: 'streak', title: '连续 14 天', desc: '连续打我满 14 天～', icon: '⭐', hidden: false, check: (r) => calcStreak(r) >= 14, getProgress: (r) => ({ current: calcStreak(r), target: 14 }) },
  { id: 'streak30', category: 'streak', title: '连续 30 天', desc: '连续打我满 30 天～', icon: '🏆', hidden: false, check: (r) => calcStreak(r) >= 30, getProgress: (r) => ({ current: calcStreak(r), target: 30 }) },
  // ---------- 类型达人 ----------
  { id: 'toilet30', category: 'type', title: '厕所之光', desc: '如厕打我满 30 次～', icon: '🚽', hidden: false, check: (r) => filterByType(r, 'toilet').length >= 30, getProgress: (r) => ({ current: filterByType(r, 'toilet').length, target: 30 }) },
  { id: 'meal30', category: 'type', title: '干饭人', desc: '饭否打我满 30 次～', icon: '🍚', hidden: false, check: (r) => filterByType(r, 'meal').length >= 30, getProgress: (r) => ({ current: filterByType(r, 'meal').length, target: 30 }) },
  { id: 'fitness30', category: 'type', title: '健身小能手', desc: '健身打我满 30 次～', icon: '💪', hidden: false, check: (r) => filterByType(r, 'fitness').length >= 30, getProgress: (r) => ({ current: filterByType(r, 'fitness').length, target: 30 }) },
  { id: 'other30', category: 'type', title: '其他达人', desc: '其他类型打我满 30 次～', icon: '✨', hidden: false, check: (r) => filterByType(r, 'other').length >= 30, getProgress: (r) => ({ current: filterByType(r, 'other').length, target: 30 }) },
  // ---------- 里程碑 ----------
  { id: 'first', category: 'milestone', title: '第一次', desc: '打了第一次我～', icon: '🎉', hidden: false, check: (r) => r.length >= 1, getProgress: (r) => ({ current: r.length, target: 1 }) },
  { id: 'count100', category: 'milestone', title: '第 100 次', desc: '累计打我满 100 次～', icon: '💯', hidden: false, check: (r) => r.length >= 100, getProgress: (r) => ({ current: r.length, target: 100 }) },
  { id: 'count500', category: 'milestone', title: '第 500 次', desc: '累计打我满 500 次～', icon: '🎊', hidden: false, check: (r) => r.length >= 500, getProgress: (r) => ({ current: r.length, target: 500 }) },
  { id: 'days100', category: 'milestone', title: '坚持 100 天', desc: '用打我小本本满 100 天～', icon: '📅', hidden: false, check: (r) => daysSinceFirst(r) >= 100, getProgress: (r) => ({ current: daysSinceFirst(r), target: 100 }) },
  // ---------- 特殊 / 彩蛋 ----------
  { id: 'all4', category: 'special', title: '一日全能', desc: '同一天打过全部 4 种类型～', icon: '🌟', hidden: false, check: (r) => groupByDate(r).some(({ recs }) => new Set(recs.map((x) => x.type || 'other')).size >= 4), getProgress: (r) => (groupByDate(r).some(({ recs }) => new Set(recs.map((x) => x.type || 'other')).size >= 4) ? { current: 1, target: 1 } : { current: 0, target: 1 }) },
  { id: 'all4week', category: 'special', title: '全能周', desc: '一周内 4 种类型都打过～', icon: '🌈', hidden: false, check: (r) => allTypesInLast7Days(r), getProgress: (r) => (allTypesInLast7Days(r) ? { current: 1, target: 1 } : { current: 0, target: 1 }) },
  { id: 'day5', category: 'special', title: '单日五连', desc: '同一天打我满 5 次～', icon: '📌', hidden: false, check: (r) => maxCountPerDay(r) >= 5, getProgress: (r) => ({ current: maxCountPerDay(r), target: 5 }) },
  { id: 'day10', category: 'special', title: '单日十连', desc: '同一天打我满 10 次～', icon: '🔟', hidden: false, check: (r) => maxCountPerDay(r) >= 10, getProgress: (r) => ({ current: maxCountPerDay(r), target: 10 }) },
  { id: 'earlyBird', category: 'special', title: '早起鸟', desc: '某天 6 点前打过我～', icon: '🌅', hidden: true, check: (r) => hasEarlyBird(r), getProgress: (r) => (hasEarlyBird(r) ? { current: 1, target: 1 } : { current: 0, target: 1 }) },
  { id: 'nightOwl', category: 'special', title: '夜猫子', desc: '某天 23 点后打过我～', icon: '🦉', hidden: true, check: (r) => hasNightOwl(r), getProgress: (r) => (hasNightOwl(r) ? { current: 1, target: 1 } : { current: 0, target: 1 }) },
];

const CATEGORY_LABELS = {
  streak: '连续',
  type: '类型达人',
  milestone: '里程碑',
  special: '特殊',
};

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
let newlyUnlockedIdsRef = null;
export function useAchievements() {
  if (!unlockedRef) unlockedRef = ref(loadUnlocked());
  if (!newlyUnlockedIdsRef) newlyUnlockedIdsRef = ref([]);
  const unlocked = unlockedRef;
  const newlyUnlockedIds = newlyUnlockedIdsRef;

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
      newlyUnlockedIds.value = newly.map((a) => a.id);
    }
    return newly;
  }

  function clearNewlyUnlocked() {
    newlyUnlockedIds.value = [];
  }

  const unlockedList = computed(() => unlocked.value);

  /** 按分组整理成就列表，用于弹窗展示 */
  const achievementsByCategory = computed(() => {
    const order = ['streak', 'type', 'milestone', 'special'];
    return order.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      list: ACHIEVEMENTS.filter((a) => a.category === cat),
    })).filter((g) => g.list.length > 0);
  });

  return {
    unlockedList,
    achievements: ACHIEVEMENTS,
    achievementsByCategory,
    newlyUnlockedIds,
    checkAll,
    clearNewlyUnlocked,
    loadUnlocked,
  };
}
