<template>
  <BaseModal
    v-model:open="open"
    :show-close="false"
    inner-class="punch-success-modal-inner"
  >
    <div ref="celebrationRef" class="punch-success-celebration" aria-hidden="true" />
    <div class="punch-success-message">{{ message }}</div>
    <van-button type="primary" block round class="punch-success-btn" @click="close">好哒</van-button>
  </BaseModal>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({ open: Boolean, message: { type: String, default: '' } });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const celebrationRef = ref(null);
const symbols = ['♥', '✨', '★', '☆', '•', '♥', '✨', '★'];
const anims = ['celebrate-float', 'celebrate-twinkle', 'celebrate-rise'];
const colors = ['#ff6b9d', '#e84c7a', '#ffd700', '#ffb347', '#c2185b', '#f8bbd9'];

function fillCelebration() {
  if (!celebrationRef.value) return;
  celebrationRef.value.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const span = document.createElement('span');
    span.className = 'celebrate-item ' + anims[i % anims.length];
    span.textContent = symbols[i % symbols.length];
    span.style.left = Math.random() * 80 + 10 + '%';
    span.style.top = Math.random() * 80 + 10 + '%';
    span.style.animationDelay = Math.random() * 0.8 + 's';
    span.style.color = colors[i % colors.length];
    span.style.fontSize = 12 + Math.random() * 12 + 'px';
    celebrationRef.value.appendChild(span);
  }
}

function runCelebrationWhenReady() {
  nextTick(() => {
    requestAnimationFrame(() => {
      nextTick(() => {
        fillCelebration();
        setTimeout(fillCelebration, 80);
      });
    });
  });
}

function close() {
  emit('update:open', false);
}

watch(
  () => props.open,
  (v) => {
    if (v) runCelebrationWhenReady();
  },
  { immediate: true }
);
</script>

<style scoped>
.punch-success-modal-inner {
  position: relative;
  width: 100%;
  max-width: 300px;
  background: linear-gradient(160deg, #fff5f8 0%, #fff 40%, #fef9e7 100%);
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 24px 20px;
  text-align: center;
  overflow: hidden;
  animation: punch-modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes punch-modal-in {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}
.punch-success-celebration {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
}
:deep(.celebrate-item) {
  position: absolute;
  transform: translate(-50%, -50%);
  opacity: 0.9;
  animation-duration: 2.5s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
:deep(.celebrate-item.celebrate-float) { animation-name: celebrate-float; }
:deep(.celebrate-item.celebrate-twinkle) { animation-name: celebrate-twinkle; }
:deep(.celebrate-item.celebrate-rise) { animation-name: celebrate-rise; }
@keyframes celebrate-float {
  0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.85; }
  50% { transform: translate(-50%, -50%) scale(1.15) rotate(10deg); opacity: 1; }
}
@keyframes celebrate-twinkle {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}
@keyframes celebrate-rise {
  0% { opacity: 0.6; transform: translate(-50%, -50%) translateY(4px) scale(0.95); }
  50% { opacity: 1; transform: translate(-50%, -50%) translateY(-6px) scale(1.1); }
  100% { opacity: 0.6; transform: translate(-50%, -50%) translateY(4px) scale(0.95); }
}
.punch-success-message {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 20px;
  line-height: 1.4;
}
.punch-success-btn {
  position: relative;
  z-index: 1;
  margin-top: 4px;
}
</style>
