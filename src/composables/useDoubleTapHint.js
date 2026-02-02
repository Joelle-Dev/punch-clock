import { ref } from 'vue';
import { showToast } from 'vant';

const DEFAULT_WINDOW_MS = 5 * 60 * 1000; /* 五分钟内再次点击即提示彩蛋 */
const DEFAULT_PREFIX = '五分钟内，';
const DEFAULT_MESSAGES = ['打上瘾了？', '再打要收费了～', '手下留情～'];

const DEFAULT_KEY = '_';

/**
 * 五分钟内再次点击给出随机提示（彩蛋），可复用于主页「打我」、补录按钮等。
 * 传入 key（如类型）时，仅对相同 key 限制五分钟；不传 key 时按单一日志限制。
 * @param {Object} options
 * @param {number} [options.windowMs] 判定为「再次点击」的时间窗（毫秒），默认 5 分钟
 * @param {string} [options.prefix] 提示文案前缀，默认「五分钟内，」
 * @param {string[]} [options.messages] 随机提示文案列表
 * @returns {{ shouldSkipDueToDoubleTap: (key?: string) => boolean }}
 */
export function useDoubleTapHint(options = {}) {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const messages = options.messages ?? DEFAULT_MESSAGES;
  const lastTapByKey = ref({});

  function shouldSkipDueToDoubleTap(key = DEFAULT_KEY) {
    const now = Date.now();
    const last = lastTapByKey.value[key] ?? 0;
    if (now - last < windowMs && messages.length > 0) {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      showToast(prefix ? prefix + msg : msg);
      return true;
    }
    lastTapByKey.value = { ...lastTapByKey.value, [key]: now };
    return false;
  }

  return { shouldSkipDueToDoubleTap };
}
