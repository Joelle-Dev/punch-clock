<template>
  <template v-if="showFab">
    <input ref="punchFileRef" type="file" accept=".csv,text/csv" hidden @change="onPunchFileChange" />
    <input ref="periodFileRef" type="file" accept=".csv,text/csv" hidden @change="onPeriodFileChange" />
    <van-action-sheet
      v-model:show="sheetShow"
      :actions="sheetActions"
      cancel-text="算了"
      close-on-click-action
      @select="onSheetSelect"
    />
    <!-- 浮动按钮已移至各页标题栏右侧，此处不再渲染 -->
  </template>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { usePunchRecords } from '../composables/usePunchRecords';
import { usePeriodRecords } from '../composables/usePeriodRecords';
import { todayKey, formatDateDisplay, formatTime, diffDays } from '../utils/date';
import { parsePunchCsv, parsePeriodCsv } from '../utils/csv';

const props = defineProps({ show: { type: Boolean, default: undefined } });
const emit = defineEmits(['update:show']);

const route = useRoute();
const menuOpen = ref(false);
const sheetShow = computed({
  get: () => (props.show !== undefined ? props.show : menuOpen.value),
  set: (v) => {
    if (props.show !== undefined) emit('update:show', v);
    else menuOpen.value = v;
  },
});
const punchFileRef = ref(null);
const periodFileRef = ref(null);
const openConfirm = inject('openConfirm', (opts) => { if (opts?.onConfirm && confirm(opts.message)) opts.onConfirm(); });
const openRetroPunchModal = inject('openRetroPunchModal', () => {});
const openRetroPeriodModal = inject('openRetroPeriodModal', () => {});

const isRecord = computed(() => route.path === '/record');
const isPeriod = computed(() => route.path === '/period');
const showFab = computed(() => isRecord.value || isPeriod.value);

const { records, setRecords } = usePunchRecords();
const { periodRecords, setPeriodRecords } = usePeriodRecords();

const sheetActions = computed(() => {
  if (isRecord.value) {
    return [
      { name: '补一下～', key: 'retro' },
      { name: '导出数据', key: 'exportPunch' },
      { name: '导入数据', key: 'importPunch' },
      { name: '清空小本本', key: 'clearPunch', color: '#ee0a24' },
    ];
  }
  if (isPeriod.value) {
    return [
      { name: '补一下～', key: 'retroPeriod' },
      { name: '导出数据', key: 'exportPeriod' },
      { name: '导入数据', key: 'importPeriod' },
      { name: '清空姨妈记', key: 'clearPeriod', color: '#ee0a24' },
    ];
  }
  return [];
});

function closeMenu() {
  sheetShow.value = false;
}

function onSheetSelect({ key }) {
  if (key === 'retro') openRetroPunchModal();
  else if (key === 'retroPeriod') openRetroPeriodModal();
  else if (key === 'exportPunch') exportPunch();
  else if (key === 'importPunch') triggerImport();
  else if (key === 'clearPunch') clearPunch();
  else if (key === 'exportPeriod') exportPeriod();
  else if (key === 'importPeriod') triggerPeriodImport();
  else if (key === 'clearPeriod') clearPeriod();
}

function exportPunch() {
  sheetShow.value = false;
  if (!records.value.length) {
    showToast('还没打过我，没啥好导出的');
    return;
  }
  const header = ['类型', '日期时间'];
  const rows = records.value.map((r) => [
    getTypeLabel(r.type),
    `${formatDateDisplay(r.dateKey)} ${formatTime(r.timestamp)}`,
  ]);
  const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `打我记录-全部-${todayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  closeMenu();
  punchFileRef.value.value = '';
  punchFileRef.value.click();
}

function onPunchFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      let text = typeof reader.result === 'string' ? reader.result : '';
      text = text.replace(/^\uFEFF/, '');
      const parsed = parsePunchCsv(text);
      if (!parsed.length) {
        showToast('没解析到有效数据，确认下 CSV 是 类型、日期时间');
        return;
      }
      setRecords([...records.value, ...parsed].sort((a, b) => a.timestamp - b.timestamp));
      showToast('导入啦，共 ' + parsed.length + ' 条');
    } catch (err) {
      showToast('解析失败：' + (err.message || '请确认文件为本应用导出的 CSV'));
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function clearPunch() {
  sheetShow.value = false;
  if (!records.value.length) return;
  openConfirm({
    title: '清空小本本',
    message: '小本本会清空且找不回来哦，确定？',
    confirmButtonText: '清空',
    onConfirm: () => {
      setRecords([]);
      showToast('清空啦');
    },
  });
}

function getTypeLabel(type) {
  const map = { toilet: '如厕', meal: '饭否', fitness: '健身', other: '其他' };
  return map[type] || '其他';
}

function exportPeriod() {
  sheetShow.value = false;
  if (!periodRecords.value.length) {
    showToast('暂无经期数据可导出');
    return;
  }
  const header = ['开始日期', '结束日期', '天数'];
  const rows = [...periodRecords.value]
    .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))
    .map((p) => {
      const endDisplay = p.endDate ? formatDateDisplay(p.endDate) : '进行中';
      const days = p.endDate ? String(diffDays(p.startDate, p.endDate, true)) : '-';
      return [formatDateDisplay(p.startDate), endDisplay, days];
    });
  const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `经期记录-${todayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerPeriodImport() {
  sheetShow.value = false;
  periodFileRef.value.value = '';
  periodFileRef.value.click();
}

function onPeriodFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      let text = typeof reader.result === 'string' ? reader.result : '';
      text = text.replace(/^\uFEFF/, '');
      const parsed = parsePeriodCsv(text);
      if (!parsed.length) {
        showToast('未解析到有效经期数据，请确认 CSV 格式为：开始日期、结束日期、天数');
        return;
      }
      setPeriodRecords(
        [...periodRecords.value, ...parsed].sort((a, b) =>
          b.startDate > a.startDate ? 1 : -1
        )
      );
      showToast('导入啦，共 ' + parsed.length + ' 条');
    } catch (err) {
      showToast('解析失败：' + (err.message || '请确认文件为本应用导出的经期 CSV'));
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function clearPeriod() {
  closeMenu();
  if (!periodRecords.value.length) return;
  openConfirm({
    title: '清空姨妈记',
    message: '姨妈记会清空且找不回来哦，确定？',
    confirmButtonText: '清空',
    onConfirm: () => {
      setPeriodRecords([]);
      showToast('清空啦');
    },
  });
}

</script>
