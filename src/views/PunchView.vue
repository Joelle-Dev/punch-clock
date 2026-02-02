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
      <section class="type-section" aria-label="选择类型">
        <van-tabs v-model:active="currentType" shrink>
          <van-tab v-for="t in typeTabs" :key="t.type" :name="t.type" :title="t.tabTitle" />
        </van-tabs>
      </section>

      <section class="punch-section" :class="{ 'punch-section--first': todayCount === 0 }">
        <van-button
          type="primary"
          round
          size="large"
          class="punch-button"
          :class="[
            'punch-button--' + currentType,
            { 'punch-button-bounce': bounce },
            { 'punch-button--first': todayCount === 0 },
          ]"
          :aria-label="currentTypeTab ? currentTypeTab.emoji + ' 打我' : '打我'"
          @click="onPunch"
        >
          <span class="punch-button-inner">
            <span class="punch-icon" aria-hidden="true">{{ currentTypeTab ? currentTypeTab.emoji : '👊' }}</span>
            <span class="punch-text">打我</span>
          </span>
        </van-button>
        <p class="last-punch">
          <template v-if="lastPunchDisplay.hasRecord">上次是 <span class="last-punch-type">{{ lastPunchDisplay.typeLabel }}</span> ～ <span class="last-punch-date">{{ lastPunchDisplay.dateDisplay }}</span> {{ lastPunchDisplay.timeDisplay }}</template>
          <template v-else>{{ lastPunchDisplay.text }}</template>
        </p>
      </section>

      <section class="heatmap-section" aria-label="本月打我">
        <h2 class="heatmap-title">本月打我</h2>
        <div class="heatmap-container">
          <div class="heatmap-grid">
            <span v-for="w in weekLabels" :key="w" class="heatmap-week-label">{{ w }}</span>
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
import { ref, computed, onMounted, inject } from 'vue';
import { usePunchRecords } from '../composables/usePunchRecords';
import { useAchievements } from '../composables/useAchievements';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';
import { dayjs, formatDateDisplay, formatTime } from '../utils/date';
import { getPraiseMessage } from '../utils/praise';
import PunchSuccessModal from '../components/PunchSuccessModal.vue';

const { records, todayCount, streak, lastRecord, addRecord, getMonthHeatmap } = usePunchRecords();
const { unlockedList, achievements, checkAll } = useAchievements();
const latestUnlockedTitle = computed(() => {
  const ids = unlockedList.value;
  if (!ids.length) return '';
  const lastId = ids[ids.length - 1];
  const a = achievements.find((x) => x.id === lastId);
  return a?.title ?? '';
});
const openAchievementModal = inject('openAchievementModal', () => {});
const showAchievementToast = inject('showAchievementToast', () => {});

const validTypes = ['toilet', 'meal', 'fitness', 'other'];
const currentType = ref(
  validTypes.includes(lastRecord.value?.type) ? lastRecord.value.type : 'fitness'
);
const bounce = ref(false);
const punchSuccessOpen = ref(false);
const punchSuccessMessage = ref('');
const { shouldSkipDueToDoubleTap } = useDoubleTapHint();

const typeTabs = [
  { type: 'toilet', label: '如厕', emoji: '🚽', short: '厕', tint: '#4caf50' },
  { type: 'meal', label: '饭否', emoji: '🍚', short: '饭', tint: '#ff9800' },
  { type: 'fitness', label: '健身', emoji: '💪', short: '身', tint: '#2196f3' },
  { type: 'other', label: '其他', emoji: '✨', short: '其', tint: '#9c27b0' },
].map((t) => ({ ...t, tabTitle: t.emoji + ' ' + t.short }));

const currentTypeTab = computed(() => typeTabs.find((t) => t.type === currentType.value) || typeTabs[0]);

function getTypeLabel(type) {
  return typeTabs.find((t) => t.type === type)?.label ?? '其他';
}

const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

const lastPunchDisplay = computed(() => {
  if (!lastRecord.value) return { hasRecord: false, text: '今天还没打过我哦' };
  const r = lastRecord.value;
  return {
    hasRecord: true,
    typeLabel: getTypeLabel(r.type || 'other'),
    dateDisplay: formatDateDisplay(r.dateKey),
    timeDisplay: formatTime(r.timestamp),
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
  for (let i = 0; i < startWeekday; i++) cells.push({ empty: true });
  for (let day = 1; day <= totalDays; day++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const count = heat[dateKey] || 0;
    let level = 'heatmap-cell-0';
    if (count >= 6) level = 'heatmap-cell-4';
    else if (count >= 4) level = 'heatmap-cell-3';
    else if (count >= 2) level = 'heatmap-cell-2';
    else if (count >= 1) level = 'heatmap-cell-1';
    cells.push({ empty: false, count, level, title: count ? `${dateKey} 打我 ${count} 次` : dateKey });
  }
  return cells;
});


function onPunch() {
  if (shouldSkipDueToDoubleTap(currentType.value)) return;
  punchSuccessMessage.value = getPraiseMessage(currentType.value);
  punchSuccessOpen.value = true;
  addRecord(currentType.value);
  bounce.value = true;
  requestAnimationFrame(() => {
    bounce.value = false;
    void document.body.offsetHeight;
    bounce.value = true;
    setTimeout(() => (bounce.value = false), 450);
  });
  setTimeout(() => {
    const newly = checkAll(records.value);
    newly.forEach((a) => showAchievementToast(a));
  }, 0);
}

onMounted(() => {
  /** PWA 未关闭、次日再打卡时：切回前台时刷新「今日」等依赖当前日期的计算 */
  const refresh = () => {
    records.value = [...records.value];
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refresh();
  });
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) refresh();
  });
});
</script>
