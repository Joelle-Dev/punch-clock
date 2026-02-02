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
    <BannerEditModal v-if="hasBannerApi" v-model:open="bannerEditOpen" />
  </div>
</template>

<script setup>
import { ref, computed, provide, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import { dayjs } from './utils/date';
import ActionsFab from './components/ActionsFab.vue';
import TabBar from './components/TabBar.vue';
import { useConfirm } from './composables/useConfirm';
import { hasBannerApi, fetchBanner, getBannerWsUrl } from './utils/bannerApi';
import BannerEditModal from './components/BannerEditModal.vue';

/* 头部文案按星期：0=周日 … 6=周六，调试见 main.js __applyDay(N) */
const BANNER_BY_DAY = [
  '潘秋瑾，周日愉快 ✨',
  '潘秋瑾，新的一周，加油呀 ✨',
  '潘秋瑾，你今天真好看 ✨',
  '潘秋瑾，周三也要开心 ✨',
  '潘秋瑾，今天也是闪闪发光的一天 ✨',
  '潘秋瑾，周五了，周末见 ✨',
  '潘秋瑾，周末快乐 ✨',
];
const bannerDayOverride = ref(null);
const remoteBannerText = ref(null);
const bannerText = computed(() => {
  if (remoteBannerText.value != null && remoteBannerText.value !== '') return remoteBannerText.value;
  const day = bannerDayOverride.value !== null ? bannerDayOverride.value : dayjs().day();
  return BANNER_BY_DAY[day] ?? BANNER_BY_DAY[2];
});
function setRemoteBannerText(text) {
  remoteBannerText.value = text;
}
function getCurrentBannerText() {
  return bannerText.value;
}
async function loadBanner() {
  const data = await fetchBanner();
  if (data?.text != null) remoteBannerText.value = data.text;
}

let bannerWs = null;
let bannerWsReconnectTimer = null;
const WS_RECONNECT_DELAY = 5000;

function connectBannerWs() {
  const wsUrl = getBannerWsUrl();
  if (!wsUrl) return;
  try {
    bannerWs = new WebSocket(wsUrl);
    bannerWs.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg?.type === 'banner_updated') {
          if (typeof msg.text === 'string') remoteBannerText.value = msg.text;
          else loadBanner();
        }
      } catch {}
    };
    bannerWs.onclose = () => {
      bannerWs = null;
      bannerWsReconnectTimer = setTimeout(connectBannerWs, WS_RECONNECT_DELAY);
    };
    bannerWs.onerror = () => { bannerWs?.close(); };
  } catch {}
}

onMounted(() => {
  window.addEventListener('theme-day-change', (e) => {
    bannerDayOverride.value = e.detail;
  });
  if (hasBannerApi()) {
    loadBanner();
    connectBannerWs();
  }
});
onUnmounted(() => {
  if (bannerWsReconnectTimer) clearTimeout(bannerWsReconnectTimer);
  if (bannerWs) {
    bannerWs.onclose = null;
    bannerWs.close();
  }
});

const bannerEditOpen = ref(false);
provide('openBannerEditModal', () => { bannerEditOpen.value = true; });
provide('getCurrentBannerText', getCurrentBannerText);
provide('setRemoteBannerText', setRemoteBannerText);

/* 弹层按需加载（打开时再加载对应 chunk） */
const ThemeModal = defineAsyncComponent(() => import('./components/ThemeModal.vue'));
const AchievementModal = defineAsyncComponent(() => import('./components/AchievementModal.vue'));
const RetroPunchModal = defineAsyncComponent(() => import('./components/RetroPunchModal.vue'));

const themeModalOpen = ref(false);
const achievementModalOpen = ref(false);
const retroPunchOpen = ref(false);
const route = useRoute();
const showActionsMenu = ref(false);
watch(() => route.path, (path) => {
  if (path !== '/record' && path !== '/period') showActionsMenu.value = false;
});

const { openConfirm } = useConfirm();

provide('openConfirm', openConfirm);
provide('openActionsMenu', () => { showActionsMenu.value = true; });
provide('openThemeModal', () => { themeModalOpen.value = true; });
provide('openAchievementModal', () => { achievementModalOpen.value = true; });
provide('openRetroPunchModal', () => { retroPunchOpen.value = true; });
provide('showAchievementToast', (achievement) => {
  showToast({
    message: achievement ? '哇！' + achievement.title : '',
    icon: achievement?.icon,
  });
});
</script>
