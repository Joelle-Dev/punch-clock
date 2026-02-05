/**
 * 打卡与成就的触感反馈
 */

/** 短振触感（支持则调用，不支持则忽略） */
export function playPunchHaptic() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  } catch (_) {}
}

/** 成就解锁时的短震（稍长一点） */
export function playAchievementHaptic() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  } catch (_) {}
}
