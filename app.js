// 轻量级打卡应用前端逻辑
// 数据结构：
// records: [{ id, timestamp, dateKey, type }]

const punchBtn = document.getElementById('punchBtn');
const todayCountEl = document.getElementById('todayCount');
const streakCountEl = document.getElementById('streakCount');
const lastPunchTimeEl = document.getElementById('lastPunchTime');
const historyListEl = document.getElementById('historyList');
const filterTabs = document.querySelectorAll('.filter-tab');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const typeTabs = document.querySelectorAll('.type-tab');
const historyTypeTabs = document.querySelectorAll('.history-type-tab');
const confirmModalEl = document.getElementById('confirmModal');
const modalTitleEl = document.getElementById('modalTitle');
const modalMessageEl = document.getElementById('modalMessage');
const modalCancelBtn = document.getElementById('modalCancel');
const modalConfirmBtn = document.getElementById('modalConfirm');
const STORAGE_KEY = 'punch_records_v1';
const PERIOD_STORAGE_KEY = 'punch_period_records_v1';
const THEME_STORAGE_KEY = 'punch_theme_v1';
const ACHIEVEMENT_STORAGE_KEY = 'punch_achievements_v1';

// 成就配置：id, title, desc, icon, check(records)->boolean
const ACHIEVEMENTS = [
  { id: 'streak7', title: '连续 7 天', desc: '连续打卡满 7 天', icon: '🔥', check: (records) => calcStreak(records) >= 7 },
  { id: 'toilet30', title: '如厕达人', desc: '如厕打卡满 30 次', icon: '🚽', check: (records) => filterByType(records, 'toilet').length >= 30 },
  { id: 'meal30', title: '饭否达人', desc: '饭否打卡满 30 次', icon: '🍚', check: (records) => filterByType(records, 'meal').length >= 30 },
  { id: 'fitness30', title: '健身达人', desc: '健身打卡满 30 次', icon: '💪', check: (records) => filterByType(records, 'fitness').length >= 30 },
  { id: 'days100', title: '坚持 100 天', desc: '使用打卡满 100 天', icon: '📅', check: (records) => {
    if (!records.length) return false;
    const first = records.slice().sort((a, b) => a.timestamp - b.timestamp)[0];
    const days = Math.floor((Date.now() - first.timestamp) / (24 * 60 * 60 * 1000));
    return days >= 100;
  }},
  { id: 'all4', title: '全能日', desc: '同一天打过全部 4 种类型', icon: '🌟', check: (records) => {
    const byDate = groupByDate(records);
    return byDate.some(({ recs }) => {
      const types = new Set(recs.map((r) => r.type || 'other'));
      return types.size >= 4;
    });
  }},
];

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error('Failed to load records', e);
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function groupByDate(records) {
  const map = new Map();
  records.forEach((r) => {
    if (!map.has(r.dateKey)) {
      map.set(r.dateKey, []);
    }
    map.get(r.dateKey).push(r);
  });
  // 转成数组并按日期倒序排序
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dateKey, recs]) => ({ dateKey, recs }));
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDateDisplay(dateKey) {
  const [year, month, day] = dateKey.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

// 解析 CSV 行（支持引号包裹）
function parseCsvLine(line) {
  const cells = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let cell = '';
      i++;
      while (i < line.length && (line[i] !== '"' || line[i + 1] === '"')) {
        cell += line[i] === '"' && line[i + 1] === '"' ? '"' : line[i];
        i++;
      }
      if (line[i] === '"') i++;
      cells.push(cell);
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      const cell = end === -1 ? line.slice(i) : line.slice(i, end);
      cells.push(cell.trim());
      i = end === -1 ? line.length : end + 1;
    }
  }
  return cells;
}

// 类型中文 -> 内部 key
function getTypeFromLabel(label) {
  const map = { 如厕: 'toilet', 饭否: 'meal', 健身: 'fitness', 其他: 'other' };
  return map[label] || 'other';
}

// 解析「2025年1月28日 14:30:00」或「2025年1月28日」
function parseDateTimeDisplay(str) {
  const dateMatch = /(\d+)年(\d+)月(\d+)日/.exec(str);
  if (!dateMatch) return null;
  const [, y, m, d] = dateMatch;
  const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const timeMatch = /(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(str);
  const h = timeMatch ? parseInt(timeMatch[1], 10) : 12;
  const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
  const sec = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10), h, min, sec);
  return { dateKey, timestamp: date.getTime() };
}

function parseDateDisplay(str) {
  const m = /(\d+)年(\d+)月(\d+)日/.exec(str);
  if (!m) return null;
  return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
}

// 解析打卡导出 CSV，返回 [{ id, timestamp, dateKey, type }]
function parsePunchCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const records = [];
  for (let i = 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 2) continue;
    const typeLabel = cells[0].trim();
    const dateTimeStr = cells[1].trim();
    if (i === 0 && (typeLabel === '类型' || typeLabel === '日期时间')) continue;
    const type = getTypeFromLabel(typeLabel);
    const parsed = parseDateTimeDisplay(dateTimeStr);
    if (!parsed) continue;
    records.push({
      id: `import-${parsed.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: parsed.timestamp,
      dateKey: parsed.dateKey,
      type,
    });
  }
  return records;
}

// 解析经期导出 CSV，返回 [{ id, startDate, endDate }]
function parsePeriodCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const records = [];
  for (let i = 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 2) continue;
    const startStr = cells[0].trim();
    const endStr = cells[1].trim();
    if (i === 0 && (startStr === '开始日期' || endStr === '结束日期')) continue;
    const startDate = parseDateDisplay(startStr);
    if (!startDate) continue;
    const endDate = endStr === '进行中' || !endStr ? null : parseDateDisplay(endStr);
    records.push({
      id: `p-import-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      startDate,
      endDate: endDate || null,
    });
  }
  return records;
}

function calcTodayCount(records) {
  const todayKey = getDateKey(new Date());
  return records.filter((r) => r.dateKey === todayKey).length;
}

function calcStreak(records) {
  if (!records.length) return 0;
  const grouped = groupByDate(records);
  let streak = 0;
  let cur = new Date();
  let curKey = getDateKey(cur);

  for (let i = 0; i < grouped.length; i++) {
    const { dateKey } = grouped[i];
    if (dateKey === curKey) {
      streak++;
      // 往前一天
      cur.setDate(cur.getDate() - 1);
      curKey = getDateKey(cur);
    } else {
      break;
    }
  }
  return streak;
}

// 获取类型中文名
function getTypeLabel(type) {
  switch (type) {
    case 'fitness':
      return '健身';
    case 'toilet':
      return '如厕';
    case 'meal':
      return '饭否';
    default:
      return '其他';
  }
}

// ---------- 主题颜色 ----------
function getStoredTheme() {
  try {
    const hex = localStorage.getItem(THEME_STORAGE_KEY);
    if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  } catch (e) {
    console.error('Failed to load theme', e);
  }
  return null;
}

function saveTheme(hex) {
  if (hex) localStorage.setItem(THEME_STORAGE_KEY, hex);
  else localStorage.removeItem(THEME_STORAGE_KEY);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function darkenHex(hex, ratio) {
  const { r, g, b } = hexToRgb(hex);
  return '#' + [r, g, b]
    .map((c) => Math.round(Math.max(0, c * (1 - ratio))).toString(16).padStart(2, '0'))
    .join('');
}

function applyCustomTheme(hex) {
  const root = document.documentElement;
  root.classList.forEach((c) => {
    if (c.startsWith('theme-day-')) root.classList.remove(c);
  });
  root.style.setProperty('--primary', hex);
  root.style.setProperty('--primary-dark', darkenHex(hex, 0.15));
  const { r, g, b } = hexToRgb(hex);
  root.style.setProperty('--primary-soft', `rgba(${r}, ${g}, ${b}, 0.15)`);
}

function applyDayTheme() {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--primary-dark');
  root.style.removeProperty('--primary-soft');
  root.classList.forEach((c) => {
    if (c.startsWith('theme-day-')) root.classList.remove(c);
  });
  const d = new Date().getDay();
  root.classList.add('theme-day-' + d);
}

function initTheme() {
  const custom = getStoredTheme();
  if (custom) applyCustomTheme(custom);
  else applyDayTheme();
}

// ---------- 成就 ----------
function loadUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUnlockedAchievements(ids) {
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(ids));
}

function checkAllAchievements(records) {
  const unlocked = loadUnlockedAchievements();
  const newly = [];
  ACHIEVEMENTS.forEach((a) => {
    if (unlocked.includes(a.id)) return;
    if (a.check(records)) {
      newly.push(a);
      unlocked.push(a.id);
    }
  });
  if (newly.length) saveUnlockedAchievements(unlocked);
  return newly;
}

function showAchievementToast(achievement) {
  const el = document.getElementById('achievementToast');
  if (!el) return;
  const titleEl = el.querySelector('.achievement-toast-title');
  const iconEl = el.querySelector('.achievement-toast-icon');
  if (titleEl) titleEl.textContent = '恭喜！' + achievement.title;
  if (iconEl) iconEl.textContent = achievement.icon;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ---------- 热力图 ----------
function getMonthHeatmap(records, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const map = {};
  records.forEach((r) => {
    if (!r.dateKey.startsWith(prefix)) return;
    map[r.dateKey] = (map[r.dateKey] || 0) + 1;
  });
  return map;
}

function renderHeatmap(containerEl, records) {
  if (!containerEl) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const heat = getMonthHeatmap(records, year, month);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month - 1 + 1, 0);
  const totalDays = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  let html = '<div class="heatmap-grid">';
  const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];
  weekLabels.forEach((w) => {
    html += '<span class="heatmap-week-label">' + w + '</span>';
  });
  for (let i = 0; i < startWeekday; i++) {
    html += '<span class="heatmap-cell heatmap-cell-empty"></span>';
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const count = heat[dateKey] || 0;
    let level = 'heatmap-cell-0';
    if (count >= 6) level = 'heatmap-cell-4';
    else if (count >= 4) level = 'heatmap-cell-3';
    else if (count >= 2) level = 'heatmap-cell-2';
    else if (count >= 1) level = 'heatmap-cell-1';
    const title = count ? `${dateKey} 打卡 ${count} 次` : dateKey;
    html += '<span class="heatmap-cell ' + level + '" title="' + title + '">' + (count || '') + '</span>';
  }
  html += '</div>';
  containerEl.innerHTML = html;
}

// 根据打卡类型返回表扬文案
function getPraiseMessage(type) {
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

// 打卡成功弹层：填充庆祝背景（爱心/星星等）
function fillCelebrationLayer(container) {
  if (!container) return;
  container.innerHTML = '';
  const symbols = ['♥', '✨', '★', '☆', '•', '♥', '✨', '★'];
  const anims = ['celebrate-float', 'celebrate-twinkle', 'celebrate-rise'];
  const colors = ['#ff6b9d', '#e84c7a', '#ffd700', '#ffb347', '#c2185b', '#f8bbd9'];
  const count = 28;
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'celebrate-item ' + anims[i % anims.length];
    span.textContent = symbols[i % symbols.length];
    span.style.left = Math.random() * 80 + 10 + '%';
    span.style.top = Math.random() * 80 + 10 + '%';
    span.style.animationDelay = Math.random() * 0.8 + 's';
    span.style.color = colors[i % colors.length];
    span.style.fontSize = (12 + Math.random() * 12) + 'px';
    container.appendChild(span);
  }
}

function applyFilter(records, filter) {
  const now = new Date();
  const todayKey = getDateKey(now);

  if (filter === 'today') {
    return records.filter((r) => r.dateKey === todayKey);
  }

  if (filter === 'week') {
    // 最近 7 天
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    const minKey = getDateKey(sevenDaysAgo);
    return records.filter((r) => r.dateKey >= minKey);
  }

  if (filter === 'month') {
    // 本月
    const [year, month] = todayKey.split('-');
    const prefix = `${year}-${month}`;
    return records.filter((r) => r.dateKey.startsWith(prefix));
  }

  return records;
}

function render(allRecords, activeFilter = 'all') {
  // 顶部统计（基于全部记录）
  todayCountEl.textContent = String(calcTodayCount(allRecords));
  streakCountEl.textContent = String(calcStreak(allRecords));

  if (!allRecords.length) {
    lastPunchTimeEl.textContent = '暂无打卡记录';
  } else {
    const last = allRecords[allRecords.length - 1];
    const d = new Date(last.timestamp);
    lastPunchTimeEl.textContent = `最后一次：${formatDateDisplay(last.dateKey)} ${formatTime(
      d
    )}`;
  }

  // 历史 + 概览（按类型 + 日期汇总）
  const filteredByDate = applyFilter(allRecords, activeFilter);

  historyListEl.innerHTML = '';
  if (!filteredByDate.length) {
    historyListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <p>还没有打卡记录</p>
      </div>
    `;
    return;
  }

  const frag = document.createDocumentFragment();

  const historyTypeFilter = state.historyType || 'all';
  // 显示顺序：拉粑粑、饭否、健身、其他
  const typeOrder = ['toilet', 'meal', 'fitness', 'other'];
  typeOrder.forEach((type) => {
    if (historyTypeFilter !== 'all' && historyTypeFilter !== type) return;
    const typeRecords = filteredByDate.filter((r) => (r.type || 'other') === type);
    if (!typeRecords.length) return;

    const wrapper = document.createElement('div');
    wrapper.className = `history-type-block history-type-block-${type}`;

    // 类型头部
    const header = document.createElement('div');
    header.className = 'history-item';

    const leftHeader = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'history-date';
    titleEl.textContent = getTypeLabel(type);

    const infoEl = document.createElement('div');
    infoEl.className = 'history-time';
    infoEl.textContent = `共 ${typeRecords.length} 次`;

    leftHeader.appendChild(titleEl);
    leftHeader.appendChild(infoEl);

    header.appendChild(leftHeader);
    wrapper.appendChild(header);

    // 按日期分组
    const groupedByDate = groupByDate(
      typeRecords.slice().sort((a, b) => a.timestamp - b.timestamp)
    );

    groupedByDate.forEach(({ dateKey, recs }) => {
      const row = document.createElement('div');
      row.className = 'history-item';

      const left = document.createElement('div');
      const dateEl = document.createElement('div');
      dateEl.className = 'history-date';
      dateEl.textContent = formatDateDisplay(dateKey);

      const timesListEl = document.createElement('div');
      timesListEl.className = 'history-time-list';

      recs.forEach((r) => {
        const d = new Date(r.timestamp);
        const chip = document.createElement('div');
        chip.className = 'time-chip';

        const timeText = document.createElement('span');
        timeText.textContent = formatTime(d);

        const delBtn = document.createElement('button');
        delBtn.className = 'time-delete-btn';
        delBtn.textContent = '删';
        delBtn.setAttribute('data-id', r.id);

        chip.appendChild(timeText);
        chip.appendChild(delBtn);
        timesListEl.appendChild(chip);
      });

      left.appendChild(dateEl);
      left.appendChild(timesListEl);

      row.appendChild(left);

      wrapper.appendChild(row);
    });

    frag.appendChild(wrapper);
  });

  historyListEl.appendChild(frag);

  // 本月打卡热力图
  renderHeatmap(document.getElementById('heatmapContainer'), state.records);

  // 成就数量
  const achievementCountEl = document.getElementById('achievementCount');
  if (achievementCountEl) achievementCountEl.textContent = String(loadUnlockedAchievements().length);
}

let state = {
  records: [],
  filter: 'all',
  currentType: 'fitness',
  historyType: 'all',
  periodRecords: [],
  activeTab: 'punch',
};

let pendingConfirm = null;
let praiseTimer = null;

function showConfirm(options) {
  const { title, message, onConfirm } = options;
  if (!confirmModalEl) {
    // 兜底：如果模态不存在，退回系统 confirm
    // eslint-disable-next-line no-alert
    const ok = window.confirm(message);
    if (ok && typeof onConfirm === 'function') onConfirm();
    return;
  }
  modalTitleEl.textContent = title || '确认操作';
  modalMessageEl.textContent = message || '';
  pendingConfirm = typeof onConfirm === 'function' ? onConfirm : null;
  confirmModalEl.hidden = false;
}

function hideConfirm() {
  if (confirmModalEl) {
    confirmModalEl.hidden = true;
  }
  pendingConfirm = null;
}

function filterByType(records, type) {
  if (!type) return records;
  return records.filter((r) => (r.type || 'other') === type);
}

// ---------- 姨妈打卡 ----------
function loadPeriodRecords() {
  try {
    const raw = localStorage.getItem(PERIOD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error('Failed to load period records', e);
    return [];
  }
}

function savePeriodRecords(records) {
  localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(records));
}

/** 找到当前未结束的经期（最近一次没有 endDate 的） */
function getCurrentOpenPeriod(periodRecords) {
  return periodRecords
    .filter((r) => !r.endDate)
    .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))[0] || null;
}

/** 根据历史开始日预测下次开始日。至少 2 次开始日才预测 */
function calcNextPeriodStart(periodRecords) {
  const withStart = periodRecords
    .map((r) => r.startDate)
    .filter(Boolean)
    .sort();
  if (withStart.length < 2) return null;
  const cycles = [];
  for (let i = 1; i < withStart.length; i++) {
    const a = new Date(withStart[i - 1]);
    const b = new Date(withStart[i]);
    const days = Math.round((b - a) / (24 * 60 * 60 * 1000));
    if (days > 0 && days < 90) cycles.push(days);
  }
  if (!cycles.length) return null;
  const avgCycle = Math.round(
    cycles.reduce((s, d) => s + d, 0) / cycles.length
  );
  const lastStart = withStart[withStart.length - 1];
  const next = new Date(lastStart);
  next.setDate(next.getDate() + avgCycle);
  return { dateKey: getDateKey(next), avgCycle };
}

function renderPeriodPanel() {
  const statusEl = document.getElementById('periodStatus');
  const predictionEl = document.getElementById('periodPrediction');
  const historyListEl = document.getElementById('periodHistoryList');
  const periodStartBtn = document.getElementById('periodStartBtn');
  const periodEndBtn = document.getElementById('periodEndBtn');
  if (!statusEl || !predictionEl || !historyListEl) return;

  const periods = state.periodRecords;
  const open = getCurrentOpenPeriod(periods);
  const todayKey = getDateKey(new Date());

  if (open) {
    statusEl.innerHTML = `
      <div class="period-status-title">进行中</div>
      <div>开始：${formatDateDisplay(open.startDate)}</div>
      <div>结束：尚未记录</div>
    `;
    if (periodEndBtn) periodEndBtn.disabled = false;
    if (periodStartBtn) periodStartBtn.disabled = true;
  } else {
    statusEl.innerHTML = `
      <div class="period-status-title">未在经期</div>
      <div>记录「来的第一天」开始新周期</div>
    `;
    if (periodEndBtn) periodEndBtn.disabled = true;
    if (periodStartBtn) periodStartBtn.disabled = false;
  }

  const pred = calcNextPeriodStart(periods);
  if (pred) {
    predictionEl.innerHTML = `
      <div class="period-prediction-title">预计下次开始</div>
      <div class="period-prediction-value">${formatDateDisplay(pred.dateKey)}</div>
      <div class="period-prediction-hint">基于平均周期 ${pred.avgCycle} 天，仅供参考</div>
    `;
    predictionEl.hidden = false;
  } else {
    predictionEl.innerHTML = `
      <div class="period-prediction-title">预测</div>
      <div class="period-prediction-hint">再记录至少 2 次「来的第一天」后会显示预测</div>
    `;
    predictionEl.hidden = false;
  }

  const sorted = [...periods].sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
  if (!sorted.length) {
    historyListEl.innerHTML = '<div class="period-empty">暂无经期记录</div>';
    return;
  }
  historyListEl.innerHTML = '';
  sorted.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'period-history-item';
    const range =
      p.endDate
        ? `${formatDateDisplay(p.startDate)} ～ ${formatDateDisplay(p.endDate)}`
        : `${formatDateDisplay(p.startDate)} ～ 进行中`;
    const days = p.endDate
      ? Math.round(
          (new Date(p.endDate) - new Date(p.startDate)) / (24 * 60 * 60 * 1000)
        ) + 1
      : '';
    row.innerHTML = `
      <span class="period-range">${range}</span>
      <span class="period-days">${days ? days + ' 天' : ''}</span>
      <button type="button" class="period-history-delete" data-period-id="${p.id}">删</button>
    `;
    historyListEl.appendChild(row);
  });
}

function init() {
  state.records = loadRecords();
  state.periodRecords = loadPeriodRecords();
  // 类型 tab 事件（只影响“打卡”归属类型）
  typeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      typeTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentType = tab.dataset.type || 'fitness';
      render(state.records, state.filter);
    });
  });

  const initialTypeTab = document.querySelector('.type-tab.active');
  if (initialTypeTab) {
    state.currentType = initialTypeTab.dataset.type || 'fitness';
  }

  render(state.records, state.filter);
  checkAllAchievements(state.records);

  // 打卡成功弹层：缓存 DOM 引用，避免每次点击重复查询
  const punchSuccessModal = document.getElementById('punchSuccessModal');
  const punchSuccessMessage = document.getElementById('punchSuccessMessage');
  const punchSuccessCelebration = document.getElementById('punchSuccessCelebration');
  const punchSuccessConfirm = document.getElementById('punchSuccessConfirm');

  punchBtn.addEventListener('click', () => {
    const now = new Date();
    const record = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now.getTime(),
      dateKey: getDateKey(now),
      type: state.currentType,
    };
    state.records.push(record);
    saveRecords(state.records);

    // 1）立刻弹层 + 文案；庆祝背景延后一帧生成，不阻塞点击
    if (punchSuccessModal && punchSuccessMessage) {
      punchSuccessMessage.textContent = getPraiseMessage(state.currentType);
      punchSuccessModal.hidden = false;
      requestAnimationFrame(() => fillCelebrationLayer(punchSuccessCelebration));
    }

    // 2）按钮弹跳
    punchBtn.classList.remove('punch-button-bounce');
    // eslint-disable-next-line no-unused-expressions
    punchBtn.offsetWidth;
    punchBtn.classList.add('punch-button-bounce');

    // 3）列表与成就延后执行
    setTimeout(() => {
      render(state.records, state.filter);
      checkAllAchievements(state.records).forEach((a) => showAchievementToast(a));
    }, 0);
  });

  if (punchSuccessConfirm && punchSuccessModal) {
    punchSuccessConfirm.addEventListener('click', () => { punchSuccessModal.hidden = true; });
  }
  if (punchSuccessModal) {
    punchSuccessModal.addEventListener('click', (e) => {
      if (e.target === punchSuccessModal) punchSuccessModal.hidden = true;
    });
  }

  // 成就入口点击
  const achievementBtn = document.getElementById('achievementBtn');
  const achievementModal = document.getElementById('achievementModal');
  if (achievementBtn && achievementModal) {
    achievementBtn.addEventListener('click', () => {
      const listEl = document.getElementById('achievementList');
      if (listEl) {
        const unlocked = loadUnlockedAchievements();
        listEl.innerHTML = ACHIEVEMENTS.map((a) => {
          const done = unlocked.includes(a.id);
          return (
            '<div class="achievement-item ' + (done ? 'unlocked' : 'locked') + '">' +
            '<span class="achievement-icon">' + a.icon + '</span>' +
            '<div class="achievement-info">' +
            '<span class="achievement-title">' + a.title + '</span>' +
            '<span class="achievement-desc">' + a.desc + '</span>' +
            '</div>' +
            '</div>'
          );
        }).join('');
      }
      achievementModal.hidden = false;
    });
  }
  const achievementModalClose = document.getElementById('achievementModalClose');
  if (achievementModalClose && achievementModal) {
    achievementModalClose.addEventListener('click', () => { achievementModal.hidden = true; });
  }
  if (achievementModal) {
    achievementModal.addEventListener('click', (e) => {
      if (e.target === achievementModal) achievementModal.hidden = true;
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.filter = tab.dataset.filter || 'all';
      render(state.records, state.filter);
    });
  });

  // 历史类型页签（控制“健身/如厕/饭否/其他/全部类型”预览）
  historyTypeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      historyTypeTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.historyType = tab.dataset.historyType || 'all';
      render(state.records, state.filter);
    });
  });

  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', () => {
      hideConfirm();
    });
  }

  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', () => {
      if (pendingConfirm) {
        const fn = pendingConfirm;
        pendingConfirm = null;
        hideConfirm();
        fn();
      } else {
        hideConfirm();
      }
    });
  }

  // 点击遮罩空白处关闭弹窗
  if (confirmModalEl) {
    confirmModalEl.addEventListener('click', (e) => {
      if (e.target === confirmModalEl) {
        hideConfirm();
      }
    });
  }

  // 历史列表中的单条记录删除
  historyListEl.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('time-delete-btn')) return;

    const id = target.getAttribute('data-id');
    if (!id) return;

    const record = state.records.find((r) => r.id === id);
    if (!record) return;

    const label = getTypeLabel(record.type || 'other');
    const d = new Date(record.timestamp);

    showConfirm({
      title: '删除打卡记录',
      message: `确定删除【${label}】在【${formatDateDisplay(record.dateKey)} ${formatTime(
        d
      )}】的这条打卡记录吗？此操作不可恢复。`,
      onConfirm: () => {
        state.records = state.records.filter((r) => r.id !== id);
        saveRecords(state.records);
        render(state.records, state.filter);
      },
    });
  });

  exportBtn.addEventListener('click', () => {
    const actionsMenu = document.getElementById('actionsMenu');
    if (actionsMenu && actionsMenu.classList.contains('open')) actionsMenu.classList.remove('open');
    if (!state.records.length) {
      alert('暂无数据可导出');
      return;
    }
    const header = ['类型', '日期时间'];
    const rows = state.records
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((r) => {
        const d = new Date(r.timestamp);
        const dateTime = `${formatDateDisplay(r.dateKey)} ${formatTime(d)}`;
        return [getTypeLabel(r.type || 'other'), dateTime];
      });
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `打卡记录-全部-${getDateKey(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  const importBtn = document.getElementById('importBtn');
  const punchFileInput = document.getElementById('punchFileInput');
  if (importBtn && punchFileInput) {
    importBtn.addEventListener('click', () => {
      const actionsMenu = document.getElementById('actionsMenu');
      if (actionsMenu && actionsMenu.classList.contains('open')) actionsMenu.classList.remove('open');
      punchFileInput.value = '';
      punchFileInput.click();
    });
    punchFileInput.addEventListener('change', () => {
      const file = punchFileInput.files && punchFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          let text = typeof reader.result === 'string' ? reader.result : '';
          text = text.replace(/^\uFEFF/, '');
          const parsed = parsePunchCsv(text);
          if (!parsed.length) {
            alert('未解析到有效打卡数据，请确认 CSV 格式为：类型、日期时间');
            return;
          }
          state.records = state.records.concat(parsed);
          state.records.sort((a, b) => a.timestamp - b.timestamp);
          saveRecords(state.records);
          render(state.records, state.filter);
          alert('已导入 ' + parsed.length + ' 条打卡记录');
        } catch (e) {
          alert('解析失败：' + (e.message || '请确认文件为本应用导出的 CSV'));
        }
      };
      reader.readAsText(file, 'UTF-8');
    });
  }

  clearBtn.addEventListener('click', () => {
    const actionsMenu = document.getElementById('actionsMenu');
    if (actionsMenu && actionsMenu.classList.contains('open')) actionsMenu.classList.remove('open');
    if (!state.records.length) return;
    showConfirm({
      title: '清空所有记录',
      message: '确定要清空所有打卡记录吗？此操作不可恢复。',
      onConfirm: () => {
        state.records = [];
        saveRecords(state.records);
        render(state.records, state.filter);
      },
    });
  });

  // 姨妈打卡：来的第一天
  const periodStartBtn = document.getElementById('periodStartBtn');
  if (periodStartBtn) {
    periodStartBtn.addEventListener('click', () => {
      const open = getCurrentOpenPeriod(state.periodRecords);
      const todayKey = getDateKey(new Date());
      if (open) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = getDateKey(yesterday);
        showConfirm({
          title: '开始新周期',
          message: '当前有一周期未结束，将把上一周期结束日设为昨天，再记录本次开始。确定？',
          onConfirm: () => {
            open.endDate = yesterdayKey;
            const newPeriod = {
              id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              startDate: todayKey,
              endDate: null,
            };
            state.periodRecords.push(newPeriod);
            savePeriodRecords(state.periodRecords);
            renderPeriodPanel();
          },
        });
      } else {
        const newPeriod = {
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          startDate: todayKey,
          endDate: null,
        };
        state.periodRecords.push(newPeriod);
        savePeriodRecords(state.periodRecords);
        renderPeriodPanel();
      }
    });
  }

  // 姨妈打卡：结束了
  const periodEndBtn = document.getElementById('periodEndBtn');
  if (periodEndBtn) {
    periodEndBtn.addEventListener('click', () => {
      const open = getCurrentOpenPeriod(state.periodRecords);
      if (!open) return;
      const todayKey = getDateKey(new Date());
      open.endDate = todayKey;
      savePeriodRecords(state.periodRecords);
      renderPeriodPanel();
    });
  }

  // 姨妈历史删除
  const periodHistoryList = document.getElementById('periodHistoryList');
  if (periodHistoryList) {
    periodHistoryList.addEventListener('click', (e) => {
      const btn = e.target;
      if (!btn.classList.contains('period-history-delete')) return;
      const id = btn.getAttribute('data-period-id');
      if (!id) return;
      const p = state.periodRecords.find((r) => r.id === id);
      if (!p) return;
      const range = p.endDate
        ? `${formatDateDisplay(p.startDate)} ～ ${formatDateDisplay(p.endDate)}`
        : formatDateDisplay(p.startDate) + ' ～ 进行中';
      showConfirm({
        title: '删除经期记录',
        message: `确定删除「${range}」这条记录吗？此操作不可恢复。`,
        onConfirm: () => {
          state.periodRecords = state.periodRecords.filter((r) => r.id !== id);
          savePeriodRecords(state.periodRecords);
          renderPeriodPanel();
        },
      });
    });
  }

  // 姨妈打卡：导出数据
  const periodExportBtn = document.getElementById('periodExportBtn');
  if (periodExportBtn) {
    periodExportBtn.addEventListener('click', () => {
      if (!state.periodRecords.length) {
        alert('暂无经期数据可导出');
        return;
      }
      const header = ['开始日期', '结束日期', '天数'];
      const rows = [...state.periodRecords]
        .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))
        .map((p) => {
          const endDisplay = p.endDate ? formatDateDisplay(p.endDate) : '进行中';
          const days = p.endDate
            ? String(
                Math.round(
                  (new Date(p.endDate) - new Date(p.startDate)) /
                    (24 * 60 * 60 * 1000)
                ) + 1
              )
            : '-';
          return [formatDateDisplay(p.startDate), endDisplay, days];
        });
      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `经期记录-${getDateKey(new Date())}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const periodImportBtn = document.getElementById('periodImportBtn');
  const periodFileInput = document.getElementById('periodFileInput');
  if (periodImportBtn && periodFileInput) {
    periodImportBtn.addEventListener('click', () => {
      periodFileInput.value = '';
      periodFileInput.click();
    });
    periodFileInput.addEventListener('change', () => {
      const file = periodFileInput.files && periodFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          let text = typeof reader.result === 'string' ? reader.result : '';
          text = text.replace(/^\uFEFF/, '');
          const parsed = parsePeriodCsv(text);
          if (!parsed.length) {
            alert('未解析到有效经期数据，请确认 CSV 格式为：开始日期、结束日期、天数');
            return;
          }
          state.periodRecords = state.periodRecords.concat(parsed);
          state.periodRecords.sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
          savePeriodRecords(state.periodRecords);
          renderPeriodPanel();
          alert('已导入 ' + parsed.length + ' 条经期记录');
        } catch (e) {
          alert('解析失败：' + (e.message || '请确认文件为本应用导出的经期 CSV'));
        }
      };
      reader.readAsText(file, 'UTF-8');
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
  init();
  renderPeriodPanel();

  // 主题弹窗
  var themeBtn = document.getElementById('themeBtn');
  var themeModal = document.getElementById('themeModal');
  var themeModalClose = document.getElementById('themeModalClose');
  var themeColorInput = document.getElementById('themeColorInput');
  var themeResetBtn = document.getElementById('themeResetBtn');
  var themeHelpBtn = document.getElementById('themeHelpBtn');
  var themeHelpBlock = document.getElementById('themeHelpBlock');

  function openThemeModal() {
    var custom = getStoredTheme();
    if (custom) themeColorInput.value = custom;
    else themeColorInput.value = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6B7FD7';
    themeHelpBlock.hidden = true;
    themeModal.hidden = false;
  }

  function closeThemeModal() {
    themeModal.hidden = true;
  }

  if (themeBtn) themeBtn.addEventListener('click', openThemeModal);
  if (themeModalClose) themeModalClose.addEventListener('click', closeThemeModal);
  if (themeModal) {
    themeModal.addEventListener('click', function (e) {
      if (e.target === themeModal) closeThemeModal();
    });
  }
  if (themeColorInput) {
    themeColorInput.addEventListener('input', function () {
      var hex = themeColorInput.value;
      saveTheme(hex);
      applyCustomTheme(hex);
    });
  }
  if (themeResetBtn) {
    themeResetBtn.addEventListener('click', function () {
      saveTheme(null);
      applyDayTheme();
      closeThemeModal();
    });
  }
  if (themeHelpBtn && themeHelpBlock) {
    themeHelpBtn.addEventListener('click', function () {
      themeHelpBlock.hidden = !themeHelpBlock.hidden;
    });
  }

  var fab = document.getElementById('actionsFabToggle');
  var menu = document.getElementById('actionsMenu');
  if (fab && menu) {
    fab.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !fab.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
  }

  // 底部 Tab 切换
  var panelPunch = document.getElementById('panelPunch');
  var panelPeriod = document.getElementById('panelPeriod');
  var tabItems = document.querySelectorAll('.tab-bar-item');
  var actionsFab = document.getElementById('actionsFab');

  function switchTab(tab) {
    state.activeTab = tab;
    if (tab === 'punch') {
      if (panelPunch) {
        panelPunch.classList.add('active');
        panelPunch.removeAttribute('hidden');
      }
      if (panelPeriod) {
        panelPeriod.classList.remove('active');
        panelPeriod.hidden = true;
      }
      if (actionsFab) actionsFab.classList.remove('tab-period-hidden');
    } else {
      if (panelPunch) {
        panelPunch.classList.remove('active');
        panelPunch.hidden = true;
      }
      if (panelPeriod) {
        panelPeriod.classList.add('active');
        panelPeriod.removeAttribute('hidden');
      }
      if (actionsFab) actionsFab.classList.add('tab-period-hidden');
      renderPeriodPanel();
    }
    tabItems.forEach(function (item) {
      if (item.getAttribute('data-tab') === tab) {
        item.classList.add('active');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  tabItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var tab = item.getAttribute('data-tab');
      if (tab) switchTab(tab);
    });
  });
});

