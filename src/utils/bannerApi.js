/**
 * 头部文案远程 API（自建后端）
 * 环境变量：VITE_API_BASE（如 https://your-api.com）、VITE_BANNER_ADMIN_TOKEN（POST 鉴权，可选）
 */

const BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE.replace(/\/$/, '')
  : '';

export function hasBannerApi() {
  return !!BASE;
}

export function getBannerUrl() {
  return BASE ? `${BASE}/api/banner` : '';
}

export function getBannerWsUrl() {
  if (!BASE) return '';
  const u = new URL(BASE);
  const wsProtocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${u.host}${u.pathname.replace(/\/$/, '')}/api/banner/ws`;
}

/**
 * GET 当前头部文案
 * @returns {Promise<{ text: string } | null>}
 */
export async function fetchBanner() {
  const url = getBannerUrl();
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data.text === 'string' ? data : null;
  } catch {
    return null;
  }
}

/**
 * POST 更新头部文案（管理员）
 * @param {string} text - 新文案
 * @param {string} [token] - 鉴权 token，与 VITE_BANNER_ADMIN_TOKEN 一致
 * @returns {Promise<boolean>} 是否成功
 */
export async function postBanner(text, token) {
  const url = getBannerUrl();
  if (!url) return false;
  const headers = { 'Content-Type': 'application/json' };
  const envToken = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BANNER_ADMIN_TOKEN;
  const auth = token ?? envToken ?? '';
  if (auth) headers.Authorization = `Bearer ${auth}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text: String(text || '') }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getAdminToken() {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BANNER_ADMIN_TOKEN) || '';
}
