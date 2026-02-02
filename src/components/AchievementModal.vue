<template>
  <BaseModal v-model:open="open" title="成就" inner-class="achievement-modal-inner" @close="onClose">
    <div v-for="group in achievementsByCategory" :key="group.category" class="achievement-group">
      <h3 class="achievement-group-title">{{ group.label }}</h3>
      <van-cell-group inset>
        <van-cell
          v-for="a in group.list"
          :key="a.id"
          :class="{ locked: !unlockedList.includes(a.id), 'is-new': newlyUnlockedIds.includes(a.id) }"
          class="achievement-item"
        >
          <template #icon>
            <span class="achievement-icon">{{ a.icon }}</span>
          </template>
          <template #title>
            <span class="achievement-title">{{ displayTitle(a) }}</span>
            <span v-if="newlyUnlockedIds.includes(a.id)" class="achievement-new-badge">新</span>
          </template>
          <template #label>
            <span class="achievement-desc">{{ displayDesc(a) }}</span>
            <template v-if="!unlockedList.includes(a.id) && a.getProgress && progress(a)">
              <span class="achievement-progress">{{ progress(a).current }} / {{ progress(a).target }}</span>
            </template>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { useAchievements } from '../composables/useAchievements';
import { usePunchRecords } from '../composables/usePunchRecords';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { unlockedList, achievementsByCategory, newlyUnlockedIds, clearNewlyUnlocked } = useAchievements();
const { records } = usePunchRecords();

function displayTitle(a) {
  const isLocked = !unlockedList.value.includes(a.id);
  if (a.hidden && isLocked) return '？？？';
  return a.title;
}

function displayDesc(a) {
  const isLocked = !unlockedList.value.includes(a.id);
  if (a.hidden && isLocked) return '解锁后可见～';
  return a.desc;
}

function progress(a) {
  if (!a.getProgress) return null;
  const p = a.getProgress(records.value);
  return p && typeof p.current === 'number' && typeof p.target === 'number' ? p : null;
}

function onClose() {
  clearNewlyUnlocked();
}

watch(() => props.open, (v) => {
  if (!v) clearNewlyUnlocked();
});
</script>

<style scoped>
.achievement-modal-inner {
  max-height: 80vh;
  overflow-y: auto;
}
.achievement-group {
  margin-bottom: 16px;
}
.achievement-group:last-child {
  margin-bottom: 0;
}
.achievement-group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-3);
  margin: 0 0 8px 12px;
  padding: 0;
}
.achievement-item.locked {
  opacity: 0.75;
}
.achievement-item.is-new {
  background: var(--primary-soft);
}
.achievement-item :deep(.van-cell__title) {
  display: flex;
  align-items: center;
  gap: 6px;
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
.achievement-new-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: 4px;
}
.achievement-item :deep(.achievement-desc) {
  font-size: 12px;
  color: var(--text-3);
  display: block;
}
.achievement-progress {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
  display: block;
}
:deep(.van-cell-group) {
  margin: 0 -8px;
}
:deep(.van-cell) {
  background: var(--surface-2);
}
</style>
