import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initTheme, applyDayTheme, saveTheme } from './composables/useTheme';
import { getPrimaryColor } from './utils/theme';
import { showConfirmDialog, showToast } from 'vant';
import { registerSW } from 'virtual:pwa-register';
import './styles/global.css';
/* Vant 命令式 API（Dialog/Toast）样式需单独引入 */
import 'vant/es/dialog/style';
import 'vant/es/toast/style';

initTheme();

/* PWA：发现新版本时弹窗提示，用户点「刷新」后激活新 SW 并重载 */
const updateSW = registerSW({
  onNeedRefresh() {
    showConfirmDialog({
      title: '发现新版本',
      message: '请刷新以获取最新内容',
      confirmButtonText: '刷新',
      cancelButtonText: '稍后',
      showCancelButton: true,
      confirmButtonColor: getPrimaryColor() || undefined,
    })
      .then(() => { updateSW(true); })
      .catch(() => {});
  },
  onOfflineReady() {
    showToast('已可离线使用');
  },
});

/* 开发调试：控制台 __applyDay(0~6) 切换按星期主题与头部文案，__applyDayReset() 恢复当天 */
if (typeof window !== 'undefined') {
  const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  window.__applyDay = (day) => {
    if (day < 0 || day > 6) return console.warn('__applyDay(0~6)，0=周日 6=周六');
    saveTheme(null);
    applyDayTheme(day);
    window.dispatchEvent(new CustomEvent('theme-day-change', { detail: day }));
    console.log('已切换为「按星期自动」：' + DAY_NAMES[day] + '（主题 + 头部文案已同步）');
  };
  window.__applyDayReset = () => {
    saveTheme(null);
    window.dispatchEvent(new CustomEvent('theme-day-change', { detail: null }));
    initTheme();
    console.log('已恢复为当天');
  };
}

/* 启动页最少展示时长（毫秒），可改此值控制多久后进入主页 */
const SPLASH_MIN_DURATION_MS = 1200;

const splashStart = typeof performance !== 'undefined' && performance.timing
  ? performance.timing.navigationStart
  : Date.now();

const app = createApp(App);
app.use(router);
app.mount('#app');

/* 启动页：至少展示 SPLASH_MIN_DURATION_MS 后再淡出 */
const splash = document.getElementById('splash');
if (splash) {
  const elapsed = Date.now() - splashStart;
  const remain = Math.max(SPLASH_MIN_DURATION_MS - elapsed, 0);
  setTimeout(() => {
    splash.classList.add('splash-hidden');
    setTimeout(() => { splash.style.display = 'none'; }, 400);
  }, remain);
}
