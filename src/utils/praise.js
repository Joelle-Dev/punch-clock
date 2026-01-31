export function getPraiseMessage(type) {
  switch (type) {
    case 'toilet':
      return '秋瑾又拉粑粑啦～';
    case 'meal':
      return '秋瑾真乖，吃饭香香～';
    case 'fitness':
      return '秋瑾威武，茁壮成长～';
    default:
      return '秋瑾真棒～';
  }
}
