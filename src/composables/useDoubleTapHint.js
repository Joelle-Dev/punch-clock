import { ref } from 'vue';
import { showToast } from 'vant';

const DEFAULT_WINDOW_MS = 5 * 60 * 1000; /* 五分钟内再次点击即提示彩蛋 */
const DEFAULT_MESSAGES = ['打上瘾了？', '再打要收费了～', '手下留情～'];

/**
 * 五分钟内再次点击给出随机提示（彩蛋），可复用于主页「打我」、补录按钮等。
 * @param {Object} options
 * @param {number} [options.windowMs] 判定为「再次点击」的时间窗（毫秒），默认 5 分钟
 * @param {string[]} [options.messages] 随机提示文案列表
 * @returns {{ shouldSkipDueToDoubleTap: () => boolean }}
 */
export function useDoubleTapHint(options = {}) {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const messages = options.messages ?? DEFAULT_MESSAGES;
  const lastTapTime = ref(0);

  function shouldSkipDueToDoubleTap() {
    const now = Date.now();
    if (now - lastTapTime.value < windowMs && messages.length > 0) {
      showToast(messages[Math.floor(Math.random() * messages.length)]);
      return true;
    }
    lastTapTime.value = now;
    return false;
  }

  return { shouldSkipDueToDoubleTap };
}
