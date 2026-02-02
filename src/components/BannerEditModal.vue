<template>
  <BaseModal v-model:open="open" title="编辑头部文案">
    <div class="banner-edit-row">
      <label class="banner-edit-label">顶部显示的文案</label>
      <textarea
        v-model="editText"
        class="banner-edit-input"
        rows="3"
        placeholder="例如：潘秋瑾，今天也要开心 ✨"
        maxlength="100"
      />
    </div>
    <div class="banner-edit-actions">
      <van-button type="primary" block round :loading="saving" @click="save">保存</van-button>
    </div>
    <p class="banner-edit-tip">保存后对方会实时看到新文案，无需刷新。</p>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { showToast } from 'vant';
import BaseModal from './BaseModal.vue';
import { postBanner, getAdminToken } from '../utils/bannerApi';

const props = defineProps({ open: Boolean });
const emit = defineEmits(['update:open']);

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
});

const getCurrentBannerText = inject('getCurrentBannerText', () => '');
const setRemoteBannerText = inject('setRemoteBannerText', () => {});

const editText = ref('');
const saving = ref(false);

watch(() => props.open, (isOpen) => {
  if (isOpen) editText.value = getCurrentBannerText() || '';
});

async function save() {
  const text = editText.value.trim();
  saving.value = true;
  try {
    const ok = await postBanner(text, getAdminToken());
    if (ok) {
      setRemoteBannerText(text || null);
      showToast('已更新');
      open.value = false;
    } else {
      showToast('保存失败，请检查网络或鉴权');
    }
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.banner-edit-row { margin-bottom: 16px; }
.banner-edit-label {
  display: block;
  font-size: 14px;
  color: var(--text-2);
  margin-bottom: 8px;
}
.banner-edit-input {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--separator);
  border-radius: var(--radius);
  resize: vertical;
  box-sizing: border-box;
}
.banner-edit-actions { margin-bottom: 12px; }
.banner-edit-actions .van-button { background: var(--primary) !important; border-color: var(--primary) !important; }
.banner-edit-actions .van-button:active { background: var(--primary-dark) !important; border-color: var(--primary-dark) !important; }
.banner-edit-tip {
  font-size: 12px;
  color: var(--text-3);
  margin: 0;
}
</style>
