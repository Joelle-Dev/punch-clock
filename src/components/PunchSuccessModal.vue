<template>
  <BaseModal
    v-model:open="open"
    :show-close="false"
    inner-class="punch-success-modal-inner"
  >
    <!-- 打卡成功 + 音乐波浪（频谱 + 镜像） -->
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
    <!-- 歌词：按行显示，并根据播放进度高亮当前行 -->
    <div
      class="punch-success-lyrics"
      v-if="lyricsLines.length"
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
    <van-button type="primary" block round class="punch-success-btn" @click="close">好哒</van-button>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch, onUnmounted, nextTick } from 'vue';
import BaseModal from './BaseModal.vue';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/*$/, '') + '/';
const BAR_COUNT = 25;
const DEFAULT_BAR = 0.08;
/** 饭否/健身默认音量放大倍数，如厕/其他为 1 */
const GAIN_BY_TYPE = { toilet: 1, meal: 1.5, fitness: 1.5, other: 1 };

/** 打卡类型 -> 资源 key：如厕/其他=paomo，饭否=food，健身=fitness */
const PUNCH_TYPE_KEY = { toilet: 'paomo', meal: 'food', fitness: 'fitness', other: 'paomo' };

function getUrlsByPunchType(punchType) {
  const key = PUNCH_TYPE_KEY[punchType] || 'paomo';
  const lrcFile = key === 'paomo' ? 'music2.lrc' : `music_${key}.lrc`;
  return { sound: BASE + `music_${key}.mp3`, lrc: BASE + lrcFile };
}

const props = defineProps({
  open: Boolean,
  /** 本次打卡类型：toilet=如厕(paomo) / meal=饭否(food) / fitness=健身(fitness) / other=其他(paomo) */
  punchType: { type: String, default: 'fitness' },
  message: { type: String, default: '' },
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

let audioContext = null;
let analyser = null;
let rafId = null;
let sourceNode = null;
let lyricsIntervalId = null;
let startTime = null;
let trackDuration = null;

function parseLrc(text) {
  const rawLines = text.split('\n');
  const result = [];

  for (const raw of rawLines) {
    const line = raw.trim();
    if (!line || /^\[(ti|ar|al|by|offset):/i.test(line)) continue;

    // 匹配一个或多个时间标签，例如 [00:12.34][00:15.00]歌词
    const timeTagRegex = /\[(\d+):(\d+(?:\.\d+)?)\]/g;
    let match;
    const times = [];
    let lastIndex = 0;

    while ((match = timeTagRegex.exec(line)) !== null) {
      const min = Number(match[1] || 0);
      const sec = Number(match[2] || 0);
      times.push(min * 60 + sec);
      lastIndex = timeTagRegex.lastIndex;
    }

    if (!times.length) continue;

    const textPart = line.slice(lastIndex).trim();
    if (!textPart) continue;

    times.forEach((t) => {
      result.push({ time: t, text: textPart });
    });
  }

  // 按时间排序，保证递增
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

function stopWave() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (sourceNode) {
    try {
      sourceNode.disconnect();
    } catch (_) {}
    sourceNode = null;
  }
  barHeights.value = Array(BAR_COUNT).fill(0.08);

  if (lyricsIntervalId != null) {
    clearInterval(lyricsIntervalId);
    lyricsIntervalId = null;
  }
  currentLyricIndex.value = -1;
  trackDuration = null;
  startTime = null;
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

  // 用定时器约每 200ms 检查一次，避免每帧更新导致卡顿；仅当当前行变化时才更新 ref 并触发滚动
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
    if (idx !== currentLyricIndex.value) {
      currentLyricIndex.value = idx;
    }
  };

  tick();
  lyricsIntervalId = setInterval(tick, 200);
}

// 歌词高亮变化时，自动滚动到可视区域中间（用 auto 减少滚动动画带来的卡顿）
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

    const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
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

    sourceNode.onended = () => stopWave();
    sourceNode.start(0);

    updateBarsFromAnalyser();
    startLyricsHighlight();
  } catch (_) {
    barHeights.value = Array(BAR_COUNT).fill(DEFAULT_BAR);
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) startAudioAndWave();
    else stopWave();
  },
  { immediate: true }
);

onUnmounted(stopWave);

function close() {
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
}
</style>
