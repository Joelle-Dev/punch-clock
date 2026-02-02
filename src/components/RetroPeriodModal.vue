<template>
  <BaseModal v-model:open="open" title="补一下～">
    <p class="retro-period-hint">选一下忘记记的那次开始、结束日期呀～</p>

    <van-field
      :model-value="startDateDisplay"
      label="开始日期"
      readonly
      is-link
      placeholder="选择开始日期"
      @click="showStartPicker = true"
    />
    <van-field
      :model-value="endDateDisplay"
      label="结束日期"
      readonly
      is-link
      placeholder="选填，不选表示进行中"
      @click="showEndPicker = true"
    />

    <van-popup v-model:show="showStartPicker" position="bottom" round>
      <van-date-picker
        :model-value="startPickerValue"
        :min-date="minDate"
        :max-date="maxDate"
        title="选择开始日期"
        @confirm="onStartConfirm"
        @cancel="showStartPicker = false"
      />
    </van-popup>
    <van-popup v-model:show="showEndPicker" position="bottom" round>
      <van-date-picker
        :model-value="endPickerValue"
        :min-date="endMinDate"
        :max-date="maxDate"
        title="选择结束日期"
        @confirm="onEndConfirm"
        @cancel="showEndPicker = false"
      />
    </van-popup>

    <van-button type="primary" block round class="retro-period-submit" @click="onSubmit">
      补上～
    </van-button>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { showToast } from 'vant';
import BaseModal from './BaseModal.vue';
import { usePeriodRecords } from '../composables/usePeriodRecords';
import { useDoubleTapHint } from '../composables/useDoubleTapHint';
import { dayjs, todayKey } from '../utils/date';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { addPeriodAt, formatDateDisplay } = usePeriodRecords();
const { shouldSkipDueToDoubleTap } = useDoubleTapHint({
  messages: ['补上瘾啦？', '再补要收小费啦～', '手下留情嘛～'],
});

const minDate = new Date(dayjs().subtract(2, 'year').valueOf());
const maxDate = new Date(dayjs().valueOf());

const selectedStart = ref('');
const selectedEnd = ref('');
const showStartPicker = ref(false);
const showEndPicker = ref(false);

const startDateDisplay = computed(() => {
  if (!selectedStart.value) return '';
  return formatDateDisplay(selectedStart.value);
});

const endDateDisplay = computed(() => {
  if (!selectedEnd.value) return '';
  return formatDateDisplay(selectedEnd.value);
});

const startPickerValue = computed(() => {
  if (!selectedStart.value) return [];
  const d = dayjs(selectedStart.value);
  return [String(d.year()), String(d.month() + 1), String(d.date())];
});

const endPickerValue = computed(() => {
  if (!selectedEnd.value) return [];
  const d = dayjs(selectedEnd.value);
  return [String(d.year()), String(d.month() + 1), String(d.date())];
});

const endMinDate = computed(() => {
  if (!selectedStart.value) return minDate;
  return new Date(dayjs(selectedStart.value).valueOf());
});

watch(
  () => props.open,
  (v) => {
    if (v) {
      selectedStart.value = '';
      selectedEnd.value = '';
    }
  }
);

function onStartConfirm({ selectedValues } = {}) {
  const vals = selectedValues || [];
  if (vals.length >= 3) {
    const [y, m, d] = vals.map(Number);
    selectedStart.value = dayjs().year(y).month(m - 1).date(d).format('YYYY-MM-DD');
  }
  showStartPicker.value = false;
}

function onEndConfirm({ selectedValues } = {}) {
  const vals = selectedValues || [];
  if (vals.length >= 3) {
    const [y, m, d] = vals.map(Number);
    selectedEnd.value = dayjs().year(y).month(m - 1).date(d).format('YYYY-MM-DD');
  }
  showEndPicker.value = false;
}

function onSubmit() {
  if (shouldSkipDueToDoubleTap()) return;
  if (!selectedStart.value) {
    showToast('选一下开始日期呀～');
    return;
  }
  if (selectedEnd.value && selectedEnd.value < selectedStart.value) {
    showToast('结束日期不能早于开始日期～');
    return;
  }
  addPeriodAt(selectedStart.value, selectedEnd.value || null);
  emit('update:open', false);
  showToast('记好啦');
}
</script>

<style scoped>
.retro-period-hint {
  font-size: 13px;
  color: var(--text-3);
  margin: 0 0 12px 0;
  padding: 0;
}
.retro-period-submit {
  margin-top: 16px;
}
</style>
