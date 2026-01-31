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

function getTypeFromLabel(label) {
  const map = { 如厕: 'toilet', 饭否: 'meal', 健身: 'fitness', 其他: 'other' };
  return map[label] || 'other';
}

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

export function parsePunchCsv(text) {
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

export function parsePeriodCsv(text) {
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
