<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-show="open"
        ref="backdropRef"
        class="modal-backdrop"
        :class="{ 'theme-modal': !!title }"
        role="dialog"
        :aria-modal="open"
        :aria-labelledby="title ? undefined : undefined"
        @click.self="close"
      >
        <div
          class="modal"
          :class="resolvedInnerClass"
          role="document"
          @click.stop
        >
        <template v-if="title">
          <div class="theme-modal-title" :id="titleId">{{ title }}</div>
        </template>
        <slot />
        <van-icon
          v-if="showClose"
          name="cross"
          class="theme-modal-close"
          aria-label="关闭"
          @click="close"
        />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  /** 标题，有则使用「主题弹窗」样式并显示关闭按钮 */
  title: { type: String, default: '' },
  /** 是否显示右上角关闭按钮，默认与 title 一致 */
  showClose: { type: Boolean, default: undefined },
  /** 内层 .modal 额外类名，如 punch-success-modal-inner */
  innerClass: { type: String, default: '' },
  /** 打开时是否锁定背景滚动 */
  lockScroll: { type: Boolean, default: true },
});

const emit = defineEmits(['update:open', 'close']);

const backdropRef = ref(null);
const titleId = computed(() => (props.title ? 'modal-title-' + Math.random().toString(36).slice(2, 9) : undefined));

const showClose = computed(() =>
  props.showClose !== undefined ? props.showClose : !!props.title
);

const resolvedInnerClass = computed(() => {
  if (props.title) return 'theme-modal-inner' + (props.innerClass ? ' ' + props.innerClass : '');
  return props.innerClass || '';
});

function close() {
  emit('update:open', false);
  emit('close');
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) close();
}

function lockBodyScroll(lock) {
  if (!props.lockScroll) return;
  const style = document.body.style;
  if (lock) {
    const scrollY = window.scrollY;
    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
  } else {
    const scrollY = Math.abs(parseInt(style.top || '0', 10));
    style.overflow = '';
    style.position = '';
    style.top = '';
    style.left = '';
    style.right = '';
    window.scrollTo(0, scrollY);
  }
}

watch(
  () => props.open,
  (v) => {
    lockBodyScroll(v);
    if (v) {
      nextTick(() => document.addEventListener('keydown', onKeydown));
    } else {
      document.removeEventListener('keydown', onKeydown);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  lockBodyScroll(false);
});
</script>

<style>
/* 基础弹层样式（BaseModal 使用，随弹层 chunk 按需加载） */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.modal-fade-enter-active .modal,
.modal-fade-leave-active .modal {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal,
.modal-fade-leave-to .modal {
  transform: scale(0.96);
  opacity: 0;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}
.modal-backdrop[hidden] {
  display: none !important;
}
.modal {
  width: 100%;
  max-width: 320px;
  background: var(--surface);
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 20px 20px 16px;
}
.theme-modal .modal {
  max-width: 320px;
  width: 90%;
}
.theme-modal-inner {
  position: relative;
  padding: 20px;
}
.theme-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}
.theme-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: var(--text-3);
  font-size: 22px;
  cursor: pointer;
}
.theme-modal-close:active {
  background: var(--surface-2);
}
.theme-modal-close.van-icon {
  font-size: 22px;
}
</style>
