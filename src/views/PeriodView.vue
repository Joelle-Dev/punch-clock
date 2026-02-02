<template>
  <div class="tab-panel active period-page">
    <header class="period-header">
      <div class="period-header-inner">
        <div>
          <h1 class="period-title">姨妈记</h1>
          <p class="period-subtitle">记一记，猜下次</p>
        </div>
        <van-button plain round class="period-header-more" aria-label="更多操作" @click="openActionsMenu">
          <span class="period-header-more-icon">⋯</span>
        </van-button>
      </div>
    </header>
    <main class="period-main">
      <div class="period-status-card" :class="{ 'period-status-card--active': openPeriod }">
        <span class="period-status-badge">{{ openPeriod ? '进行中' : '未在经期' }}</span>
        <template v-if="openPeriod">
          <div class="period-status-row">
            <span class="period-status-label">开始</span>
            <span class="period-status-value">{{ formatDateDisplay(openPeriod.startDate) }}</span>
          </div>
          <div class="period-status-row">
            <span class="period-status-label">结束</span>
            <span class="period-status-value period-status-value--muted">尚未记录</span>
          </div>
        </template>
        <template v-else>
          <p class="period-status-hint">点击下方「来的第一天」开始新周期</p>
        </template>
      </div>

      <div class="period-actions">
        <van-button type="primary" round block class="period-btn period-btn-start" :disabled="!!openPeriod" @click="onStart">
          来的第一天
        </van-button>
        <van-button plain round block class="period-btn period-btn-end" :disabled="!openPeriod" @click="onEnd">
          结束了
        </van-button>
      </div>

      <div class="period-prediction-card">
        <div class="period-prediction-label">猜你下次开始</div>
        <template v-if="nextPrediction">
          <div class="period-prediction-value">{{ formatDateDisplay(nextPrediction.dateKey) }}</div>
          <div class="period-prediction-hint">基于平均周期 {{ nextPrediction.avgCycle }} 天，仅供参考</div>
        </template>
        <template v-else>
          <div class="period-prediction-hint">再记至少 2 次「来的第一天」就有预测啦</div>
        </template>
      </div>

      <section class="period-history-section">
        <h2 class="period-history-title">记过啥</h2>
        <div class="period-history-list">
          <template v-if="sortedPeriods.length">
            <div v-for="p in sortedPeriods" :key="p.id" class="period-history-item">
              <div class="period-history-content">
                <span class="period-history-range">
                  {{ formatDateDisplay(p.startDate) }}{{ p.endDate ? ' ～ ' + formatDateDisplay(p.endDate) : ' ～ 进行中' }}
                </span>
                <span v-if="p.endDate" class="period-history-days">{{ diffDays(p.startDate, p.endDate, true) }} 天</span>
              </div>
              <van-button size="mini" plain class="period-history-delete-btn" @click="confirmDeletePeriod(p.id)">删掉</van-button>
            </div>
          </template>
          <van-empty v-else description="还没记过姨妈哦" image="default" class="period-empty" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import '../styles/period.css';
import { inject } from 'vue';
import { showConfirmDialog, showToast } from 'vant';
import { dayjs, todayKey, diffDays } from '../utils/date';
import { getPrimaryColor } from '../utils/theme';
import { usePeriodRecords } from '../composables/usePeriodRecords';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';

const openConfirm = inject('openConfirm', (opts) => { if (opts?.onConfirm && confirm(opts.message)) opts.onConfirm(); });
const openActionsMenu = inject('openActionsMenu', () => {});

const { shouldSkipDueToDoubleTap } = useDoubleTapHint({
  messages: ['记上瘾了？', '手下留情～', '再记要收费了～'],
});

const {
  openPeriod,
  nextPrediction,
  sortedPeriods,
  startPeriod,
  endPeriod,
  endPreviousAndStart,
  deletePeriod,
  formatDateDisplay,
} = usePeriodRecords();

function confirmDeletePeriod(id) {
  const color = getPrimaryColor();
  showConfirmDialog({
    title: '删掉这条？',
    message: '真要删掉这条呀？',
    showCancelButton: true,
    confirmButtonText: '好哒',
    cancelButtonText: '算了',
    ...(color ? { confirmButtonColor: color } : {}),
  })
    .then(() => deletePeriod(id))
    .catch(() => {});
}

function onStart() {
  if (shouldSkipDueToDoubleTap()) return;
  const key = todayKey();
  if (openPeriod.value) {
    const yesterdayKey = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    openConfirm({
      title: '开始新一轮',
      message: '上一轮还没点「结束了」，会先帮你把上轮结束日算昨天，再记这次。确定？',
      onConfirm: () => {
        endPreviousAndStart(yesterdayKey, key);
        showToast('记好啦');
      },
    });
  } else {
    startPeriod();
    showToast('记好啦');
  }
}

function onEnd() {
  if (shouldSkipDueToDoubleTap()) return;
  endPeriod();
  showToast('记好啦');
}
</script>
