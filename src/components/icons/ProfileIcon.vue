<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <!-- 小女孩头像：圆脸 + 刘海 + 小辫子 -->
    <g
      :transform="innerTransform"
      :stroke="strokeColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    >
      <!-- 头发顶部 -->
      <path
        d="M34 36
           C 36 30, 41 27, 48 27
           C 55 27, 60 30, 62 36"
        stroke-width="3"
      />

      <!-- 两侧小辫子 -->
      <path
        d="M35 38
           C 32.5 39.5, 32 42, 33 44.5"
        stroke-width="2.6"
      />
      <path
        d="M61 38
           C 63.5 39.5, 64 42, 63 44.5"
        stroke-width="2.6"
      />

      <!-- 圆脸 -->
      <circle
        cx="48"
        cy="40"
        r="10"
        stroke-width="3"
      />

      <!-- 眼睛 -->
      <circle cx="44" cy="39" r="1.2" :fill="strokeColor" stroke="none" />
      <circle cx="52" cy="39" r="1.2" :fill="strokeColor" stroke="none" />

      <!-- 嘴巴 -->
      <path
        d="M44.5 42.5
           C 46 44, 50 44, 51.5 42.5"
        stroke-width="2.2"
      />

      <!-- 鼻子 -->
      <circle cx="48" cy="41" r="0.7" :fill="strokeColor" stroke="none" />

      <!-- 颈部 -->
      <path
        d="M45.3 48
           C 45.7 49, 46.7 49.7, 48 49.7
           C 49.3 49.7, 50.3 49, 50.7 48"
        stroke-width="2"
      />

      <!-- 衣领 -->
      <path
        d="M40 54
           L44 50.2
           L48 54
           L52 50.2
           L56 54"
        stroke-width="2.4"
      />

      <!-- 肩膀 -->
      <path
        d="M38 56
           C 42 57.5, 54 57.5, 58 56"
        stroke-width="2.4"
      />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  size: {
    type: [Number, String],
    default: 24,
  },
  // 使用场景：'cell' = 我的名字；'tab' = 底部「我呀」
  variant: {
    type: String,
    default: 'cell',
  },
});

// 线条颜色：
// - tab 场景：跟随 currentColor，这样底部 Tab 高亮/未高亮颜色由 TabBar 控制
// - cell 场景：直接用主题主色
const strokeColor = computed(() =>
  props.variant === 'tab' ? 'currentColor' : 'var(--primary, #222222)',
);

const innerTransform = computed(() => {
  // 以 0-96 viewBox 为坐标
  if (props.variant === 'tab') {
    // 底部 Tab：略往下、放得更满
    return 'translate(48 66) scale(2.4) translate(-48 -48)';
  }
  // 我的名字：略小一点，居中一些
  return 'translate(48 52) scale(2) translate(-48 -48)';
});
</script>

