/**
 * 夸夸文案：多句轮换 + 按连续天数递进
 * @param {string} type - 打卡类型
 * @param {string} [name] - 用户名字，未传或空时用「秋瑾」
 * @param {number} [streak] - 当前连续打卡天数，用于递进文案
 */
export function getPraiseMessage(type, name, streak = 0) {
  const n = name && String(name).trim() ? String(name).trim() : '秋瑾';

  const byType = {
    toilet: [
      n + '又拉粑粑啦～',
      n + '顺畅～',
      n + '如厕打卡，健康生活～',
    ],
    fitness: [
      n + '威武，茁壮成长～',
      n + '动起来，闪闪发光～',
      n + '超慢跑打卡，稳～',
    ],
  };

  const list = byType[type] || [n + '真棒～'];
  const base = list[Math.floor(Math.random() * list.length)];

  if (streak >= 30) return base + ' 连续三十天，太强了！';
  if (streak >= 7) return base + ' 已经连续 ' + streak + ' 天啦～';
  if (streak >= 3) return base + ' 连续 ' + streak + ' 天，稳！';
  return base;
}
