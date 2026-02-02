<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <!-- 回到第一版：圆环 + 上下箭头 -->
    <g transform="translate(48 48) scale(1.1) translate(-48 -48)">
      <!-- 圆环 -->
      <path
        d="M48 26
           C 38 26, 30 34, 30 44
           C 30 46, 30.4 48, 31 49.8"
        stroke="#8CC1FF"
        stroke-width="2.4"
        fill="none"
        stroke-linecap="round"
      />
      <path
        d="M48 62
           C 58 62, 66 54, 66 44
           C 66 42, 65.6 40, 65 38.2"
        stroke="#8CC1FF"
        stroke-width="2.4"
        fill="none"
        stroke-linecap="round"
      />

      <!-- 上方箭头 -->
      <path
        d="M30 32 L38 32"
        stroke="#8CC1FF"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <path
        d="M32 28 L30 32 L34 34"
        fill="none"
        stroke="#8CC1FF"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 下方箭头 -->
      <path
        d="M66 56 L58 56"
        stroke="#8CC1FF"
        stroke-width="2.4"
        stroke-linecap="round"
      />
      <path
        d="M64 60 L66 56 L62 54"
        fill="none"
        stroke="#8CC1FF"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 24,
  },
});
</script>

