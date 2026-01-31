<template>
  <BaseModal v-model:open="open" title="补一刀">
    <p class="retro-punch-hint">选一下忘打我的那天、时间和类型</p>

    <van-field
      :model-value="dateDisplay"
      label="日期"
      readonly
      is-link
      placeholder="选择日期"
      @click="showDatePicker = true"
    />
    <van-field
      :model-value="selectedTime"
      label="时间"
      readonly
      is-link
      placeholder="选择时间"
      @click="showTimePicker = true"
    />

    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        :model-value="datePickerValue"
        :min-date="minDate"
        :max-date="maxDate"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <van-time-picker
        :model-value="timePickerValue"
        title="选择时间"
        @confirm="onTimeConfirm"
        @cancel="showTimePicker = false"
      />
    </van-popup>

    <div class="retro-punch-type-section">
      <span class="retro-punch-label">类型</span>
      <van-tabs v-model:active="currentType" type="card" shrink class="retro-punch-type-tabs">
        <van-tab v-for="t in typeTabs" :key="t.type" :name="t.type" :title="t.label" />
      </van-tabs>
    </div>
    <van-button type="primary" block round class="retro-punch-submit" @click="onSubmit">
      补录
    </van-button>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { usePunchRecords } from '../composables/usePunchRecords';
import { dayjs, todayKey } from '../utils/date';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { addRecordAt } = usePunchRecords();
const { shouldSkipDueToDoubleTap } = useDoubleTapHint({
  messages: ['补录上瘾了？', '再补要收费了～', '手下留情～'],
});

const typeTabs = [
  { type: 'toilet', label: '如厕' },
  { type: 'meal', label: '饭否' },
  { type: 'fitness', label: '健身' },
  { type: 'other', label: '其他' },
];

const minDate = new Date(dayjs().subtract(1, 'year').valueOf());
const maxDate = new Date(dayjs().valueOf());

const selectedDate = ref('');
const selectedTime = ref('12:00');
const currentType = ref('toilet');
const showDatePicker = ref(false);
const showTimePicker = ref(false);

const dateDisplay = computed(() => {
  if (!selectedDate.value) return '';
  return dayjs(selectedDate.value).format('YYYY年M月D日');
});

const datePickerValue = computed(() => {
  if (!selectedDate.value) return [];
  const d = dayjs(selectedDate.value);
  return [String(d.year()), String(d.month() + 1), String(d.date())];
});

const timePickerValue = computed(() => {
  const [h, m] = (selectedTime.value || '12:00').split(':').map(Number);
  return [String(h || 0), String(m || 0)];
});

function onDateConfirm({ selectedValues } = {}) {
  const vals = selectedValues || [];
  if (vals.length >= 3) {
    const [y, m, d] = vals.map(Number);
    selectedDate.value = dayjs().year(y).month(m - 1).date(d).format('YYYY-MM-DD');
  }
  showDatePicker.value = false;
}

function onTimeConfirm({ selectedValues } = {}) {
  const vals = selectedValues || [];
  if (vals.length >= 2) {
    selectedTime.value = `${String(vals[0]).padStart(2, '0')}:${String(vals[1]).padStart(2, '0')}`;
  }
  showTimePicker.value = false;
}

function initDefaults() {
  selectedDate.value = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  selectedTime.value = '12:00';
  currentType.value = 'toilet';
}

watch(() => props.open, (v) => {
  if (v) initDefaults();
}, { immediate: true });

function onSubmit() {
  const [hh, mm] = (selectedTime.value || '12:00').split(':').map(Number);
  const d = dayjs(selectedDate.value).hour(hh || 0).minute(mm || 0).second(0).millisecond(0);
  if (!d.isValid()) return;
  addRecordAt(d, currentType.value);
  emit('update:open', false);
}
</script>

<style scoped>
.retro-punch-hint {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 16px;
  line-height: 1.4;
}
.retro-punch-type-section {
  margin: 16px 0 20px;
}
.retro-punch-type-section .retro-punch-label {
  display: block;
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 8px;
}
.retro-punch-type-tabs {
  margin-bottom: 0;
}
/* 类型 tab 跟随系统主题色 */
:deep(.retro-punch-type-tabs.van-tabs),
:deep(.retro-punch-type-tabs) {
  --van-tabs-default-color: var(--primary);
  --van-tab-text-color: var(--text-2);
  --van-tab-active-text-color: #fff;
  --van-tab-active-background: var(--primary);
}
:deep(.retro-punch-type-tabs .van-tab.van-tab--active) {
  background: var(--primary) !important;
  color: #fff !important;
}
.retro-punch-submit {
  margin-top: 8px;
}
/* 补录按钮跟随系统主题色（Vant 读 --van-primary-color） */
:deep(.retro-punch-submit.van-button--primary) {
  --van-primary-color: var(--primary);
  --van-button-primary-background: var(--primary);
  --van-button-primary-border-color: var(--primary);
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
:deep(.retro-punch-submit.van-button--primary:active) {
  background: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}
:deep(.van-cell) {
  background: var(--surface);
}
:deep(.van-field__control) {
  color: var(--text);
}
/* 日期/时间选择器确认按钮跟随系统主题色 */
:deep(.van-picker__confirm) {
  color: var(--primary) !important;
}
</style>
