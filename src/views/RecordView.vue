<template>
  <div class="tab-panel active record-page">
    <header class="record-header">
      <div class="record-header-inner">
        <div>
          <h1 class="record-title">小本本</h1>
          <p v-if="filteredRecords.length" class="record-summary">共 {{ filteredRecords.length }} 条</p>
        </div>
        <van-button plain round class="record-header-more" aria-label="更多操作" @click="openActionsMenu">
          <span class="record-header-more-icon">⋯</span>
        </van-button>
      </div>
    </header>

    <section class="record-filters">
      <div class="record-filter-row">
        <span class="record-filter-label">时间</span>
        <van-tabs v-model:active="filter" shrink class="record-tabs record-tabs-time">
          <van-tab v-for="f in filterTabs" :key="f.value" :name="f.value" :title="f.label" />
        </van-tabs>
      </div>
      <div class="record-filter-row">
        <span class="record-filter-label">类型</span>
        <van-tabs v-model:active="historyType" shrink class="record-tabs record-tabs-type">
          <van-tab name="all" title="全部" />
          <van-tab v-for="t in typeTabs" :key="'ht-' + t.type" :name="t.type" :title="t.label" />
        </van-tabs>
      </div>
    </section>

    <main class="record-list-wrap">
      <template v-if="dateGroups.length">
        <section v-for="group in dateGroups" :key="group.dateKey" class="record-date-section">
          <h2 class="record-date-title">{{ formatDateDisplay(group.dateKey) }}</h2>
          <div class="record-date-cards">
            <div
              v-for="r in group.recs"
              :key="r.id"
              class="record-card"
              :class="'record-card--' + (r.type || 'other')"
            >
              <span class="record-card-type">{{ getTypeLabel(r.type || 'other') }}</span>
              <span class="record-card-time">{{ formatTime(r.timestamp) }}</span>
              <van-button
                size="mini"
                plain
                class="record-card-delete"
                @click.stop="confirmDelete(r.id)"
              >
                删除
              </van-button>
            </div>
          </div>
        </section>
      </template>
      <van-empty v-else description="小本本还是空的哦" image="default" class="record-empty" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { showConfirmDialog } from 'vant';
import { usePunchRecords } from '../composables/usePunchRecords';
import { formatDateDisplay, formatTime } from '../utils/date';
import { getPrimaryColor } from '../utils/theme';

const openActionsMenu = inject('openActionsMenu', () => {});
const { records, deleteRecord, applyFilter } = usePunchRecords();

function confirmDelete(id) {
  const color = getPrimaryColor();
  showConfirmDialog({
    title: '删掉这条？',
    message: '真要删掉这条呀？',
    showCancelButton: true,
    confirmButtonText: '好哒',
    cancelButtonText: '算了',
    ...(color ? { confirmButtonColor: color } : {}),
  })
    .then(() => deleteRecord(id))
    .catch(() => {});
}

const filter = ref('all');
const historyType = ref('all');

const typeTabs = [
  { type: 'toilet', label: '如厕' },
  { type: 'meal', label: '饭否' },
  { type: 'fitness', label: '健身' },
  { type: 'other', label: '其他' },
];

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
];

const filteredRecords = computed(() => {
  const list = applyFilter(records.value, filter.value);
  if (historyType.value === 'all') return list;
  return list.filter((r) => (r.type || 'other') === historyType.value);
});

const dateGroups = computed(() => {
  const list = filteredRecords.value.slice().sort((a, b) => b.timestamp - a.timestamp);
  const map = new Map();
  for (const r of list) {
    const key = r.dateKey || '';
    if (!map.has(key)) map.set(key, { dateKey: key, recs: [] });
    map.get(key).recs.push(r);
  }
  return Array.from(map.values()).sort((a, b) => (b.dateKey > a.dateKey ? 1 : b.dateKey < a.dateKey ? -1 : 0));
});

function getTypeLabel(type) {
  const map = { toilet: '如厕', meal: '饭否', fitness: '健身', other: '其他' };
  return map[type] || '其他';
}
</script>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--bg);
}

/* ---------- 头部（紧凑） ---------- */
.record-header {
  flex-shrink: 0;
  padding: 12px 16px 14px;
  border-bottom: 1px solid var(--separator);
  background: var(--surface);
}
.record-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.record-header-more {
  flex-shrink: 0;
  min-width: 38px;
  height: 38px;
  padding: 0;
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
}
.record-header-more:active {
  background: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
  color: #fff !important;
}
.record-header-more-icon {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}
.record-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 2px 0;
  letter-spacing: 0.02em;
}
.record-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  border-radius: 2px;
  background: var(--primary);
  margin-right: 8px;
  vertical-align: -0.2em;
}
.record-summary {
  font-size: 12px;
  color: var(--text-3);
  margin: 0;
  padding-left: 12px;
}

/* ---------- 筛选区（紧凑） ---------- */
.record-filters {
  flex-shrink: 0;
  padding: 10px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--separator);
}
.record-filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.record-filter-row:last-child {
  margin-bottom: 0;
}
.record-filter-label {
  font-size: 13px;
  color: var(--text-3);
  min-width: 34px;
}
.record-tabs {
  flex: 1;
}
.record-tabs :deep(.van-tabs__wrap) {
  height: auto;
  border: none;
}
.record-tabs :deep(.van-tabs__nav) {
  background: var(--surface-2);
  border-radius: 10px;
  padding: 2px;
}
.record-tabs :deep(.van-tab) {
  padding: 5px 10px;
  font-size: 13px;
  color: var(--text-2);
  border-radius: 8px;
}
.record-tabs :deep(.van-tab.van-tab--active) {
  background: var(--primary);
  color: #fff;
  font-weight: 500;
}
.record-tabs :deep(.van-tabs__line) {
  display: none;
}

/* ---------- 列表区（紧凑） ---------- */
.record-list-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 16px 18px;
}
.record-date-section {
  margin-bottom: 14px;
}
.record-date-section:last-child {
  margin-bottom: 0;
}
.record-date-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-3);
  margin: 0 0 8px 4px;
  padding-bottom: 2px;
}
.record-date-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.record-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary);
}
.record-card--toilet { border-left-color: var(--green); }
.record-card--meal { border-left-color: var(--orange); }
.record-card--fitness { border-left-color: var(--primary); }
.record-card--other { border-left-color: var(--text-3); }
.record-card-type {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  min-width: 36px;
}
.record-card-time {
  flex: 1;
  font-size: 13px;
  color: var(--text-2);
}
.record-card-delete {
  flex-shrink: 0;
  --van-button-default-color: var(--red);
  --van-button-default-border-color: var(--red);
  color: var(--red) !important;
  border-color: var(--red) !important;
}
.record-card-delete:active {
  background: rgba(255, 59, 48, 0.08) !important;
}
.record-empty {
  padding: 40px 20px;
}
</style>
