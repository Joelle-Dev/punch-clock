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
const praiseWrapEl = document.getElementById('praiseWrap');
const praiseTextEl = document.getElementById('praiseText');
const praiseHeartsEl = document.getElementById('praiseHearts');

const STORAGE_KEY = 'punch_records_v1';

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
}

let state = {
  records: [],
  filter: 'all',
  currentType: 'fitness',
  historyType: 'all',
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

function init() {
  state.records = loadRecords();
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
    render(state.records, state.filter);

    // 按钮轻微弹跳动效
    punchBtn.classList.remove('punch-button-bounce');
    // 强制重绘以便重复触发动画
    // eslint-disable-next-line no-unused-expressions
    punchBtn.offsetWidth;
    punchBtn.classList.add('punch-button-bounce');

    // 潘秋瑾真棒：打卡旁爱心发散
    if (praiseTextEl) praiseTextEl.textContent = '潘秋瑾真棒！';
    if (praiseWrapEl) praiseWrapEl.classList.add('show');
    if (praiseHeartsEl) {
      praiseHeartsEl.innerHTML = '';
      const hearts = ['❤', '💜', '💗'];
      const r = 32;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
        const tx = Math.cos(angle) * r;
        const ty = Math.sin(angle) * r;
        const span = document.createElement('span');
        span.className = 'heart-burst';
        span.textContent = hearts[i % hearts.length];
        span.style.setProperty('--tx', tx + 'px');
        span.style.setProperty('--ty', ty + 'px');
        span.style.setProperty('--delay', i * 40 + 'ms');
        praiseHeartsEl.appendChild(span);
      }
    }
    if (praiseTimer) clearTimeout(praiseTimer);
    praiseTimer = setTimeout(() => {
      if (praiseWrapEl) praiseWrapEl.classList.remove('show');
    }, 1800);
  });

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
    const header = ['类型', '日期', '时间', '时间戳'];
    const rows = state.records
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((r) => {
        const d = new Date(r.timestamp);
        return [r.type || 'other', r.dateKey, formatTime(d), String(r.timestamp)];
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
}

document.addEventListener('DOMContentLoaded', function () {
  init();
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
});

