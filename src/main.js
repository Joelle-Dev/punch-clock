import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initTheme } from './composables/useTheme';
import '../style.css';
/* Vant 命令式 API（Dialog/Toast）样式需单独引入 */
import 'vant/es/dialog/style';
import 'vant/es/toast/style';

initTheme();

/* 开发调试：控制台 __applyDay(0~6) 切换按星期主题与头部文案，__applyDayReset() 恢复当天 */
if (typeof window !== 'undefined') {
  window.__applyDay = (day) => {
    if (day < 0 || day > 6) return console.warn('__applyDay(0~6)，0=周日 6=周六');
    localStorage.removeItem('punch_theme_v1');
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-dark');
    root.style.removeProperty('--primary-soft');
    Array.from(root.classList).forEach((c) => {
      if (c.startsWith('theme-day-')) root.classList.remove(c);
    });
    root.classList.add('theme-day-' + day);
    window.dispatchEvent(new CustomEvent('theme-day-change', { detail: day }));
    const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    console.log('已切换为「按星期自动」：' + names[day] + '（主题 + 头部文案已同步）');
  };
  /* 无参数时恢复为当天：__applyDay() */
  window.__applyDayReset = () => {
    localStorage.removeItem('punch_theme_v1');
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
