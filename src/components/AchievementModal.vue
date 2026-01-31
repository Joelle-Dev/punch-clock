<template>
  <BaseModal v-model:open="open" title="成就" inner-class="achievement-modal-inner">
    <van-cell-group inset>
      <van-cell
        v-for="a in achievements"
        :key="a.id"
        :class="{ locked: !unlockedList.includes(a.id) }"
        class="achievement-item"
      >
        <template #icon>
          <span class="achievement-icon">{{ a.icon }}</span>
        </template>
        <template #title>
          <span class="achievement-title">{{ a.title }}</span>
        </template>
        <template #label>
          <span class="achievement-desc">{{ a.desc }}</span>
        </template>
      </van-cell>
    </van-cell-group>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';
import { useAchievements } from '../composables/useAchievements';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { unlockedList, achievements } = useAchievements();
</script>

<style scoped>
.achievement-modal-inner {
  max-height: 80vh;
  overflow-y: auto;
}
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.achievement-item.locked {
  opacity: 0.6;
}
.achievement-item :deep(.achievement-icon) {
  font-size: 24px;
  margin-right: 12px;
}
.achievement-item :deep(.achievement-title) {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
.achievement-item :deep(.achievement-desc) {
  font-size: 12px;
  color: var(--text-3);
}
:deep(.van-cell-group) {
  margin: 0 -8px;
}
:deep(.van-cell) {
  background: var(--surface-2);
}
</style>
