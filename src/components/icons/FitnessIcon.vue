<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ display: 'inline-block', verticalAlign: 'middle' }"
  >
    <!-- 整体放大一点（绕画布中心缩放） -->
    <g :transform="`translate(48 48) scale(1.6) translate(-48 -48)`">
      <!-- 更写实的弯举肌肉手臂（左侧） -->
      <g transform="translate(0, 4)">
        <!-- 上臂（肱二头肌） -->
        <path
          d="M28 54
             C 30 46, 36 40, 44 38
             C 50 36, 54 38, 56 42
             C 58 46, 56 50, 52 52
             C 48 54, 44 56, 40 58
             C 35 60, 30 60, 28 58
             Z"
          fill="#FFE0C2"
          stroke="#E2B194"
          stroke-width="2"
          stroke-linejoin="round"
        />

        <!-- 二头肌高光弧线 -->
        <path
          d="M34 50 C 40 46, 48 45, 53 48"
          stroke="#FFD2AE"
          stroke-width="2.2"
          fill="none"
          stroke-linecap="round"
        />

        <!-- 前臂 -->
        <path
          d="M38 56
             C 44 56, 50 54, 54 50
             C 56 48, 58 46, 60 46
             C 62 46, 64 48, 64 50
             C 64 52, 62 54, 60 55
             C 55 58, 48 60, 42 60
             C 40 60, 38 58, 38 56 Z"
          fill="#FFE0C2"
          stroke="#E2B194"
          stroke-width="2"
          stroke-linejoin="round"
        />

        <!-- 手腕束带（护腕） -->
        <rect
          x="56"
          y="46"
          width="8"
          height="6"
          rx="3"
          fill="#4D7CFF"
        />

        <!-- 拳头（更清晰的拳形） -->
        <path
          d="M60 40
             C 56 40, 54 42, 54 45
             L 54 50
             C 54 52, 56 54, 58 54
             L 62 54
             C 65 54, 68 52, 68 49
             C 68 46, 66 44, 64 44
             L 62 44
             C 62 42, 61 40, 60 40 Z"
          fill="#FFE0C2"
          stroke="#E2B194"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </g>

      <!-- 右上角：更写实一点的小哑铃，增强“力量训练”语义 -->
      <g transform="translate(0, 0) rotate(-15 66 26)">
        <!-- 杠杆 -->
        <rect
          x="58"
          y="24"
          width="16"
          height="4"
          rx="2"
          fill="#B7C4FF"
        />
        <!-- 左片 -->
        <rect
          x="54"
          y="22"
          width="4"
          height="8"
          rx="2"
          fill="#8FA1FF"
        />
        <!-- 右片 -->
        <rect
          x="74"
          y="22"
          width="4"
          height="8"
          rx="2"
          fill="#8FA1FF"
        />
      </g>

      <!-- 小表情：在下方，带点“练到爽”的感觉 -->
      <circle cx="50" cy="70" r="7.5" fill="#FFFFFF" stroke="#C8D0F8" stroke-width="1.5" />
      <!-- 眼睛（微微上挑） -->
      <path d="M47 68 Q48 67 49 68" stroke="#5A5A7A" stroke-width="1.4" fill="none" stroke-linecap="round" />
      <path d="M51 68 Q52 67 53 68" stroke="#5A5A7A" stroke-width="1.4" fill="none" stroke-linecap="round" />
      <!-- 嘴巴（满足的小微笑） -->
      <path
        d="M47.5 71 C 49 72.5, 51 72.5, 52.5 71"
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
