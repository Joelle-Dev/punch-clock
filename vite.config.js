import { defineConfig } from 'vite';

// 暂时关闭 PWA/启动页，只保留纯静态站点
export default defineConfig({
  base: './', // 使用相对路径，支持直接打开 HTML 文件
  plugins: [],
  server: {
    port: 3000,
    open: true
  }
});

