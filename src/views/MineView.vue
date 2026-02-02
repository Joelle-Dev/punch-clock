<template>
  <div class="tab-panel active mine-page">
    <header class="mine-header">
      <h1 class="mine-title">我呀</h1>
      <p class="mine-subtitle">设置与帮助</p>
    </header>
    <main class="mine-main">
      <section class="mine-card" aria-label="设置">
        <van-cell-group :border="false">
          <van-cell title="我的名字" is-link @click="openNameEdit">
            <template #icon>
              <span class="mine-cell-icon" aria-hidden="true">✏️</span>
            </template>
            <template #value>
              <span class="mine-cell-value">{{ displayUserName }}</span>
            </template>
          </van-cell>
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
          <van-cell
            v-if="hasServiceWorker"
            title="检查更新"
            is-link
            @click="checkForUpdate"
          >
            <template #icon>
              <span class="mine-cell-icon" aria-hidden="true">🔄</span>
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

    <!-- 我的名字编辑 -->
    <van-popup
      v-model:show="nameEditOpen"
      position="center"
      round
      class="name-edit-popup"
      :style="{ width: '85%', maxWidth: '320px' }"
    >
      <div class="name-edit-inner">
        <h3 class="name-edit-title">我的名字</h3>
        <van-field
          v-model="nameEditValue"
          placeholder="输入你的名字～"
          maxlength="6"
          show-word-limit
          clearable
          class="name-edit-field"
        />
        <div class="name-edit-actions">
          <van-button block round class="name-edit-btn" @click="resetName">重置为默认</van-button>
          <van-button type="primary" block round class="name-edit-btn" @click="saveName">保存</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { showToast } from 'vant';

const DEFAULT_DISPLAY_NAME = '潘秋瑾';
const userName = inject('userName', ref(''));
const setUserName = inject('setUserName', () => {});

const displayUserName = computed(() => (userName.value && userName.value.trim()) ? userName.value.trim() : DEFAULT_DISPLAY_NAME);

const nameEditOpen = ref(false);
const nameEditValue = ref('');

function openNameEdit() {
  nameEditValue.value = (userName.value && userName.value.trim()) ? userName.value.trim() : '';
  nameEditOpen.value = true;
}

function saveName() {
  const v = nameEditValue.value ? nameEditValue.value.trim() : '';
  setUserName(v);
  nameEditOpen.value = false;
  showToast(v ? '保存啦～' : '已清空，将使用默认名字');
}

function resetName() {
  nameEditValue.value = '';
  setUserName('');
  nameEditOpen.value = false;
  showToast('已重置为默认名字～');
}

const openThemeModal = inject('openThemeModal', () => {});

const hasServiceWorker = computed(() => typeof navigator !== 'undefined' && 'serviceWorker' in navigator);

function checkForUpdate() {
  if (!hasServiceWorker.value) return;
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg) reg.update();
    showToast('正在检查更新，如有新版本将提示刷新');
  });
}

const contentOpen = ref(false);
const contentTitle = ref('');
const contentHtml = ref('');

function getAboutHtml(displayName) {
  const name = displayName && displayName.trim() ? displayName.trim() : '潘秋瑾';
  return `
  <p class="tip-line tip-intro">${name}宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`;
}

const HELP_HTML = `
  <div class="tip-section">
    <p class="tip-section-title">打我</p>
    <p class="tip-line">选类型点「打我」，可看今日次数、连续、成就和本月热力图。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">成就</p>
    <p class="tip-line">每次点「打我」后会自动检查，达成条件即解锁～</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">小本本</p>
    <p class="tip-line">看记录、按时间/类型筛选，左滑删除。右上 ⋯ 可补一下～、导出/导入/清空。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">姨妈记</p>
    <p class="tip-line">记「来的第一天」「结束了」猜下次。右上 ⋯ 可补一下～、导出/导入/清空。记过啥左滑删除。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">主题颜色</p>
    <p class="tip-line">自选颜色，弹层里可重置为按星期自动。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">检查更新</p>
    <p class="tip-line">点「检查更新」查新版本，有则提示刷新。</p>
  </div>
`;

function openTheme() {
  openThemeModal();
}

function openAbout() {
  contentTitle.value = '关于';
  contentHtml.value = getAboutHtml(displayUserName.value);
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
.mine-cell-value {
  font-size: 14px;
  color: var(--text-3);
}

/* ---------- 我的名字编辑弹层 ---------- */
.name-edit-inner {
  padding: 20px 20px 16px;
  background: var(--surface);
}
.name-edit-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 16px;
  text-align: center;
}
.name-edit-field {
  margin-bottom: 12px;
}
.name-edit-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.name-edit-btn {
  margin: 0;
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
