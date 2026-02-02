<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <!-- 整体放大一点（绕画布中心缩放） -->
    <g transform="translate(48 48) scale(1.18) translate(-48 -48)">
      <!-- 星星主体 -->
      <path
        d="M48 20 L52 36 L68 36 L56 46 L60 62 L48 52 L36 62 L40 46 L28 36 L44 36 Z"
        fill="#FFFFFF"
        stroke="#D4A3FF"
        stroke-width="2"
      />

      <!-- 内部小星星 -->
      <path
        d="M48 32 L49 40 L57 40 L51 44 L53 52 L48 48 L43 52 L45 44 L39 40 L47 40 Z"
        fill="#E8C5FF"
      />

      <!-- 可爱表情：眼睛 -->
      <circle cx="44" cy="42" r="2" fill="#B47FFF"/>
      <circle cx="52" cy="42" r="2" fill="#B47FFF"/>
      <!-- 微笑嘴巴 -->
      <path d="M46 46 C 47 49, 49 49, 50 46" stroke="#FF6B9D" stroke-width="2" fill="none" stroke-linecap="round"/>

      <!-- 小装饰点 -->
      <circle cx="30" cy="30" r="2" fill="#E8C5FF"/>
      <circle cx="66" cy="30" r="2" fill="#E8C5FF"/>
      <circle cx="30" cy="66" r="2" fill="#E8C5FF"/>
      <circle cx="66" cy="66" r="2" fill="#E8C5FF"/>
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
