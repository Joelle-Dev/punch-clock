<template>
  <div class="tab-panel active punch-panel">
    <header class="app-header">
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ todayCount }}</span>
          <span class="stat-label">今日</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ streak }}</span>
          <span class="stat-label">连续</span>
        </div>
        <div class="stat-card stat-card-achievement" @click="openAchievementModal">
          <span class="stat-value">{{ unlockedList.length }}</span>
          <span class="stat-label">成就</span>
          <span v-if="latestUnlockedTitle" class="stat-achievement-hint">{{ latestUnlockedTitle }}</span>
        </div>
      </div>
    </header>

    <main class="app-main">
      <!-- 类型选择 -->
      <section class="type-section" aria-label="选择类型">
        <van-tabs v-model:active="currentType" shrink>
          <van-tab v-for="t in typeTabs" :key="t.type" :name="t.type">
            <template #title>
              <span class="type-tab-title">
                <component :is="t.iconComponent" :size="getTypeIconSize(t.type)" />
                <span class="type-tab-text">{{ t.short }}</span>
              </span>
            </template>
          </van-tab>
        </van-tabs>
      </section>

      <!-- 打卡按钮区域 -->
      <section
        class="punch-section"
        :class="{ 'punch-section--first': isFirstPunch }"
        aria-label="打卡"
      >
        <van-button
          type="primary"
          round
          size="large"
          class="punch-button"
          :class="punchButtonClasses"
          :aria-label="punchButtonAriaLabel"
          @click="onPunch"
        >
          <span class="punch-button-inner">
            <span class="punch-icon" aria-hidden="true">
              <component
                v-if="currentTypeTab"
                :is="currentTypeTab.iconComponent"
                :size="40"
              />
            </span>
            <span class="punch-text">打我</span>
          </span>
        </van-button>

        <!-- 上次打卡信息 -->
        <p class="last-punch" v-if="lastPunchDisplay.hasRecord">
          上次是
          <span class="last-punch-type">{{ lastPunchDisplay.typeLabel }}</span>
          ～
          <span class="last-punch-date">{{ lastPunchDisplay.dateDisplay }}</span>
          {{ lastPunchDisplay.timeDisplay }}
        </p>
        <p class="last-punch" v-else>
          {{ lastPunchDisplay.text }}
        </p>
      </section>

      <section class="heatmap-section" aria-label="本月打我">
        <h2 class="heatmap-title">本月打我</h2>
        <div class="heatmap-container">
          <div class="heatmap-grid">
            <span v-for="w in WEEK_LABELS" :key="w" class="heatmap-week-label">{{ w }}</span>
            <template v-for="(cell, i) in heatmapCells" :key="i">
              <span
                v-if="cell.empty"
                class="heatmap-cell heatmap-cell-empty"
              />
              <span
                v-else
                class="heatmap-cell"
                :class="cell.level"
                :title="cell.title"
              >
                {{ cell.count || '' }}
              </span>
            </template>
          </div>
        </div>
        <p v-if="lastYearTodayCount > 0" class="last-year-hint">去年的今天你打了 {{ lastYearTodayCount }} 次哦</p>
        <p v-else-if="heatmapMonthTotal === 0" class="heatmap-empty-hint">这个月还没打过哦，打一次就会亮起来～</p>
      </section>
    </main>
    <PunchSuccessModal
      v-if="punchSuccessOpen"
      v-model:open="punchSuccessOpen"
      :punch-type="punchSuccessType"
      :message="punchSuccessMessage"
      :unlocked-audio-context="unlockedAudioContext"
    />
  </div>
</template>

<script setup>
import '../styles/punch.css';
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { showToast } from 'vant';
import { usePunchRecords } from '../composables/usePunchRecords';
import { useAchievements } from '../composables/useAchievements';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';
import { dayjs, formatDateDisplay, formatTime } from '../utils/date';
import { getPraiseMessage } from '../utils/praise';
import { playPunchHaptic } from '../utils/feedback';
import PunchSuccessModal from '../components/PunchSuccessModal.vue';
import { ToiletIcon, MealIcon, FitnessIcon } from '../components/icons';

// ===== Composables =====
const { records, todayCount, streak, lastRecord, addRecord, getMonthHeatmap } = usePunchRecords();
const { unlockedList, achievements, checkAll } = useAchievements();
const { shouldSkipDueToDoubleTap } = useDoubleTapHint();

// ===== Inject =====
const openAchievementModal = inject('openAchievementModal', () => {});
const showAchievementToast = inject('showAchievementToast', () => {});
const userName = inject('userName', ref(''));

// ===== 常量 =====
const VALID_TYPES = ['toilet', 'meal', 'fitness'];
const DEFAULT_TYPE = 'fitness';
const DEFAULT_NAME = '秋瑾';
const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const BOUNCE_DURATION = 450;

// 热力图等级阈值
const HEATMAP_LEVELS = [
  { threshold: 6, class: 'heatmap-cell-4' },
  { threshold: 4, class: 'heatmap-cell-3' },
  { threshold: 2, class: 'heatmap-cell-2' },
  { threshold: 1, class: 'heatmap-cell-1' },
];

// ===== 类型配置 =====
const typeTabs = [
  { type: 'toilet', label: '如厕', emoji: '🚽', short: '厕', tint: '#4caf50', iconComponent: ToiletIcon },
  { type: 'meal', label: '饭否', emoji: '🍚', short: '饭', tint: '#ff9800', iconComponent: MealIcon },
  { type: 'fitness', label: '健身', emoji: '💪', short: '身', tint: '#2196f3', iconComponent: FitnessIcon },
].map((t) => ({ ...t, tabTitle: `${t.emoji} ${t.short}` }));

// ===== 状态 =====
const currentType = ref(
  VALID_TYPES.includes(lastRecord.value?.type) ? lastRecord.value.type : DEFAULT_TYPE
);
const bounce = ref(false);
const punchSuccessOpen = ref(false);
const punchSuccessType = ref('fitness');
const punchSuccessMessage = ref('');
/** 用户点击时创建并 resume，供移动端自动播放 */
const unlockedAudioContext = ref(null);

// ===== 计算属性 =====
const achievementMap = computed(() => {
  return new Map(achievements.map((a) => [a.id, a]));
});

const latestUnlockedTitle = computed(() => {
  const ids = unlockedList.value;
  if (!ids.length) return '';
  const lastId = ids[ids.length - 1];
  return achievementMap.value.get(lastId)?.title ?? '';
});

const currentTypeTab = computed(() => {
  return typeTabs.find((t) => t.type === currentType.value) || typeTabs[0];
});

const isFirstPunch = computed(() => todayCount.value === 0);

const punchButtonClasses = computed(() => [
  `punch-button--${currentType.value}`,
  {
    'punch-button-bounce': bounce.value,
    'punch-button--first': isFirstPunch.value,
  },
]);

const punchButtonAriaLabel = computed(() => {
  return `${currentTypeTab.value?.label || ''} 打我`;
});

const lastPunchDisplay = computed(() => {
  // 如果今天没有打卡，显示提示信息
  if (todayCount.value === 0) {
    return { hasRecord: false, text: '今天还没打过我哦' };
  }

  // 获取今天的所有记录，取时间戳最大的一条（最后一次打卡）
  const todayKey = dayjs().format('YYYY-MM-DD');
  const todayRecords = records.value.filter((r) => r.dateKey === todayKey);
  if (!todayRecords.length) {
    return { hasRecord: false, text: '今天还没打过我哦' };
  }

  const lastTodayRecord = todayRecords.reduce((max, r) =>
    r.timestamp > max.timestamp ? r : max
  );
  const typeTab = typeTabs.find((t) => t.type === (lastTodayRecord.type || 'fitness'));

  return {
    hasRecord: true,
    typeLabel: typeTab?.label ?? '健身',
    dateDisplay: formatDateDisplay(lastTodayRecord.dateKey),
    timeDisplay: formatTime(lastTodayRecord.timestamp),
  };
});

const now = computed(() => dayjs());

const lastYearTodayCount = computed(() => {
  const key = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
  return records.value.filter((r) => r.dateKey === key).length;
});

const heatmapCells = computed(() => {
  const d = now.value;
  const year = d.year();
  const month = d.month() + 1;
  const heat = getMonthHeatmap(records.value, year, month);
  const firstDay = d.startOf('month');
  const totalDays = firstDay.daysInMonth();
  const startWeekday = firstDay.day();
  const cells = [];

  // 填充月初空白
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ empty: true });
  }

  // 生成日期单元格
  for (let day = 1; day <= totalDays; day++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = heat[dateKey] || 0;
    const level = getHeatmapLevel(count);
    const title = count ? `${dateKey} 打我 ${count} 次` : dateKey;
    cells.push({ empty: false, count, level, title });
  }

  return cells;
});

const heatmapMonthTotal = computed(() =>
  heatmapCells.value.filter((c) => !c.empty).reduce((s, c) => s + (c.count || 0), 0)
);

// ===== 方法 =====
function getTypeIconSize(type) {
  return type === 'meal' ? 28 : 24;
}

function getHeatmapLevel(count) {
  const level = HEATMAP_LEVELS.find((l) => count >= l.threshold);
  return level?.class ?? 'heatmap-cell-0';
}

function getDisplayName() {
  return userName.value?.trim() || DEFAULT_NAME;
}

function refreshRecords() {
  records.value = [...records.value];
}

function onPunch() {
  if (shouldSkipDueToDoubleTap(currentType.value)) return;

  playPunchHaptic();

  // 在用户交互时创建/恢复 AudioContext，满足移动端自动播放策略
  const Ctx = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (Ctx) {
    if (!unlockedAudioContext.value || unlockedAudioContext.value.state === 'closed') {
      unlockedAudioContext.value = new Ctx();
    }
    if (unlockedAudioContext.value.state === 'suspended') {
      unlockedAudioContext.value.resume();
    }
  }

  const displayName = getDisplayName();
  punchSuccessType.value = currentType.value;
  punchSuccessMessage.value = getPraiseMessage(currentType.value, displayName, streak.value);
  punchSuccessOpen.value = true;
  addRecord(currentType.value);

  // 按钮弹跳动画
  bounce.value = true;
  requestAnimationFrame(() => {
    bounce.value = false;
    void document.body.offsetHeight; // 触发重排
    bounce.value = true;
    setTimeout(() => {
      bounce.value = false;
    }, BOUNCE_DURATION);
  });

  // 检查成就
  setTimeout(() => {
    const newly = checkAll(records.value);
    newly.forEach((a) => showAchievementToast(a));
  }, 0);

  // 本周健身小目标（≥3 次）达成提示
  if (currentType.value === 'fitness') {
    const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
    const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');
    const thisWeekFitness = records.value.filter(
      (r) => r.type === 'fitness' && r.dateKey >= weekStart && r.dateKey <= weekEnd
    ).length;
    if (thisWeekFitness >= 3) {
      setTimeout(() => {
        showToast('本周健身小目标已达成～');
      }, 600);
    }
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    refreshRecords();
  }
}

function handlePageShow(e) {
  if (e.persisted) {
    refreshRecords();
  }
}

// ===== 生命周期 =====
onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('pageshow', handlePageShow);
});
</script>
