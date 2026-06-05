<template>
  <BaseModal v-model:open="open" title="补一下～">
    <p class="retro-punch-hint">选一下忘打我的那天、时间和类型呀～</p>

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
        <van-tab v-for="t in typeList" :key="t.type" :name="t.type" :title="t.label" />
      </van-tabs>
    </div>
    <div class="retro-punch-amount-section" v-if="currentType === 'toilet'">
      <span class="retro-punch-label">如厕量</span>
      <div class="retro-punch-amount-buttons">
        <button
          v-for="option in toiletAmountOptions"
          :key="option.value"
          type="button"
          :class="['retro-punch-amount-button', { 'retro-punch-amount-button--active': toiletAmount === option.value }]"
          @click="toiletAmount = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <van-button type="primary" block round class="retro-punch-submit" @click="onSubmit">
      补上～
    </van-button>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import BaseModal from './BaseModal.vue';
import { usePunchRecords } from '../composables/usePunchRecords';
import { useAchievements } from '../composables/useAchievements';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';
import { usePunchTypes } from '../composables/usePunchTypes';
import { dayjs, todayKey } from '../utils/date';
import { TOILET_AMOUNT_LABELS } from '../constants';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { records, addRecordAt } = usePunchRecords();
const { checkAll } = useAchievements();
const showAchievementToast = inject('showAchievementToast', () => {});
const { shouldSkipDueToDoubleTap } = useDoubleTapHint({
  messages: ['补上瘾啦？', '再补要收小费啦～', '手下留情嘛～'],
});

const { typeList } = usePunchTypes();

const toiletAmountOptions = Object.entries(TOILET_AMOUNT_LABELS).map(([value, label]) => ({ value, label }));
const DEFAULT_RETRO_TOILET_AMOUNT = 'normal';

const minDate = new Date(dayjs().subtract(1, 'year').valueOf());
const maxDate = new Date(dayjs().valueOf());

const selectedDate = ref('');
const selectedTime = ref('12:00');
const currentType = ref('toilet');
const toiletAmount = ref(DEFAULT_RETRO_TOILET_AMOUNT);
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
  toiletAmount.value = DEFAULT_RETRO_TOILET_AMOUNT;
}

watch(() => props.open, (v) => {
  if (v) initDefaults();
}, { immediate: true });

function onSubmit() {
  const [hh, mm] = (selectedTime.value || '12:00').split(':').map(Number);
  const d = dayjs(selectedDate.value).hour(hh || 0).minute(mm || 0).second(0).millisecond(0);
  if (!d.isValid()) return;
  const payload = currentType.value === 'toilet' ? { amount: toiletAmount.value } : {};
  addRecordAt(d, currentType.value, payload);
  emit('update:open', false);
  /* 补录后也检查成就，与「打我」一致 */
  setTimeout(() => {
    const newly = checkAll(records.value);
    newly.forEach((a) => showAchievementToast(a));
  }, 0);
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
.retro-punch-amount-section {
  margin: 16px 0 12px;
}
.retro-punch-amount-section .retro-punch-label {
  display: block;
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 8px;
}
.retro-punch-amount-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.retro-punch-amount-button {
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--separator);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}
.retro-punch-amount-button--active {
  border-color: var(--green);
  background: rgba(76, 175, 80, 0.12);
  color: var(--green);
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
