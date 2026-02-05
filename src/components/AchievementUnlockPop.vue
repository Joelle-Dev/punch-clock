<template>
  <Teleport to="body">
    <Transition name="achievement-pop">
      <div
        v-if="achievement"
        class="achievement-unlock-pop-backdrop"
        :class="{ 'achievement-unlock-pop-backdrop--leaving': leaving }"
        @click="dismiss"
      >
        <div
          class="achievement-unlock-pop"
          :class="{ 'achievement-unlock-pop--visible': visible }"
          @click.stop
        >
          <div class="achievement-unlock-pop-glow" aria-hidden="true" />
          <div :key="achievement.id" class="achievement-unlock-pop-card">
            <span class="achievement-unlock-pop-icon">{{ achievement.icon }}</span>
            <p class="achievement-unlock-pop-wow">哇！</p>
            <p class="achievement-unlock-pop-title">{{ achievement.title }}</p>
            <p v-if="achievement.desc" class="achievement-unlock-pop-desc">{{ achievement.desc }}</p>
            <p class="achievement-unlock-pop-blessing">{{ blessingLine }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { playAchievementHaptic } from '../utils/feedback';

const BLESSING_LINES = [
  '你又进步了一点～',
  '真棒！',
  '继续保持呀',
  '闪闪发光',
  '小本本记得好好的',
];
function pickBlessing() {
  return BLESSING_LINES[Math.floor(Math.random() * BLESSING_LINES.length)];
}

const props = defineProps({
  achievement: { type: Object, default: null },
  duration: { type: Number, default: 2500 },
});
const emit = defineEmits(['dismiss']);

const blessingLine = computed(() => (props.achievement ? pickBlessing() : ''));

const visible = ref(false);
const leaving = ref(false);
let timer = null;
const LEAVE_MS = 260;

function dismiss() {
  if (timer) clearTimeout(timer);
  timer = null;
  visible.value = false;
  leaving.value = true;
  setTimeout(() => {
    emit('dismiss');
    leaving.value = false;
  }, LEAVE_MS);
}

watch(
  () => props.achievement,
  (a) => {
    if (timer) clearTimeout(timer);
    timer = null;
    if (!a) {
      visible.value = false;
      return;
    }
    visible.value = false;
    nextTick(() => {
      requestAnimationFrame(() => {
        visible.value = true;
        playAchievementHaptic();
        timer = setTimeout(dismiss, props.duration);
      });
    });
  },
  { immediate: true }
);
</script>

<style scoped>
.achievement-unlock-pop-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  transition: opacity 0.2s ease;
}
.achievement-unlock-pop-backdrop--leaving {
  opacity: 0;
}

.achievement-unlock-pop {
  position: relative;
  transform: scale(0.85);
  opacity: 0;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.achievement-unlock-pop--visible {
  transform: scale(1);
  opacity: 1;
}

.achievement-unlock-pop-glow {
  position: absolute;
  inset: -20px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(79, 70, 229, 0.2) 0%,
    rgba(79, 70, 229, 0.05) 50%,
    transparent 70%
  );
  pointer-events: none;
}

.achievement-unlock-pop-card {
  position: relative;
  min-width: 200px;
  max-width: 280px;
  padding: 28px 24px;
  border-radius: 20px;
  background: linear-gradient(165deg, #fefefe 0%, #f8faff 50%, #f0f4ff 100%);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset,
    0 0 0 2px rgba(79, 70, 229, 0.15);
  text-align: center;
}

.achievement-unlock-pop-icon {
  display: block;
  font-size: 48px;
  line-height: 1;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
}

.achievement-unlock-pop-wow {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 4px;
  letter-spacing: 0.02em;
}

.achievement-unlock-pop-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 6px;
}

.achievement-unlock-pop-desc {
  font-size: 12px;
  color: var(--text-3);
  margin: 0 0 4px;
  line-height: 1.4;
}

.achievement-unlock-pop-blessing {
  font-size: 12px;
  color: var(--primary);
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
}

/* 进入/离开 */
.achievement-pop-enter-active,
.achievement-pop-leave-active {
  transition: opacity 0.2s ease;
}
.achievement-pop-enter-from,
.achievement-pop-leave-to {
  opacity: 0;
}
.achievement-pop-enter-active .achievement-unlock-pop,
.achievement-pop-leave-active .achievement-unlock-pop {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.achievement-pop-leave-from .achievement-unlock-pop--visible,
.achievement-pop-leave-to .achievement-unlock-pop {
  transform: scale(0.92);
  opacity: 0;
}
</style>
