import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false, // 不清空输出目录，避免删除宝塔的 .user.ini
  },
  server: {
    port: 3000,
    host: true, // 允许外部访问
    allowedHosts: [
      'dd.vpno.eu.org',
      '.vpno.eu.org', // 允许所有 vpno.eu.org 的子域名
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
