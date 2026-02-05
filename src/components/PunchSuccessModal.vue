<template>
  <BaseModal
    v-model:open="open"
    :show-close="false"
    inner-class="punch-success-modal-inner"
  >
    <div class="punch-success-header">
      <span class="punch-success-label">打卡成功</span>
    </div>
    <div class="punch-success-wave-wrap" aria-hidden="true">
      <div class="punch-success-wave punch-success-wave--main">
        <span
          v-for="idx in BAR_COUNT"
          :key="'main-' + idx"
          class="wave-bar"
          :style="{ transform: `scaleY(${barHeights[idx - 1]})` }"
        />
      </div>
      <div class="punch-success-wave punch-success-wave--mirror">
        <span
          v-for="idx in BAR_COUNT"
          :key="'mirror-' + idx"
          class="wave-bar wave-bar--mirror"
          :style="{ transform: `scaleY(${barHeights[idx - 1]})` }"
        />
      </div>
    </div>
    <div class="punch-success-message">{{ message }}</div>
    <div
      v-if="lyricsLines.length"
      class="punch-success-lyrics"
      ref="lyricsContainerRef"
    >
      <p
        v-for="(line, index) in lyricsLines"
        :key="index"
        class="punch-success-lyric-line"
        :class="{ 'punch-success-lyric-line--active': index === currentLyricIndex }"
      >
        {{ line }}
      </p>
    </div>
    <van-button
      type="primary"
      block
      round
      class="punch-success-btn"
      :class="{ 'punch-success-btn--breathing': isPlaying }"
      @click="close"
    >
      好哒
    </van-button>
    <p v-if="isAutoClosePending" class="punch-success-autoclose-hint">
      {{ autoCloseRemaining }} 秒后自动收起
    </p>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch, onUnmounted, nextTick } from 'vue';
import BaseModal from './BaseModal.vue';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/*$/, '') + '/';
const BAR_COUNT = 25;
const DEFAULT_BAR = 0.08;
const GAIN_BY_TYPE = { toilet: 1, meal: 1.9, fitness: 1.9 };
const PUNCH_TYPE_KEY = { toilet: 'paomo', meal: 'food', fitness: 'fitness' };
const LRC_TIME_TAG_REGEX = /\[(\d+):(\d+(?:\.\d+)?)\]/g;

function getUrlsByPunchType(punchType) {
  const key = PUNCH_TYPE_KEY[punchType] || 'paomo';
  const lrcFile = key === 'paomo' ? 'music2.lrc' : `music_${key}.lrc`;
  const soundPath = BASE + `music_${key}.mp3`;
  const lrcPath = BASE + lrcFile;
  const base = typeof document !== 'undefined' ? document.baseURI || window.location.origin + '/' : '';
  return {
    sound: base ? new URL(soundPath, base).href : soundPath,
    lrc: base ? new URL(lrcPath, base).href : lrcPath,
  };
}

const props = defineProps({
  open: Boolean,
  punchType: { type: String, default: 'fitness' },
  message: { type: String, default: '' },
  /** 用户点击时已 resume 的 AudioContext，用于移动端自动播放 */
  unlockedAudioContext: { type: Object, default: null },
});
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const barHeights = ref(Array(BAR_COUNT).fill(DEFAULT_BAR));
const lyricsContainerRef = ref(null);
const lyricsEntries = ref([]);
const lyricsLines = computed(() => lyricsEntries.value.map((e) => e.text));
const currentLyricIndex = ref(-1);

const AUTO_CLOSE_SECONDS = 3;
const isAutoClosePending = ref(false);
const autoCloseRemaining = ref(AUTO_CLOSE_SECONDS);
const isPlaying = ref(false);

let audioContext = null;
let analyser = null;
let rafId = null;
let sourceNode = null;
let lyricsIntervalId = null;
let startTime = null;
let autoCloseTimerId = null;

function parseLrc(text) {
  const result = [];
  const rawLines = text.split('\n');
  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line || /^\[(ti|ar|al|by|offset):/i.test(line)) continue;
    const times = [];
    let lastIndex = 0;
    let match;
    LRC_TIME_TAG_REGEX.lastIndex = 0;
    while ((match = LRC_TIME_TAG_REGEX.exec(line)) !== null) {
      times.push(Number(match[1] || 0) * 60 + Number(match[2] || 0));
      lastIndex = LRC_TIME_TAG_REGEX.lastIndex;
    }
    if (!times.length) continue;
    const textPart = line.slice(lastIndex).trim();
    if (!textPart) continue;
    times.forEach((t) => result.push({ time: t, text: textPart }));
  }
  result.sort((a, b) => a.time - b.time);
  return result;
}

async function ensureLyricsLoaded(lrcUrl) {
  if (!lrcUrl) return;
  try {
    const res = await fetch(lrcUrl);
    if (!res.ok) return;
    const text = await res.text();
    lyricsEntries.value = parseLrc(text);
  } catch (_) {
    lyricsEntries.value = [];
  }
}

function cancelAutoClose() {
  if (autoCloseTimerId != null) {
    clearInterval(autoCloseTimerId);
    autoCloseTimerId = null;
  }
  isAutoClosePending.value = false;
  autoCloseRemaining.value = AUTO_CLOSE_SECONDS;
}

function startAutoCloseCountdown() {
  cancelAutoClose();
  isAutoClosePending.value = true;
  autoCloseRemaining.value = AUTO_CLOSE_SECONDS;
  autoCloseTimerId = setInterval(() => {
    if (autoCloseRemaining.value <= 1) {
      cancelAutoClose();
      close();
    } else {
      autoCloseRemaining.value -= 1;
    }
  }, 1000);
}

function stopWave(options = {}) {
  const { keepLyrics = false } = options;
  isPlaying.value = false;
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (sourceNode) {
    try { sourceNode.disconnect(); } catch (_) {}
    sourceNode = null;
  }
  barHeights.value = Array(BAR_COUNT).fill(DEFAULT_BAR);
  if (lyricsIntervalId != null) {
    clearInterval(lyricsIntervalId);
    lyricsIntervalId = null;
  }
  if (!keepLyrics) {
    currentLyricIndex.value = -1;
    lyricsEntries.value = [];
  }
  startTime = null;
  analyser = null;
}

function updateBarsFromAnalyser() {
  if (!analyser) return;
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const n = BAR_COUNT;
  const step = Math.max(1, Math.floor(data.length / n));
  const next = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const start = i * step;
    const end = Math.min(start + step, data.length);
    for (let j = start; j < end; j++) sum += data[j];
    const avg = sum / (end - start);
    next.push(Math.min(1, (avg / 255) * 1.2 + 0.08));
  }
  barHeights.value = next;
  rafId = requestAnimationFrame(updateBarsFromAnalyser);
}

function startLyricsHighlight() {
  if (!audioContext || !lyricsEntries.value.length) return;
  startTime = audioContext.currentTime;
  if (lyricsIntervalId != null) {
    clearInterval(lyricsIntervalId);
    lyricsIntervalId = null;
  }
  const tick = () => {
    if (!audioContext || startTime == null) return;
    const elapsed = audioContext.currentTime - startTime;
    if (elapsed < 0) return;
    const list = lyricsEntries.value;
    let idx = list.length - 1;
    for (let i = 0; i < list.length; i++) {
      if (list[i].time <= elapsed) idx = i;
      else break;
    }
    if (idx !== currentLyricIndex.value) currentLyricIndex.value = idx;
  };
  tick();
  lyricsIntervalId = setInterval(tick, 200);
}

watch(currentLyricIndex, async () => {
  await nextTick();
  const container = lyricsContainerRef.value;
  if (!container) return;
  const active = container.querySelector('.punch-success-lyric-line--active');
  if (!active) return;
  active.scrollIntoView({ block: 'center', behavior: 'auto' });
});

async function startAudioAndWave() {
  stopWave();
  try {
    const { sound: soundUrl, lrc: lrcUrl } = getUrlsByPunchType(props.punchType);
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx =
      props.unlockedAudioContext && props.unlockedAudioContext.state !== 'closed'
        ? props.unlockedAudioContext
        : audioContext || new Ctx();
    audioContext = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    await ensureLyricsLoaded(lrcUrl);

    const res = await fetch(soundUrl);
    const buf = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(buf);

    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = decoded;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    const gainNode = ctx.createGain();
    gainNode.gain.value = GAIN_BY_TYPE[props.punchType] ?? 1;
    sourceNode.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(ctx.destination);

    sourceNode.onended = () => {
      stopWave({ keepLyrics: true });
      startAutoCloseCountdown();
    };
    sourceNode.start(0);

    isPlaying.value = true;
    cancelAutoClose();
    updateBarsFromAnalyser();
    startLyricsHighlight();
  } catch (err) {
    barHeights.value = Array(BAR_COUNT).fill(DEFAULT_BAR);
    console.error('[PunchSuccessModal] 音频加载或播放失败', { punchType: props.punchType, error: err });
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      startAudioAndWave();
    } else {
      stopWave();
      cancelAutoClose();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopWave();
  cancelAutoClose();
});

function close() {
  cancelAutoClose();
  emit('update:open', false);
}
</script>

<style scoped>
.punch-success-modal-inner {
  position: relative;
  width: 100%;
  max-width: 320px;
  background: linear-gradient(165deg, #fef6fb 0%, #fff 30%, #f8faff 70%, #f0f8ff 100%);
  border-radius: var(--radius-lg);
  box-shadow:
    0 16px 56px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.7) inset,
    0 1px 0 rgba(0, 0, 0, 0.04);
  padding: 24px 20px 24px;
  text-align: center;
  overflow: hidden;
  animation: punch-modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes punch-modal-in {
  0% { opacity: 0; transform: scale(0.88); }
  100% { opacity: 1; transform: scale(1); }
}

.punch-success-header {
  margin-bottom: 12px;
}

.punch-success-label {
  display: inline-block;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: 0.08em;
  opacity: 0.9;
  animation: label-in 0.5s ease-out forwards;
}

@keyframes label-in {
  0% { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 0.9; transform: translateY(0); }
}

.punch-success-wave-wrap {
  position: relative;
  height: 110px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.06));
}

.punch-success-wave {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 52px;
}

.punch-success-wave--main {
  margin-bottom: 4px;
}

.punch-success-wave--mirror {
  transform: scaleY(-1);
  opacity: 0.35;
  height: 48px;
}

.wave-bar {
  display: inline-block;
  width: 4px;
  height: 50px;
  border-radius: 3px;
  background: linear-gradient(to top, var(--primary), var(--primary-soft));
  transform-origin: center bottom;
  transition: transform 0.05s ease-out;
  opacity: 0.92;
}

.wave-bar--mirror {
  opacity: 0.4;
  background: linear-gradient(to top, var(--primary), transparent);
}

.punch-success-message {
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 20px;
  line-height: 1.5;
  padding: 0 4px;
}

.punch-success-lyrics {
  position: relative;
  z-index: 1;
  max-height: 120px;
  margin: 0 4px 16px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-2, #666);
  text-align: left;
  overflow-y: auto;
}

.punch-success-lyric-line + .punch-success-lyric-line {
  margin-top: 2px;
}

.punch-success-lyric-line--active {
  color: var(--primary);
  font-weight: 600;
}

.punch-success-btn {
  position: relative;
  z-index: 1;
  margin-top: 2px;
  transition: transform 0.35s ease-out, box-shadow 0.35s ease-out;
}

.punch-success-btn--breathing {
  animation: punch-breath 1.8s ease-in-out infinite;
}

@keyframes punch-breath {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(79, 70, 229, 0); }
  50% { transform: scale(1.04); box-shadow: 0 0 18px rgba(79, 70, 229, 0.25); }
}

.punch-success-autoclose-hint {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-2, #666);
  opacity: 0.8;
}
</style>
