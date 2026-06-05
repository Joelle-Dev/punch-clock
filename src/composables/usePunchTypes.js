import { ref, computed } from 'vue';
import { ToiletIcon, OtherIcon } from '../components/icons';
import { PUNCH_TYPE_STORAGE_KEY, TOILET_AMOUNT_LABELS } from '../constants';

const DEFAULT_PUNCH_TYPES = [
  { type: 'toilet', label: '如厕', emoji: '🚽', short: '厕', tint: '#4caf50', iconName: 'toilet' },
];

const ICONS = {
  toilet: ToiletIcon,
};

function normalizeTypeKey(label) {
  const slug = String(label)
    .trim()
    .toLowerCase()
    .replace(/[\s_/]+/g, '-')
    .replace(/[^\p{L}\d-]+/gu, '')
    .replace(/(^-|-$)/g, '');
  return slug || `custom-${Math.random().toString(36).slice(2, 6)}`;
}

function mapTypeEntry(entry) {
  return {
    ...entry,
    iconComponent: ICONS[entry.iconName] || OtherIcon,
    short: entry.short || String(entry.label || '').slice(0, 1),
    custom: entry.custom || false,
  };
}

function loadTypes() {
  if (typeof window === 'undefined') {
    return DEFAULT_PUNCH_TYPES.map(mapTypeEntry);
  }
  try {
    const raw = localStorage.getItem(PUNCH_TYPE_STORAGE_KEY);
    if (!raw) {
      const defaults = DEFAULT_PUNCH_TYPES.map((entry) => ({ ...entry, custom: false }));
      localStorage.setItem(PUNCH_TYPE_STORAGE_KEY, JSON.stringify(defaults));
      return defaults.map(mapTypeEntry);
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length) throw new Error('invalid types');
    return parsed.map(mapTypeEntry);
  } catch (err) {
    console.error('Failed to load punch types', err);
    return DEFAULT_PUNCH_TYPES.map(mapTypeEntry);
  }
}

function saveTypes(types) {
  if (typeof window === 'undefined') return;
  const raw = types.map(({ iconComponent, ...rest }) => rest);
  localStorage.setItem(PUNCH_TYPE_STORAGE_KEY, JSON.stringify(raw));
}

const typesRef = ref(loadTypes());

export function usePunchTypes() {
  const typeList = computed(() => typesRef.value.map(mapTypeEntry));

  function findType(type) {
    return typeList.value.find((t) => t.type === type) || null;
  }

  function getTypeLabel(type) {
    return findType(type)?.label || type || '其他';
  }

  function getTypeByLabel(label) {
    return typeList.value.find((t) => t.label === label) || null;
  }

  function addType({ label, emoji = '✨', tint = '#9c27b0' }) {
    const name = String(label || '').trim();
    if (!name) return null;
    let typeKey = normalizeTypeKey(name);
    while (typesRef.value.some((t) => t.type === typeKey)) {
      typeKey = `${typeKey}-${Math.random().toString(36).slice(2, 4)}`;
    }
    const short = String(name).slice(0, 1);
    const entry = {
      type: typeKey,
      label: name,
      emoji,
      short,
      tint,
      iconName: 'other',
      custom: true,
    };
    typesRef.value = [...typesRef.value, entry];
    saveTypes(typesRef.value);
    return mapTypeEntry(entry);
  }

  function removeType(type) {
    const found = typesRef.value.find((t) => t.type === type);
    if (!found) return false;
    // allow removal if it's a custom type, or one of the legacy built-in keys
    const allowedToRemove = found.custom || ['fitness', 'meal', 'other'].includes(type);
    if (!allowedToRemove) return false;
    typesRef.value = typesRef.value.filter((t) => t.type !== type);
    saveTypes(typesRef.value);
    return true;
  }

  function reorderType(type, direction) {
    const index = typesRef.value.findIndex((t) => t.type === type);
    if (index === -1) return false;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= typesRef.value.length) return false;
    const updated = [...typesRef.value];
    const [item] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, item);
    typesRef.value = updated;
    saveTypes(typesRef.value);
    return true;
  }

  function resetTypes() {
    typesRef.value = DEFAULT_PUNCH_TYPES.map((entry) => ({ ...entry, custom: false }));
    saveTypes(typesRef.value);
  }

  return {
    typeList,
    findType,
    getTypeLabel,
    getTypeByLabel,
    addType,
    removeType,
    reorderType,
    resetTypes,
  };
}
