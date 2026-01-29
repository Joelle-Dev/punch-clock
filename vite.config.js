import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // 使用相对路径，支持直接打开 HTML 文件
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png.jpg', 'icon-512.png.jpg'],
      manifest: {
        name: '潘秋瑾打卡',
        short_name: '秋瑾打卡',
        description: '送给潘秋瑾的专属打卡小本本',
        theme_color: '#4F46E5',
        // GitHub Pages 上项目路径是 /punch-clock/
        // start_url 和 scope 使用绝对路径，保证从“添加到主屏幕”启动时不会指向错误的 /assets/... 路径
        start_url: '/punch-clock/',
        scope: '/punch-clock/',
        icons: [
          {
            src: 'icon-192.png.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'icon-512.png.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json}']
      },
      // 确保使用相对路径注册 Service Worker
      strategies: 'generateSW'
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});

