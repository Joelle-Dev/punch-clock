import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// 重新开启 PWA 与启动页配置
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
        background_color: '#F9FAFB',
        // GitHub Pages 上项目路径是 /punch-clock/
        // 使用绝对路径，保证从“添加到主屏幕”启动时直接打开正确首页
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
        globPatterns: ['**/*.{js,css,html,png,svg,jpg,jpeg,json}']
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});

