module.exports = {
  apps: [{
    name: 'easypay-backend',
    script: './server/index.js',
    cwd: '/www/wwwroot/kk.vpno.eu.org/easypay',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
      // PORT 从 .env 文件读取
    },
    error_file: '/root/.pm2/logs/easypay-error.log',
    out_file: '/root/.pm2/logs/easypay-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
