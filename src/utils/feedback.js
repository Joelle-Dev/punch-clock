/**
 * 打卡时的音效与触感反馈
 */

/** 音效放在 public/，随构建输出到根路径，用 BASE_URL 兼容子路径部署 */
const PUNCH_SOUND_URL = (import.meta.env.BASE_URL || '/') + 'music2.mp3';
let punchAudio = null;

function getPunchAudio() {
  if (typeof window === 'undefined') return null;
  if (!punchAudio) {
    punchAudio = new Audio(PUNCH_SOUND_URL);
  }
  return punchAudio;
}

/**
 * 播放打卡音效（使用 music2.mp3）
 */
export function playPunchSound() {
  try {
    const audio = getPunchAudio();
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (_) {
    // 静默失败，不打扰用户
  }
}

/**
 * 短振触感反馈（支持则调用，不支持则忽略）
 */
export function playPunchHaptic() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  } catch (_) {}
}

/**
 * 打卡时同时触发音效 + 触感（在用户点击「打我」时调用）
 */
export function playPunchFeedback() {
  playPunchSound();
  playPunchHaptic();
}
