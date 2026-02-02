<template>
  <BaseModal v-model:open="open" title="成就" inner-class="achievement-modal-inner" @close="onClose">
    <p v-if="unlockedAchievements.length" class="achievement-summary">已解锁 {{ unlockedAchievements.length }} 个～</p>
    <template v-if="unlockedAchievements.length">
      <div class="achievement-medals">
        <div
          v-for="a in unlockedAchievements"
          :key="a.id"
          class="achievement-medal"
          :class="{ 'is-new': newlyUnlockedIds.includes(a.id) }"
        >
          <div class="achievement-medal-circle">
            <span class="achievement-medal-icon">{{ a.icon }}</span>
            <span v-if="newlyUnlockedIds.includes(a.id)" class="achievement-medal-new">新</span>
          </div>
          <span class="achievement-medal-title">{{ a.title }}</span>
        </div>
      </div>
    </template>
    <div v-else class="achievement-empty">
      <p class="achievement-empty-hint">还没有解锁成就～</p>
      <p class="achievement-empty-desc">点「打我」或补录，达成条件即解锁～</p>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { useAchievements } from '../composables/useAchievements';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { unlockedList, achievements, newlyUnlockedIds, clearNewlyUnlocked } = useAchievements();

/** 只显示已解锁的成就，按成就列表顺序 */
const unlockedAchievements = computed(() =>
  achievements.filter((a) => unlockedList.value.includes(a.id))
);

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
.achievement-summary {
  font-size: 13px;
  color: var(--text-3);
  margin: 0 0 16px 0;
  padding: 0;
}
.achievement-medals {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 16px;
}
.achievement-medal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.achievement-medal-circle {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(145deg, var(--primary-soft) 0%, var(--surface-2) 100%);
  border: 2px solid var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.achievement-medal.is-new .achievement-medal-circle {
  border-color: var(--primary);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}
.achievement-medal-icon {
  font-size: 28px;
  line-height: 1;
}
.achievement-medal-new {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: var(--primary);
  padding: 2px 5px;
  border-radius: 6px;
}
.achievement-medal-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  text-align: center;
  line-height: 1.3;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.achievement-empty {
  padding: 24px 0;
  text-align: center;
}
.achievement-empty-hint {
  font-size: 14px;
  color: var(--text-2);
  margin: 0 0 8px 0;
}
.achievement-empty-desc {
  font-size: 12px;
  color: var(--text-3);
  margin: 0;
}
</style>
