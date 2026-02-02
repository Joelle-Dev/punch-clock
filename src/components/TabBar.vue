<template>
  <van-tabbar route fixed placeholder class="app-tabbar">
    <van-tabbar-item v-for="tab in tabs" :key="tab.path" :to="tab.path">
      <template #icon>
        <component :is="tab.icon" />
      </template>
      {{ tab.label }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { h } from 'vue';
import { ProfileIcon } from './icons';

const tabs = [
  {
    path: '/punch',
    label: '打我',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 26, height: 26 }, [
        h('path', {
          d: 'M12 0l1.5 6.5L20 8l-6.5 1.5L12 16l-1.5-6.5L4 8l6.5-1.5L12 0z',
        }),
      ]),
  },
  {
    path: '/period',
    label: '姨妈记',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 26, height: 26 }, [
        h('path', {
          d: 'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 0 1-4.9 4.9 9 9 0 0 0-4-13.54z',
        }),
      ]),
  },
  {
    path: '/record',
    label: '记录',
    icon: () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', width: 26, height: 26 }, [
        h('path', {
          d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
        }),
      ]),
  },
  {
    path: '/mine',
    label: '我呀',
    icon: () => h(ProfileIcon, { size: 30, variant: 'tab' }),
  },
];
</script>
