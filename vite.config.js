import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
    },
    define: {
      // 将环境变量注入到前端代码中
      'process.env.REACT_APP_TELEGRAM_BOT_USERNAME': JSON.stringify(
        env.REACT_APP_TELEGRAM_BOT_USERNAME || env.TELEGRAM_BOT_USERNAME || 'YourBotUsername'
      )
    }
  };
});
