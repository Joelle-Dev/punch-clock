/**
 * 读取当前主题主色（CSS 变量 --primary），用于 Vant 等组件的主题色
 */
export function getPrimaryColor() {
  if (typeof document === 'undefined') return undefined;
  const v = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  return v || undefined;
}
