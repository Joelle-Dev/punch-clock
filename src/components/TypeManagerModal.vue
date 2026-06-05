<template>
  <BaseModal v-model:open="open" title="类型管理">
    <p class="type-manager-hint">新增和管理自定义类型，适合瑜伽、超慢跑、冥想等。</p>

    <div class="type-manager-list">
      <div v-for="(type, index) in typeList" :key="type.type" class="type-manager-item">
        <span class="type-manager-badge type-manager-emoji-badge">
          <span class="type-manager-emoji">{{ type.emoji || '✨' }}</span>
        </span>
        <span class="type-manager-label">{{ type.label }}</span>
        <div class="type-manager-order-actions">
          <button
            type="button"
            class="type-manager-order-button"
            :disabled="index === 0"
            @click="moveType(type.type, -1)"
            aria-label="上移"
          >
            ▲
          </button>
          <button
            type="button"
            class="type-manager-order-button"
            :disabled="index === typeList.length - 1"
            @click="moveType(type.type, 1)"
            aria-label="下移"
          >
            ▼
          </button>
        </div>
        <span v-if="type.custom || ['fitness','meal','other'].includes(type.type)" class="type-manager-action" @click="removeCustomType(type.type)">删除</span>
        <span v-else class="type-manager-built-in">内置</span>
      </div>
    </div>

    <van-field
      v-model="newLabel"
      label="名称"
      placeholder="例如 瑜伽"
      clearable
    />
    <van-field
      v-model="newEmoji"
      label="图标"
      placeholder="例如 🧘"
      clearable
    />

    <van-button type="primary" block round class="type-manager-submit" @click="onAdd">新增类型</van-button>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseModal from './BaseModal.vue';
import { usePunchTypes } from '../composables/usePunchTypes';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open', 'added']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const { typeList, addType, removeType, reorderType } = usePunchTypes();

const newLabel = ref('');
const newEmoji = ref('✨');

function removeCustomType(type) {
  removeType(type);
}

function moveType(type, direction) {
  reorderType(type, direction);
}

function onAdd() {
  const label = newLabel.value.trim();
  if (!label) {
    return;
  }
  const added = addType({ label, emoji: newEmoji.value || '✨' });
  if (added) {
    emit('added', added.type);
    newLabel.value = '';
    newEmoji.value = '✨';
  }
}
</script>

<style scoped>
.type-manager-hint {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 14px;
}
.type-manager-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}
.type-manager-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: var(--surface);
}
.type-manager-badge,
.type-manager-emoji-badge {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
}
.type-manager-emoji {
  font-size: 16px;
  line-height: 1;
}
.type-manager-label {
  flex: 1;
  font-size: 14px;
  color: var(--text);
}
.type-manager-order-actions {
  display: inline-flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  margin-right: 8px;
}
.type-manager-order-button {
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.type-manager-order-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.16);
  transform: translateY(-1px);
}
.type-manager-order-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.02);
}
.type-manager-action,
.type-manager-built-in {
  font-size: 12px;
  color: var(--text-3);
  white-space: nowrap;
}
.type-manager-action {
  cursor: pointer;
  color: var(--danger);
}
.type-manager-submit {
  margin-top: 4px;
}
</style>
