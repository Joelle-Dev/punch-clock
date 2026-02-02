<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <!-- 新版：大碗饭 + 筷子，更集中在底部，便于识别 -->
    <g transform="translate(48 52) scale(1.7) translate(-48 -52)">
      <!-- 饭碗外轮廓 -->
      <path
        d="M32 54
           C 32 50, 36 46, 48 46
           C 60 46, 64 50, 64 54
           C 64 58, 60 62, 48 62
           C 36 62, 32 58, 32 54 Z"
        fill="#FFFFFF"
        stroke="#E2C39B"
        stroke-width="2"
      />
      <!-- 碗底 -->
      <path
        d="M40 62
           C 41 64, 43 66, 48 66
           C 53 66, 55 64, 56 62"
        fill="#FFFFFF"
        stroke="#E2C39B"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- 米饭堆 -->
      <path
        d="M34 52
           C 36 46, 41 42, 48 42
           C 55 42, 60 46, 62 52
           C 58 54, 53 55.5, 48 56
           C 43 55.5, 38 54.5, 34 52 Z"
        fill="#FFFFFF"
        stroke="#F0E4D0"
        stroke-width="1.4"
      />
      <!-- 米粒高光 -->
      <path d="M40 47 C42.5 46,45 46,47.5 47" stroke="#F7EFE2" stroke-width="1.8" stroke-linecap="round" />
      <path d="M49 46.8 C51.5 46,54 46,56 47.2" stroke="#F7EFE2" stroke-width="1.8" stroke-linecap="round" />

      <!-- 蛋/豆腐块 -->
      <path
        d="M45 51.5
           C 47.3 50.8, 49.7 50.8, 52 51.7
           C 52.4 53, 52 54.2, 50.9 55.2
           C 49 55.5, 47.5 55.2, 46 54.2
           C 45.5 53.4, 45.3 52.5, 45 51.5 Z"
        fill="#FFE3A3"
        stroke="#F2C774"
        stroke-width="1"
      />

      <!-- 小菜叶子 -->
      <path
        d="M38 53
           C 36.5 52, 35.5 50.5, 36.3 49
           C 37.5 47.5, 39.3 47.4, 41 48.4
           C 42 50, 41.5 51.5, 40 52.8 Z"
        fill="#B7E08C"
        stroke="#8FBF63"
        stroke-width="1"
      />

      <!-- 筷子：右上方斜放，一部分在碗外 -->
      <g transform="rotate(-25 60 40)">
        <rect
          x="52"
          y="38"
          width="24"
          height="2.6"
          rx="1.3"
          fill="#F0B15A"
        />
        <rect
          x="54"
          y="35.6"
          width="24"
          height="2.6"
          rx="1.3"
          fill="#F0B15A"
        />
      </g>

      <!-- 碗上的可爱表情 -->
      <circle cx="44" cy="58" r="1.3" fill="#D0834A" />
      <circle cx="52" cy="58" r="1.3" fill="#D0834A" />
      <path
        d="M45.5 60.5 C 47 61.8, 49 61.8, 50.5 60.5"
        stroke="#FF6B9D"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
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
