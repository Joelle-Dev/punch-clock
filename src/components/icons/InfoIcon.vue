<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <g transform="translate(48 48) scale(1.18) translate(-48 -48)">
      <!-- 卡片主体：表示“关于这个小应用” -->
      <rect
        x="28"
        y="26"
        width="40"
        height="32"
        rx="8"
        fill="#FFFFFF"
        stroke="#C8E0FF"
        stroke-width="2"
      />

      <!-- 顶部标题条 -->
      <rect x="28" y="26" width="40" height="8" rx="8" fill="#F3F6FF" />
      <circle cx="32" cy="30" r="1.4" fill="#FFADAD" />
      <circle cx="36" cy="30" r="1.4" fill="#FFD6A5" />
      <circle cx="40" cy="30" r="1.4" fill="#B1E5FF" />

      <!-- 左侧是一个小头像 -->
      <circle cx="36" cy="42" r="5" fill="#FFEFF4" stroke="#F2B7C6" stroke-width="1.4" />
      <circle cx="34.8" cy="41.5" r="0.9" fill="#5A4A4A" />
      <circle cx="37.2" cy="41.5" r="0.9" fill="#5A4A4A" />
      <path
        d="M34.8 43.6 C 35.7 44.4, 36.7 44.4, 37.6 43.6"
        stroke="#FF7FA5"
        stroke-width="1.1"
        fill="none"
        stroke-linecap="round"
      />

      <!-- 右侧是信息块 + 小写 i -->
      <circle cx="54" cy="40" r="5.5" fill="#F5FAFF" stroke="#C8E0FF" stroke-width="1.4" />
      <circle cx="54" cy="38" r="1.5" fill="#4D8BFF" />
      <path
        d="M52.6 40.8 L55.4 40.8 L55.4 45"
        stroke="#4D8BFF"
        stroke-width="1.8"
        stroke-linecap="round"
      />
      <path
        d="M52.8 45.6 C 53.6 46.3, 54.4 46.3, 55.2 45.6"
        stroke="#4D8BFF"
        stroke-width="1.4"
        fill="none"
        stroke-linecap="round"
      />

      <!-- 下方两行简介线 -->
      <path d="M32 50 H60" stroke="#E0E7FF" stroke-width="1.4" stroke-linecap="round" />
      <path d="M32 54 H50" stroke="#E0E7FF" stroke-width="1.4" stroke-linecap="round" />

      <!-- 右上角小心心 -->
      <path
        d="M58 32
           C 58 30.5, 59.1 29.5, 60.3 29.5
           C 61 29.5, 61.7 29.8, 62.1 30.4
           C 62.5 29.8, 63.2 29.5, 63.9 29.5
           C 65.1 29.5, 66.2 30.5, 66.2 32
           C 66.2 33.7, 64.8 35, 62.7 36.5
           C 60.6 35, 58 33.7, 58 32 Z"
        fill="#FFB4C8"
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

