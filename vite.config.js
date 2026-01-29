import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './', // 使用相对路径，支持直接打开 HTML 文件
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // includeAssets: ['icon-192.png', 'icon-512.png'], // 暂时注释掉，因为图标文件不存在
      manifest: {
        name: '打卡记录',
        short_name: '打卡',
        description: '轻量级打卡记录应用',
        theme_color: '#4F46E5',
        // GitHub Pages 上项目路径是 /punch-clock/
        // start_url 和 scope 使用绝对路径，保证从“添加到主屏幕”启动时不会指向错误的 /assets/... 路径
        start_url: '/punch-clock/',
        scope: '/punch-clock/',
        icons: [] // 暂时为空，等有图标文件后再添加
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

