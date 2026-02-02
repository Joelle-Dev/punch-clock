/** @param {string} [name] 用户名字，未传或空时用「秋瑾」 */
export function getPraiseMessage(type, name) {
  const n = name && String(name).trim() ? String(name).trim() : '秋瑾';
  switch (type) {
    case 'toilet':
      return n + '又拉粑粑啦～';
    case 'meal':
      return n + '真乖，吃饭香香～';
    case 'fitness':
      return n + '威武，茁壮成长～';
    default:
      return n + '真棒～';
  }
}
