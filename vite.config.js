import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from '@vant/auto-import-resolver';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [VantResolver()],
      dts: false,
    }),
    Components({
      resolvers: [VantResolver()],
      dts: false,
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-192.png.jpg', 'icon-512.png.jpg'],
      manifest: {
        name: '打我小本本',
        short_name: '打卡',
        description: '轻量级打卡记录应用',
        theme_color: '#4F46E5',
        background_color: '#F9FAFB', // 淡灰背景，避免黑屏
        display: 'standalone',
        // GitHub Pages 上项目路径是 /punch-clock/
        // 使用绝对路径，保证从"添加到主屏幕"启动时直接打开正确首页
        start_url: '/punch-clock/',
        scope: '/punch-clock/',
        // 主屏幕图标请使用正方形图（如 512×512、192×192），否则会显示为长方形
        icons: [
          {
            src: './icon-192.png.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any'
          },
          {
            src: './icon-512.png.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,jpg,jpeg,json,mp3,m4a}']
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});
