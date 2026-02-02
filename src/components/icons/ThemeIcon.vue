<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <g transform="translate(48 48) scale(1.14) translate(-48 -48)">
      <!-- 调色盘主体 -->
      <path
        d="M48 22
           C 36 22, 26 31, 26 43
           C 26 55, 35 64, 45 64
           C 47 64, 49 63.5, 50.2 62.8
           C 52 61.8, 53 60.2, 53 58.5
           C 53 56.5, 51.7 55.2, 50 54.5
           C 47.5 53.4, 46 51, 46 48.5
           C 46 44.9, 48.9 42, 52.5 42
           L 54 42
           C 61 42, 66 37.2, 66 30.5
           C 66 25, 57.8 22, 48 22 Z"
        fill="#FFF7E8"
        stroke="#F0D4A8"
        stroke-width="2"
      />

      <!-- 调色盘上的色点 -->
      <circle cx="38" cy="34" r="3.2" fill="#FFB4C8" />
      <circle cx="34" cy="44" r="3.2" fill="#FFD36B" />
      <circle cx="40" cy="52" r="3.2" fill="#8ED3A6" />
      <circle cx="50" cy="32" r="3.2" fill="#8DC5FF" />

      <!-- 右侧小画笔 -->
      <g transform="translate(10, 6)">
        <!-- 笔杆 -->
        <rect
          x="52"
          y="32"
          width="4"
          height="18"
          rx="2"
          fill="#F0B15A"
        />
        <!-- 金属箍 -->
        <rect
          x="51.5"
          y="31"
          width="5"
          height="4"
          rx="2"
          fill="#E5E5EF"
        />
        <!-- 笔毛 -->
        <path
          d="M50 30
             C 52 26, 55 25, 58 26
             C 57.5 28.5, 56 30.5, 54 31.5
             C 52.5 31.8, 51 31.2, 50 30 Z"
          fill="#7E9BFF"
        />
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

