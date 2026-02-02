<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <!-- 整体放大一点（绕画布中心缩放） -->
    <g transform="translate(48 48) scale(1.5) translate(-48 -48)">
      <!-- 马桶水箱 -->
      <rect x="26" y="22" rx="6" ry="6" width="28" height="22" fill="#FFFFFF" stroke="#B8C4FF" stroke-width="2"/>
      <!-- 水箱盖小点 -->
      <circle cx="50" cy="28" r="2" fill="#B8C4FF"/>

      <!-- 马桶座主体 -->
      <rect x="30" y="36" rx="10" ry="10" width="36" height="26" fill="#FFFFFF" stroke="#B8C4FF" stroke-width="2"/>

      <!-- 马桶内部水面 -->
      <ellipse cx="48" cy="50" rx="10" ry="7" fill="#D6E4FF"/>

      <!-- 可爱小表情：眼睛 -->
      <circle cx="40" cy="44" r="2" fill="#7D8FFF"/>
      <circle cx="56" cy="44" r="2" fill="#7D8FFF"/>
      <!-- 微笑嘴巴 -->
      <path d="M42 48 C 45 52, 51 52, 54 48" stroke="#FF9BB3" stroke-width="2" fill="none" stroke-linecap="round"/>

      <!-- 马桶底座 -->
      <path d="M36 62 H60 L56 74 H40 Z" fill="#FFFFFF" stroke="#B8C4FF" stroke-width="2"/>

      <!-- 一点点高光 -->
      <path d="M32 40 C34 36, 38 34, 42 34" stroke="#EDF1FF" stroke-width="3" fill="none" stroke-linecap="round"/>
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
