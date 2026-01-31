<template>
  <BaseModal v-model:open="open" title="主题颜色">
    <div class="theme-modal-row">
      <label class="theme-label">自选颜色</label>
      <input
        v-model="colorHex"
        type="color"
        class="theme-color-input"
        title="选择主题色"
        @input="applyColor"
      />
    </div>
    <div class="theme-modal-actions">
      <van-button plain block class="theme-reset-btn" @click="resetTheme">重置为按星期自动</van-button>
    </div>
    <div class="theme-help-block">
      <p class="theme-help-title">使用说明</p>
      <p class="theme-help-text">默认按周一到周日自动切换七种柔和主题色。</p>
      <p class="theme-help-text">可在此选择自己喜欢的颜色，点击「重置为按星期自动」恢复。</p>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseModal from './BaseModal.vue';
import { saveTheme, applyCustomTheme, applyDayTheme } from '../composables/useTheme';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const colorHex = ref('#6B7FD7');

function applyColor() {
  applyCustomTheme(colorHex.value);
  saveTheme(colorHex.value);
}

function resetTheme() {
  saveTheme(null);
  applyDayTheme();
  emit('update:open', false);
}
</script>

<style scoped>
.theme-modal-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.theme-label {
  font-size: 14px;
  color: var(--text-2);
}
.theme-color-input {
  width: 56px;
  height: 40px;
  padding: 2px;
  border: 1px solid var(--separator);
  border-radius: var(--radius);
  cursor: pointer;
  background: var(--surface);
}
.theme-modal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.theme-reset-btn {
  flex: 1;
  color: var(--primary) !important;
  border-color: var(--primary) !important;
}
.theme-reset-btn:active {
  color: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
  background: var(--primary-soft) !important;
}
.theme-help-block {
  margin-top: 14px;
  padding: 12px;
  background: var(--surface-2);
  border-radius: var(--radius);
}
.theme-help-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 6px;
}
.theme-help-text {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
  margin-bottom: 4px;
}
.theme-help-text:last-child { margin-bottom: 0; }
</style>
