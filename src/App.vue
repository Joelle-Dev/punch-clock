<template>
  <div class="app-shell">
    <header class="top-banner">
      <div class="top-banner-inner">
        <span class="top-banner-text">{{ bannerText }}</span>
        <span v-if="festivalMessage" class="top-banner-festival">{{ festivalMessage }}</span>
      </div>
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
    <AchievementUnlockPop
      v-if="achievementToastQueue.length"
      :achievement="achievementToastQueue[0]"
      @dismiss="shiftAchievementToast"
    />
    <AchievementModal v-if="achievementModalOpen" v-model:open="achievementModalOpen" />
    <RetroPunchModal v-if="retroPunchOpen" v-model:open="retroPunchOpen" />
    <RetroPeriodModal v-if="retroPeriodOpen" v-model:open="retroPeriodOpen" />
  </div>
</template>

<script setup>
import { ref, computed, provide, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { dayjs } from './utils/date';
import { getFestivalMessage } from './utils/festival';
import ActionsFab from './components/ActionsFab.vue';
import TabBar from './components/TabBar.vue';
import { useConfirm } from './composables/useConfirm';
import { USER_NAME_STORAGE_KEY } from './constants';

const DEFAULT_NAME = '潘秋瑾';
/** 按星期几的头部后缀，每天多句备选随机展示 */
const BANNER_SUFFIX_BY_DAY = [
  ['周日愉快 ✨', '周日也要开心呀 ✨', '休息日快乐 ✨'],
  ['新的一周，加油呀 ✨', '周一冲呀 ✨', '周一也要闪闪发光 ✨'],
  ['你今天真好看 ✨', '周二开心 ✨', '今天也是美好的一天 ✨'],
  ['周三也要开心 ✨', '周三过半啦 ✨', '稳住，周三 ✨'],
  ['今天也是闪闪发光的一天 ✨', '周四加油 ✨', '周四愉快 ✨'],
  ['周五了，周末见 ✨', '周五快乐 ✨', '马上周末啦 ✨'],
  ['周末快乐 ✨', '周六愉快 ✨', '周末也要好好过 ✨'],
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
  const options = BANNER_SUFFIX_BY_DAY[day] ?? BANNER_SUFFIX_BY_DAY[2];
  const suffix = Array.isArray(options)
    ? options[Math.floor(Math.random() * options.length)]
    : options;
  return name + '，' + suffix;
});

const festivalMessage = computed(() => getFestivalMessage(dayjs()));

function setUserName(name) {
  const v = typeof name === 'string' ? name.trim() : '';
  userName.value = v;
  try {
    if (v) localStorage.setItem(USER_NAME_STORAGE_KEY, v);
    else localStorage.removeItem(USER_NAME_STORAGE_KEY);
  } catch (e) {}
}

function onThemeDayChange(e) {
  bannerDayOverride.value = e.detail;
}

onMounted(() => {
  window.addEventListener('theme-day-change', onThemeDayChange);
});

onUnmounted(() => {
  window.removeEventListener('theme-day-change', onThemeDayChange);
});

/* 弹层按需加载（打开时再加载对应 chunk） */
const ThemeModal = defineAsyncComponent(() => import('./components/ThemeModal.vue'));
import AchievementUnlockPop from './components/AchievementUnlockPop.vue';
const AchievementModal = defineAsyncComponent(() => import('./components/AchievementModal.vue'));
const RetroPunchModal = defineAsyncComponent(() => import('./components/RetroPunchModal.vue'));
const RetroPeriodModal = defineAsyncComponent(() => import('./components/RetroPeriodModal.vue'));

const themeModalOpen = ref(false);
const achievementToastQueue = ref([]);
const achievementModalOpen = ref(false);
const retroPunchOpen = ref(false);
const retroPeriodOpen = ref(false);
const route = useRoute();
const showActionsMenu = ref(false);
watch(() => route.path, (path) => {
  if (path !== '/record' && path !== '/period') showActionsMenu.value = false;
});

const { openConfirm } = useConfirm();

function shiftAchievementToast() {
  achievementToastQueue.value = achievementToastQueue.value.slice(1);
}

provide('openConfirm', openConfirm);
provide('openActionsMenu', () => { showActionsMenu.value = true; });
provide('userName', userName);
provide('setUserName', setUserName);
provide('openThemeModal', () => { themeModalOpen.value = true; });
provide('openAchievementModal', () => { achievementModalOpen.value = true; });
provide('openRetroPunchModal', () => { retroPunchOpen.value = true; });
provide('openRetroPeriodModal', () => { retroPeriodOpen.value = true; });
provide('showAchievementToast', (achievement) => {
  if (achievement) achievementToastQueue.value = [...achievementToastQueue.value, achievement];
});
</script>
