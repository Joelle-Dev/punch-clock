import { showConfirmDialog } from 'vant';
import { getPrimaryColor } from '../utils/theme';

/**
 * 确认弹层：使用 Vant showConfirmDialog，按钮文案与主题色统一
 */
export function useConfirm() {
  function openConfirm({
    title = '确认',
    message = '',
    confirmButtonText = '好哒',
    cancelButtonText = '算了',
    confirmButtonColor,
    onConfirm,
  } = {}) {
    const color = confirmButtonColor ?? getPrimaryColor();
    const options = {
      title,
      message,
      confirmButtonText,
      cancelButtonText,
      showCancelButton: true,
    };
    if (color) options.confirmButtonColor = color;
    showConfirmDialog(options)
      .then(() => {
        if (typeof onConfirm === 'function') onConfirm();
      })
      .catch(() => {});
  }

  return { openConfirm };
}
