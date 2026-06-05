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
        <button
          type="button"
          class="type-scroll-button type-scroll-button--left"
          @click="scrollTypeTabs(-1)"
          :disabled="!canScrollLeft"
          aria-label="向左滚动类型"
        >
          ‹
        </button>
        <div class="type-tabs-scroll" ref="typeTabsScrollRef">
          <van-tabs :key="typeListKey" v-model:active="currentType" shrink>
            <van-tab v-for="t in typeList" :key="t.type" :name="t.type">
              <template #title>
                <span class="type-tab-title">
                  <span v-if="t.custom" class="type-tab-emoji">{{ t.emoji || '✨' }}</span>
                  <component v-else :is="t.iconComponent" :size="getTypeIconSize(t.type)" />
                  <span class="type-tab-text">{{ t.short }}</span>
                </span>
              </template>
            </van-tab>
          </van-tabs>
        </div>
        <button
          type="button"
          class="type-scroll-button type-scroll-button--right"
          @click="scrollTypeTabs(1)"
          :disabled="!canScrollRight"
          aria-label="向右滚动类型"
        >
          ›
        </button>
        <div class="type-section-actions">
          <van-button type="primary" plain size="small" class="type-add-button" aria-label="新增类型" @click="typeManagerOpen = true">＋</van-button>
        </div>
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
              <span v-if="currentTypeTab?.custom" class="current-type-emoji">{{ currentTypeTab.emoji || '✨' }}</span>
              <component
                v-else-if="currentTypeTab"
                :is="currentTypeTab.iconComponent"
                :size="40"
              />
            </span>
            <span class="punch-text">打我</span>
          </span>
        </van-button>

        <div class="toilet-amount-selection" v-if="currentType === 'toilet'">
          <span class="toilet-amount-label">如厕量</span>
          <div class="toilet-amount-buttons">
            <button
              v-for="option in toiletAmountOptions"
              :key="option.value"
              type="button"
              :class="['toilet-amount-button', { 'toilet-amount-button--active': toiletAmount === option.value }]"
              @click="setToiletAmount(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- 上次打卡信息 -->
        <p class="last-punch" v-if="lastPunchDisplay.hasRecord">
          上次是
          <span class="last-punch-type">{{ lastPunchDisplay.typeLabel }}</span>
          <span v-if="lastPunchDisplay.amountLabel" class="last-punch-amount"> · {{ lastPunchDisplay.amountLabel }}</span>
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
    <TypeManagerModal v-model:open="typeManagerOpen" @added="onTypeAdded" />
  </div>
</template>

<script setup>
import '../styles/punch.css';
import { ref, computed, onMounted, onUnmounted, watch, inject, nextTick } from 'vue';
import { showToast } from 'vant';
import { usePunchRecords } from '../composables/usePunchRecords';
import { useAchievements } from '../composables/useAchievements';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';
import { usePunchTypes } from '../composables/usePunchTypes';
import { dayjs, formatDateDisplay, formatTime } from '../utils/date';
import { getPraiseMessage } from '../utils/praise';
import { playPunchHaptic } from '../utils/feedback';
import PunchSuccessModal from '../components/PunchSuccessModal.vue';
import TypeManagerModal from '../components/TypeManagerModal.vue';
import { TOILET_AMOUNT_LABELS, TOILET_AMOUNT_STORAGE_KEY } from '../constants';

// ===== Composables =====
const { records, todayCount, streak, lastRecord, addRecord, getMonthHeatmap } = usePunchRecords();
const { unlockedList, achievements, checkAll } = useAchievements();
const { shouldSkipDueToDoubleTap } = useDoubleTapHint();
const { typeList, addType } = usePunchTypes();

// ===== Inject =====

const openAchievementModal = inject('openAchievementModal', () => {});
const showAchievementToast = inject('showAchievementToast', () => {});
const userName = inject('userName', ref(''));

// ===== 常量 =====
const DEFAULT_NAME = '秋瑾';
const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const BOUNCE_DURATION = 450;
const DEFAULT_TOILET_AMOUNT = 'normal';

// 热力图等级阈值
const HEATMAP_LEVELS = [
  { threshold: 6, class: 'heatmap-cell-4' },
  { threshold: 4, class: 'heatmap-cell-3' },
  { threshold: 2, class: 'heatmap-cell-2' },
  { threshold: 1, class: 'heatmap-cell-1' },
];

const toiletAmountOptions = Object.entries(TOILET_AMOUNT_LABELS).map(([value, label]) => ({ value, label }));

const persistedToiletAmount = typeof window !== 'undefined' ? localStorage.getItem(TOILET_AMOUNT_STORAGE_KEY) : null;

// ===== 状态 =====
const currentType = ref(
  typeList.value.some((t) => t.type === lastRecord.value?.type)
    ? lastRecord.value.type
    : typeList.value[0]?.type || 'fitness'
);
const toiletAmount = ref(
  ['small', 'normal', 'large'].includes(persistedToiletAmount) ? persistedToiletAmount : DEFAULT_TOILET_AMOUNT
);
const typeManagerOpen = ref(false);
const typeTabsScrollRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
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
  return typeList.value.find((t) => t.type === currentType.value) || typeList.value[0] || { iconComponent: null, label: '', short: '' };
});

const typeListKey = computed(() => typeList.value.map((t) => t.type).join(','));

const isFirstPunch = computed(() => todayCount.value === 0);

const punchButtonClasses = computed(() => {
  const typeClass = ['toilet', 'fitness'].includes(currentType.value)
    ? `punch-button--${currentType.value}`
    : 'punch-button--other';
  return [typeClass, {
    'punch-button-bounce': bounce.value,
    'punch-button--first': isFirstPunch.value,
  }];
});

const punchButtonAriaLabel = computed(() => {
  return `${currentTypeTab.value?.label || ''} 打我`;
});

function setToiletAmount(value) {
  if (!TOILET_AMOUNT_LABELS[value]) return;
  toiletAmount.value = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOILET_AMOUNT_STORAGE_KEY, value);
  }
}

function updateTypeScrollState() {
  const el = typeTabsScrollRef.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

function scrollTypeTabs(direction) {
  const el = typeTabsScrollRef.value;
  if (!el) return;
  const distance = Math.max(el.clientWidth * 0.7, 120);
  const nextLeft = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft + direction * distance));
  el.scrollTo({ left: nextLeft, behavior: 'smooth' });
  setTimeout(updateTypeScrollState, 320);
}

function onTypeAdded(type) {
  currentType.value = type;
  typeManagerOpen.value = false;
  // ensure the newly added type is scrolled into view
  scrollToType(type);
}

function scrollToType(type) {
  nextTick(() => {
    const el = typeTabsScrollRef.value;
    if (!el) return;
    const nav = el.querySelector('.van-tabs__nav') || el.querySelector('.van-tabs__wrap') || el;
    let target = null;
    const tabEls = nav.querySelectorAll('.van-tab');
    for (const tEl of tabEls) {
      if (tEl.getAttribute && (tEl.getAttribute('name') === type || (tEl.getAttribute('aria-controls') || '').includes(type))) {
        target = tEl;
        break;
      }
      const title = tEl.querySelector && tEl.querySelector('.type-tab-title');
      if (title && title.textContent && title.textContent.trim().includes(type)) {
        target = tEl;
        break;
      }
    }
    const child = target || nav.querySelector('.van-tab:last-child') || nav.lastElementChild;
    if (!child) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      setTimeout(updateTypeScrollState, 320);
      return;
    }
    const offsetLeft = child.offsetLeft || 0;
    const offsetWidth = child.offsetWidth || 0;
    const left = Math.max(0, Math.min(offsetLeft - (el.clientWidth - offsetWidth) / 2, el.scrollWidth - el.clientWidth));
    el.scrollTo({ left, behavior: 'smooth' });
    setTimeout(updateTypeScrollState, 320);
  });
}

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
  const typeTab = typeList.value.find((t) => t.type === (lastTodayRecord.type || 'fitness'));

  return {
    hasRecord: true,
    typeLabel: typeTab?.label ?? '超慢跑',
    amountLabel:
      lastTodayRecord.type === 'toilet' && lastTodayRecord.amount
        ? getToiletAmountLabel(lastTodayRecord.amount)
        : '',
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

function getToiletAmountLabel(value) {
  return TOILET_AMOUNT_LABELS[value] || '正常';
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
  const payload = currentType.value === 'toilet' ? { amount: toiletAmount.value } : {};
  addRecord(currentType.value, payload);

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

  // 本周超慢跑小目标（≥3 次）达成提示
  if (currentType.value === 'fitness') {
    const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
    const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');
    const thisWeekFitness = records.value.filter(
      (r) => r.type === 'fitness' && r.dateKey >= weekStart && r.dateKey <= weekEnd
    ).length;
    if (thisWeekFitness >= 3) {
      setTimeout(() => {
        showToast('本周超慢跑小目标已达成～');
      }, 600);
    }
  }
}

// ===== 方法 =====
function getTypeIconSize(type) {
  return 24;
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
watch(typeList, updateTypeScrollState, { immediate: true });

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);

  updateTypeScrollState();
  const scrollEl = typeTabsScrollRef.value;
  if (scrollEl) {
    scrollEl.addEventListener('scroll', updateTypeScrollState, { passive: true });
  }
});

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('pageshow', handlePageShow);

  const scrollEl = typeTabsScrollRef.value;
  if (scrollEl) {
    scrollEl.removeEventListener('scroll', updateTypeScrollState);
  }
});
</script>
