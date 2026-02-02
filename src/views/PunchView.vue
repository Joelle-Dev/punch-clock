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
      </section>
    </main>
    <PunchSuccessModal v-if="punchSuccessOpen" v-model:open="punchSuccessOpen" :message="punchSuccessMessage" />
  </div>
</template>

<script setup>
import '../styles/punch.css';
import { ref, computed, onMounted, onUnmounted, inject } from 'vue';
import { usePunchRecords } from '../composables/usePunchRecords';
import { useAchievements } from '../composables/useAchievements';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';
import { dayjs, formatDateDisplay, formatTime } from '../utils/date';
import { getPraiseMessage } from '../utils/praise';
import PunchSuccessModal from '../components/PunchSuccessModal.vue';
import { ToiletIcon, MealIcon, FitnessIcon, OtherIcon } from '../components/icons';

// ===== Composables =====
const { records, todayCount, streak, lastRecord, addRecord, getMonthHeatmap } = usePunchRecords();
const { unlockedList, achievements, checkAll } = useAchievements();
const { shouldSkipDueToDoubleTap } = useDoubleTapHint();

// ===== Inject =====
const openAchievementModal = inject('openAchievementModal', () => {});
const showAchievementToast = inject('showAchievementToast', () => {});
const userName = inject('userName', ref(''));

// ===== 常量 =====
const VALID_TYPES = ['toilet', 'meal', 'fitness', 'other'];
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
  { type: 'other', label: '其他', emoji: '✨', short: '其', tint: '#9c27b0', iconComponent: OtherIcon },
].map((t) => ({ ...t, tabTitle: `${t.emoji} ${t.short}` }));

// ===== 状态 =====
const currentType = ref(
  VALID_TYPES.includes(lastRecord.value?.type) ? lastRecord.value.type : DEFAULT_TYPE
);
const bounce = ref(false);
const punchSuccessOpen = ref(false);
const punchSuccessMessage = ref('');

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
  const typeTab = typeTabs.find((t) => t.type === (lastTodayRecord.type || 'other'));

  return {
    hasRecord: true,
    typeLabel: typeTab?.label ?? '其他',
    dateDisplay: formatDateDisplay(lastTodayRecord.dateKey),
    timeDisplay: formatTime(lastTodayRecord.timestamp),
  };
});

const now = computed(() => dayjs());

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

  const displayName = getDisplayName();
  punchSuccessMessage.value = getPraiseMessage(currentType.value, displayName);
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
  // PWA 未关闭、次日再打卡时：切回前台时刷新「今日」等依赖当前日期的计算
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('pageshow', handlePageShow);
});
</script>
