const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const paymentRoutes = require('./routes/payments');
const settingsRoutes = require('./routes/settings');
const walletRoutes = require('./routes/wallet');
const walletsRoutes = require('./routes/wallets'); // 多钱包管理路由
const usersRoutes = require('./routes/users'); // 用户管理路由
const faqRoutes = require('./routes/faq'); // FAQ路由
const ticketsRoutes = require('./routes/tickets'); // 工单路由
const swapRoutes = require('./routes/swap'); // 闪兑路由
const telegramRoutes = require('./routes/telegram'); // Telegram管理路由
const telegramCommandsRoutes = require('./routes/telegram-commands'); // Telegram命令管理路由
const exchangeRateService = require('./services/exchangeRateService');
const orderTimeoutService = require('./services/orderTimeoutService');
const swapService = require('./services/swapService'); // 闪兑服务
const walletUpdateService = require('./services/walletUpdateService'); // 钱包余额更新服务
const { getBotInstance } = require('./bot'); // Telegram Bot

const app = express();

// CORS 配置 - 允许前端域名访问
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://kk.vpno.eu.org',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（比如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fastpay')
  .then(() => {
    console.log('✅ MongoDB 连接成功');
    // 启动汇率自动更新服务
    exchangeRateService.startAutoUpdate();
    // 启动订单超时检查服务
    orderTimeoutService.start();
    // 启动闪兑监控服务
    swapService.startMonitoring();
    // 启动钱包余额自动更新服务（每小时更新一次）
    walletUpdateService.start(60);
    // 启动 Telegram Bot
    const telegramBot = getBotInstance();
    if (telegramBot) {
      telegramBot.start();
    }
  })
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/wallets', walletsRoutes); // 多钱包管理 API
app.use('/api/users', usersRoutes); // 用户管理 API
app.use('/api/faq', faqRoutes); // FAQ API
app.use('/api/tickets', ticketsRoutes); // 工单 API
app.use('/api/swap', swapRoutes); // 闪兑 API
app.use('/api/telegram', telegramRoutes); // Telegram管理 API
app.use('/api/telegram-commands', telegramCommandsRoutes); // Telegram命令管理 API

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
});
