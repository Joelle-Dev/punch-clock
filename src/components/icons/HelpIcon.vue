<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <g transform="translate(48 48) scale(1.18) translate(-48 -48)">
      <!-- 便签式帮助卡片 -->
      <rect
        x="26"
        y="26"
        width="36"
        height="30"
        rx="8"
        fill="#FFFFFF"
        stroke="#D8E0FF"
        stroke-width="2"
      />
      <!-- 顶部小书签 -->
      <path
        d="M32 26 L40 26 L38 32 L36 30 L34 32 Z"
        fill="#FFCDDD"
      />
      <!-- 标题线 -->
      <path d="M34 34 H54" stroke="#C7D0FF" stroke-width="1.8" stroke-linecap="round" />
      <!-- 内容线 -->
      <path d="M34 39 H50" stroke="#E0E5FF" stroke-width="1.5" stroke-linecap="round" />
      <path d="M34 44 H48" stroke="#E0E5FF" stroke-width="1.5" stroke-linecap="round" />

      <!-- 右下角小问号圆 -->
      <circle cx="52" cy="48" r="6" fill="#F5F7FF" stroke="#C9D4FF" stroke-width="1.4" />
      <path
        d="M50.8 46.2
           C 50.8 45.2, 51.5 44.6, 52.5 44.6
           C 53.5 44.6, 54.2 45.2, 54.2 46.1
           C 54.2 46.8, 53.8 47.3, 53.3 47.6
           C 52.9 47.8, 52.7 48.1, 52.6 48.6"
        stroke="#8795FF"
        stroke-width="1.4"
        fill="none"
        stroke-linecap="round"
      />
      <circle cx="52.5" cy="50.4" r="0.9" fill="#8795FF" />

      <!-- 左下角小灯泡，表示“点我有提示” -->
      <g transform="translate(6, 4)">
        <path
          d="M34 44
             C 34 41, 36.5 39, 39.5 39
             C 42.5 39, 45 41, 45 44
             C 45 45.7, 44.2 46.9, 43.2 47.9"
          fill="#FFF8D6"
          stroke="#F2D58E"
          stroke-width="1.4"
        />
        <rect x="38" y="48" width="3" height="3.5" rx="1.2" fill="#F2D58E" />
        <rect x="37.5" y="51.2" width="4" height="1.4" rx="0.7" fill="#F2D58E" />
      </g>
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

