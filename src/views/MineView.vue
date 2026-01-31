<template>
  <div class="tab-panel active mine-page">
    <header class="mine-header">
      <h1 class="mine-title">我呀</h1>
      <p class="mine-subtitle">设置与帮助</p>
    </header>
    <main class="mine-main">
      <section class="mine-card" aria-label="设置">
        <van-cell-group :border="false">
          <van-cell title="主题颜色" is-link @click="openTheme">
            <template #icon>
              <span class="mine-cell-icon" aria-hidden="true">🎨</span>
            </template>
          </van-cell>
          <van-cell title="使用帮助" is-link @click="openHelp">
            <template #icon>
              <span class="mine-cell-icon" aria-hidden="true">❓</span>
            </template>
          </van-cell>
          <van-cell title="关于" is-link @click="openAbout">
            <template #icon>
              <span class="mine-cell-icon" aria-hidden="true">ℹ️</span>
            </template>
          </van-cell>
        </van-cell-group>
      </section>
    </main>

    <!-- 关于 / 使用帮助 提示弹层 -->
    <van-popup
      v-model:show="contentOpen"
      position="center"
      round
      class="tip-popup"
      :z-index="9999"
    >
      <div class="tip-popup-inner">
        <h3 class="tip-popup-title">{{ contentTitle }}</h3>
        <div class="tip-modal-body" v-html="contentHtml"></div>
        <van-button type="primary" block round class="tip-modal-btn tip-modal-btn-theme" @click="contentOpen = false">
          好哒
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';

const openThemeModal = inject('openThemeModal', () => {});

const contentOpen = ref(false);
const contentTitle = ref('');
const contentHtml = ref('');

const ABOUT_HTML = `
  <p class="tip-line tip-intro">秋瑾宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`;

const HELP_HTML = `
  <div class="tip-section">
    <p class="tip-section-title">打我</p>
    <p class="tip-line">在主页选类型（如厕/饭否/健身/其他）后点「打我」按钮。可看今日次数、连续天数、成就和本月热力图。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">小本本</p>
    <p class="tip-line">底部「小本本」tab 可看全部记录，按时间、类型筛选，单条可删掉（有二次确认）。标题栏右侧 ⋯ 可补一刀、导出/导入/清空数据。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">姨妈记</p>
    <p class="tip-line">记经期「来的第一天」和「结束了」，可猜下次开始日期。标题栏右侧 ⋯ 可导出/导入/清空姨妈记数据。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">主题颜色</p>
    <p class="tip-line">上方「主题颜色」可自选颜色；在弹层中点击「重置为按星期自动」可恢复按星期（日～六）自动切换主题。</p>
  </div>
`;

function openTheme() {
  openThemeModal();
}

function openAbout() {
  contentTitle.value = '关于';
  contentHtml.value = ABOUT_HTML;
  contentOpen.value = true;
}

function openHelp() {
  contentTitle.value = '使用帮助';
  contentHtml.value = HELP_HTML;
  contentOpen.value = true;
}
</script>

<style scoped>
/* ---------- 头部（与记录/周期页统一） ---------- */
.mine-header {
  padding: 12px 16px 16px;
  background: var(--surface);
  box-shadow: var(--paper-shadow);
}
.mine-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}
.mine-subtitle {
  font-size: 13px;
  color: var(--text-3);
  margin: 0;
}

/* ---------- 主内容区 ---------- */
.mine-main {
  flex: 1;
  padding: 12px 16px 0;
  min-height: 0;
}

/* ---------- 设置卡片（便签感，与打卡区一致） ---------- */
.mine-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--note-shadow);
  border-left: 4px solid var(--primary-soft);
  overflow: hidden;
}
.mine-card :deep(.van-cell-group) {
  margin: 0;
}
.mine-card :deep(.van-cell) {
  padding: 14px 16px;
  background: var(--surface);
  color: var(--text);
  font-size: 15px;
}
.mine-card :deep(.van-cell::after) {
  border-color: var(--separator);
}
.mine-card :deep(.van-cell__right-icon) {
  color: var(--text-3);
}
.mine-cell-icon {
  font-size: 22px;
  margin-right: 12px;
  line-height: 1;
}

/* ---------- 关于/使用帮助弹层 ---------- */
.tip-popup :deep(.van-popup) {
  width: 90%;
  max-width: 320px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.tip-popup-inner {
  padding: 22px 20px 20px;
  background: linear-gradient(165deg, #fffaf8 0%, #fff 40%, #f8fafc 100%);
  box-shadow: 0 12px 40px rgba(80, 60, 40, 0.12);
}
.tip-popup-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 14px;
  text-align: center;
}
.tip-modal-body {
  line-height: 1.6;
  color: var(--text-2);
  font-size: 14px;
  margin-bottom: 18px;
  max-height: 58vh;
  overflow-y: auto;
}
.tip-modal-body :deep(.tip-line) {
  margin: 0 0 6px;
}
.tip-modal-body :deep(.tip-line:last-child) {
  margin-bottom: 0;
}
.tip-modal-body :deep(.tip-intro) {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}
.tip-modal-body :deep(.tip-desc) {
  color: var(--text-2);
  font-size: 14px;
}
.tip-modal-body :deep(.tip-version) {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 12px;
}
.tip-modal-body :deep(.tip-section) {
  margin-bottom: 14px;
}
.tip-modal-body :deep(.tip-section:last-child) {
  margin-bottom: 0;
}
.tip-modal-body :deep(.tip-section-title) {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  margin: 0 0 4px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-soft);
}
.tip-modal-btn {
  margin-top: 2px;
}
.tip-modal-btn-theme {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
.tip-modal-btn-theme:active {
  background: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}
</style>
