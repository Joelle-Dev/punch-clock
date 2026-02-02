<template>
  <div class="app-shell">
    <header class="top-banner">
      <span class="top-banner-text">{{ bannerText }}</span>
    </header>

    <main class="tab-content">
      <router-view v-slot="{ Component }">
        <transition name="panel-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <ActionsFab v-model:show="showActionsMenu" />
    <TabBar />
    <ThemeModal v-if="themeModalOpen" v-model:open="themeModalOpen" />
    <AchievementModal v-if="achievementModalOpen" v-model:open="achievementModalOpen" />
    <RetroPunchModal v-if="retroPunchOpen" v-model:open="retroPunchOpen" />
    <RetroPeriodModal v-if="retroPeriodOpen" v-model:open="retroPeriodOpen" />
  </div>
</template>

<script setup>
import { ref, computed, provide, watch, onMounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { dayjs } from './utils/date';
import ActionsFab from './components/ActionsFab.vue';
import TabBar from './components/TabBar.vue';
import { useConfirm } from './composables/useConfirm';
import { USER_NAME_STORAGE_KEY } from './constants';

const DEFAULT_NAME = '潘秋瑾';
const BANNER_SUFFIX_BY_DAY = [
  '周日愉快 ✨',
  '新的一周，加油呀 ✨',
  '你今天真好看 ✨',
  '周三也要开心 ✨',
  '今天也是闪闪发光的一天 ✨',
  '周五了，周末见 ✨',
  '周末快乐 ✨',
];

function loadUserName() {
  try {
    const v = localStorage.getItem(USER_NAME_STORAGE_KEY);
    return typeof v === 'string' && v.trim() ? v.trim() : '';
  } catch (e) {
    return '';
  }
}

const userName = ref(loadUserName());
const bannerDayOverride = ref(null);
const bannerText = computed(() => {
  const name = userName.value || DEFAULT_NAME;
  const day = bannerDayOverride.value !== null ? bannerDayOverride.value : dayjs().day();
  const suffix = BANNER_SUFFIX_BY_DAY[day] ?? BANNER_SUFFIX_BY_DAY[2];
  return name + '，' + suffix;
});

function setUserName(name) {
  const v = typeof name === 'string' ? name.trim() : '';
  userName.value = v;
  try {
    if (v) localStorage.setItem(USER_NAME_STORAGE_KEY, v);
    else localStorage.removeItem(USER_NAME_STORAGE_KEY);
  } catch (e) {}
}
onMounted(() => {
  window.addEventListener('theme-day-change', (e) => {
    bannerDayOverride.value = e.detail;
  });
});

/* 弹层按需加载（打开时再加载对应 chunk） */
const ThemeModal = defineAsyncComponent(() => import('./components/ThemeModal.vue'));
const AchievementModal = defineAsyncComponent(() => import('./components/AchievementModal.vue'));
const RetroPunchModal = defineAsyncComponent(() => import('./components/RetroPunchModal.vue'));
const RetroPeriodModal = defineAsyncComponent(() => import('./components/RetroPeriodModal.vue'));

const themeModalOpen = ref(false);
const achievementModalOpen = ref(false);
const retroPunchOpen = ref(false);
const retroPeriodOpen = ref(false);
const route = useRoute();
const showActionsMenu = ref(false);
watch(() => route.path, (path) => {
  if (path !== '/record' && path !== '/period') showActionsMenu.value = false;
});

const { openConfirm } = useConfirm();

provide('openConfirm', openConfirm);
provide('openActionsMenu', () => { showActionsMenu.value = true; });
provide('userName', userName);
provide('setUserName', setUserName);
provide('openThemeModal', () => { themeModalOpen.value = true; });
provide('openAchievementModal', () => { achievementModalOpen.value = true; });
provide('openRetroPunchModal', () => { retroPunchOpen.value = true; });
provide('openRetroPeriodModal', () => { retroPeriodOpen.value = true; });
provide('showAchievementToast', (achievement) => {
  showToast({
    message: achievement ? '哇！' + achievement.title : '',
    icon: achievement?.icon,
  });
});
</script>
