# Telegram Bot 完整设计方案

## 项目概述

为现有的代付平台开发 Telegram Bot，让用户可以在 Telegram 中完成所有网站功能，包括：
- USDT/TRX 代付
- 能量租赁
- 闪兑服务
- 订单查询
- 工单系统
- 账户管理

---

## 技术架构

### 1. Bot 框架选择
推荐使用 **node-telegram-bot-api** 或 **Telegraf**

```bash
npm install node-telegram-bot-api
# 或
npm install telegraf
```

### 2. 架构设计

```
┌─────────────────┐
│  Telegram Bot   │
│   (telegraf)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Bot Service    │
│  (bot/index.js) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  现有 API       │
│  (复用后端)     │
└─────────────────┘
```

---

## 功能模块设计

### 1. 用户认证模块

#### 绑定流程
```
用户 → /start → 生成绑定码 → 网站输入绑定码 → 绑定成功
```

#### 数据库扩展
在 User 模型中添加：
```javascript
{
  telegramId: String,        // Telegram 用户 ID
  telegramUsername: String,  // Telegram 用户名
  telegramBindCode: String,  // 绑定码
  telegramBindExpire: Date,  // 绑定码过期时间
  telegramBound: Boolean     // 是否已绑定
}
```

---

### 2. 主菜单设计

```
🏠 主菜单
├── 💰 代付服务
│   ├── USDT 代付
│   └── TRX 代付
├── ⚡ 能量租赁
├── 🔄 闪兑服务
├── 📋 我的订单
├── 💬 工单系统
├── 👤 个人中心
└── ❓ 帮助中心
```

---

### 3. 代付流程设计

#### USDT/TRX 代付流程
```
1. 用户点击 "USDT 代付"
2. Bot 询问：请输入数量
3. 用户输入：100
4. Bot 显示：
   - 数量：100 USDT
   - 汇率：7.2 CNY
   - 服务费：5 CNY (固定)
   - 总计：725 CNY
   - 请输入收款地址
5. 用户输入地址
6. Bot 确认订单信息
7. 用户确认后生成支付二维码
8. 用户支付后自动通知
9. 代付完成后发送通知
```

#### 交互示例
```
Bot: 💰 请输入 USDT 数量（最小 1，最大 200）

User: 100

Bot: 
📊 订单详情
━━━━━━━━━━━━━━━
💵 数量：100 USDT
💱 汇率：7.20 CNY/USDT
💰 金额：720.00 CNY
🔧 服务费：5.00 CNY [固定5]
━━━━━━━━━━━━━━━
💳 总计：725.00 CNY

📍 请输入收款地址：

User: Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Bot:
✅ 订单确认
━━━━━━━━━━━━━━━
💵 数量：100 USDT
📍 地址：TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
💳 总计：725.00 CNY
━━━━━━━━━━━━━━━

[✅ 确认支付] [❌ 取消]
```

---

### 4. 支付流程

#### 方案 A：生成支付链接
```javascript
Bot: 
💳 请选择支付方式：
[微信支付] [支付宝]

User: 点击 [微信支付]

Bot:
🔗 支付链接已生成
订单号：ORD1234567890
金额：725.00 CNY

👉 点击下方按钮完成支付
[立即支付]

⏰ 支付后请等待 2-10 分钟
💬 完成后会自动通知您
```

#### 方案 B：发送二维码图片
```javascript
Bot:
📱 请使用微信扫码支付
订单号：ORD1234567890
金额：725.00 CNY

[二维码图片]

⏰ 支付后请等待 2-10 分钟
💬 完成后会自动通知您
```

---

### 5. 订单查询

```
Bot: 📋 我的订单

最近订单：
━━━━━━━━━━━━━━━
🔸 订单 #1234
💰 100 USDT
📍 TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx
⏰ 2026-02-05 14:30
✅ 已完成
[查看详情]
━━━━━━━━━━━━━━━
🔸 订单 #1235
💰 50 TRX
📍 TYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYy
⏰ 2026-02-05 15:00
⏳ 处理中
[查看详情]
━━━━━━━━━━━━━━━

[查看更多] [返回主菜单]
```

---

### 6. 工单系统

```
Bot: 💬 工单系统

[📝 创建工单] [📋 我的工单]

User: 点击 [创建工单]

Bot: 
📝 请选择问题类型：
[代付问题] [充值问题] [账户问题] [其他]

User: 点击 [代付问题]

Bot:
📝 请描述您的问题：

User: 输入问题描述

Bot:
✅ 工单已创建
工单号：#12345
状态：待处理

我们会尽快回复您！
[返回工单列表]
```

---

### 7. 通知系统

#### 支付成功通知
```
🎉 支付成功！

订单号：ORD1234567890
金额：725.00 CNY

⏳ 正在处理 USDT 代付...
预计 2-10 分钟完成

💬 完成后会自动通知您
```

#### 代付完成通知
```
✅ 代付完成！

订单号：ORD1234567890
数量：100 USDT
地址：TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx

🔗 交易哈希：
abc123...xyz789

🔍 查看交易：
https://tronscan.org/#/transaction/abc123...

[查看订单详情]
```

#### 工单回复通知
```
💬 工单有新回复

工单号：#12345
标题：代付问题

客服回复：
您好，您的问题已经解决...

[查看详情] [回复]
```

---

## 代码实现

### 1. 项目结构

```
server/
├── bot/
│   ├── index.js              # Bot 主入口
│   ├── handlers/
│   │   ├── start.js          # /start 命令
│   │   ├── payment.js        # 代付功能
│   │   ├── energy.js         # 能量租赁
│   │   ├── swap.js           # 闪兑
│   │   ├── orders.js         # 订单查询
│   │   ├── tickets.js        # 工单系统
│   │   └── account.js        # 账户管理
│   ├── keyboards/
│   │   ├── main.js           # 主菜单键盘
│   │   ├── payment.js        # 支付键盘
│   │   └── orders.js         # 订单键盘
│   ├── middleware/
│   │   ├── auth.js           # 认证中间件
│   │   └── logger.js         # 日志中间件
│   └── utils/
│       ├── qrcode.js         # 二维码生成
│       └── formatter.js      # 消息格式化
├── models/
│   └── User.js               # 扩展用户模型
└── routes/
    └── telegram.js           # Telegram 相关 API
```

### 2. Bot 主入口 (server/bot/index.js)

```javascript
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');

// 导入处理器
const startHandler = require('./handlers/start');
const paymentHandler = require('./handlers/payment');
const ordersHandler = require('./handlers/orders');
const ticketsHandler = require('./handlers/tickets');

// 导入中间件
const authMiddleware = require('./middleware/auth');
const loggerMiddleware = require('./middleware/logger');

class TelegramBot {
  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupHandlers();
  }

  setupMiddleware() {
    // 日志中间件
    this.bot.use(loggerMiddleware);
    
    // 认证中间件（除了 /start 命令）
    this.bot.use((ctx, next) => {
      if (ctx.message?.text?.startsWith('/start')) {
        return next();
      }
      return authMiddleware(ctx, next);
    });
  }

  setupHandlers() {
    // 命令处理
    this.bot.command('start', startHandler.start);
    this.bot.command('menu', startHandler.menu);
    this.bot.command('help', startHandler.help);

    // 回调查询处理
    this.bot.action(/^payment_/, paymentHandler.handleCallback);
    this.bot.action(/^orders_/, ordersHandler.handleCallback);
    this.bot.action(/^tickets_/, ticketsHandler.handleCallback);

    // 文本消息处理
    this.bot.on('text', this.handleText.bind(this));
  }

  async handleText(ctx) {
    const user = ctx.session?.user;
    if (!user) {
      return ctx.reply('请先使用 /start 命令绑定账户');
    }

    // 根据用户状态处理不同的输入
    const state = ctx.session?.state;
    
    switch (state) {
      case 'waiting_usdt_amount':
        return paymentHandler.handleUSDTAmount(ctx);
      case 'waiting_usdt_address':
        return paymentHandler.handleUSDTAddress(ctx);
      case 'waiting_ticket_description':
        return ticketsHandler.handleDescription(ctx);
      default:
        return ctx.reply('请使用菜单选择功能', startHandler.getMainKeyboard());
    }
  }

  async start() {
    try {
      // 连接数据库
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB 连接成功');

      // 启动 Bot
      await this.bot.launch();
      console.log('🤖 Telegram Bot 已启动');

      // 优雅关闭
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      console.error('❌ Bot 启动失败:', error);
      process.exit(1);
    }
  }
}

module.exports = TelegramBot;
```

### 3. 主菜单键盘 (server/bot/keyboards/main.js)

```javascript
const { Markup } = require('telegraf');

function getMainKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('💰 USDT 代付', 'payment_usdt'),
      Markup.button.callback('💰 TRX 代付', 'payment_trx')
    ],
    [
      Markup.button.callback('⚡ 能量租赁', 'energy_rental'),
      Markup.button.callback('🔄 闪兑服务', 'swap_service')
    ],
    [
      Markup.button.callback('📋 我的订单', 'orders_list'),
      Markup.button.callback('💬 工单系统', 'tickets_list')
    ],
    [
      Markup.button.callback('👤 个人中心', 'account_info'),
      Markup.button.callback('❓ 帮助中心', 'help_center')
    ]
  ]);
}

function getPaymentMethodKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('💳 微信支付', 'pay_wechat'),
      Markup.button.callback('💳 支付宝', 'pay_alipay')
    ],
    [Markup.button.callback('« 返回', 'back_to_main')]
  ]);
}

function getConfirmKeyboard(action) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ 确认', `confirm_${action}`),
      Markup.button.callback('❌ 取消', 'cancel')
    ]
  ]);
}

module.exports = {
  getMainKeyboard,
  getPaymentMethodKeyboard,
  getConfirmKeyboard
};
```

### 4. 代付处理器 (server/bot/handlers/payment.js)

```javascript
const axios = require('axios');
const QRCode = require('qrcode');
const { getMainKeyboard, getPaymentMethodKeyboard, getConfirmKeyboard } = require('../keyboards/main');

// 处理 USDT 代付
async function handleUSDTPayment(ctx) {
  ctx.session.paymentType = 'USDT';
  ctx.session.state = 'waiting_usdt_amount';
  
  // 获取限额
  const settings = await getSettings();
  const maxAmount = getMaxAmount(settings.tieredFeeRulesUSDT);
  
  await ctx.reply(
    `💰 USDT 代付\n\n` +
    `请输入 USDT 数量：\n` +
    `最小：1 USDT\n` +
    `最大：${maxAmount} USDT\n\n` +
    `💡 输入数字即可，例如：100`,
    Markup.inlineKeyboard([[Markup.button.callback('« 返回', 'back_to_main')]])
  );
}

// 处理用户输入的数量
async function handleUSDTAmount(ctx) {
  const amount = parseFloat(ctx.message.text);
  
  if (isNaN(amount) || amount <= 0) {
    return ctx.reply('❌ 请输入有效的数字');
  }

  // 检查限额
  const settings = await getSettings();
  const maxAmount = getMaxAmount(settings.tieredFeeRulesUSDT);
  
  if (amount > maxAmount) {
    return ctx.reply(`❌ 超出限额！最大支持 ${maxAmount} USDT`);
  }

  // 计算费用
  const feeInfo = calculateFee(amount, 'USDT', settings);
  
  ctx.session.paymentData = {
    type: 'USDT',
    amount: amount,
    ...feeInfo
  };
  
  ctx.session.state = 'waiting_usdt_address';
  
  await ctx.reply(
    `📊 订单详情\n` +
    `━━━━━━━━━━━━━━━\n` +
    `💵 数量：${amount} USDT\n` +
    `💱 汇率：${feeInfo.rate} CNY/USDT\n` +
    `💰 金额：${feeInfo.cnyAmount} CNY\n` +
    `🔧 服务费：${feeInfo.serviceFee} CNY ${feeInfo.feeLabel}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `💳 总计：${feeInfo.totalCNY} CNY\n\n` +
    `📍 请输入收款地址：`,
    Markup.inlineKeyboard([[Markup.button.callback('« 返回', 'back_to_main')]])
  );
}

// 处理用户输入的地址
async function handleUSDTAddress(ctx) {
  const address = ctx.message.text.trim();
  
  // 验证地址格式
  if (!isValidTronAddress(address)) {
    return ctx.reply('❌ 无效的 TRON 地址，请重新输入');
  }

  ctx.session.paymentData.address = address;
  ctx.session.state = 'confirm_payment';
  
  const data = ctx.session.paymentData;
  
  await ctx.reply(
    `✅ 订单确认\n` +
    `━━━━━━━━━━━━━━━\n` +
    `💵 数量：${data.amount} ${data.type}\n` +
    `📍 地址：${formatAddress(address)}\n` +
    `💳 总计：${data.totalCNY} CNY\n` +
    `━━━━━━━━━━━━━━━\n\n` +
    `请确认订单信息`,
    getConfirmKeyboard('payment')
  );
}

// 确认支付
async function confirmPayment(ctx) {
  const data = ctx.session.paymentData;
  const user = ctx.session.user;
  
  try {
    // 调用后端 API 创建订单
    const response = await axios.post(`${process.env.API_URL}/api/payments`, {
      payType: data.type,
      amount: data.amount,
      address: data.address,
      paymentMethod: 'wechat', // 稍后选择
      email: user.email,
      telegramId: ctx.from.id
    });

    const order = response.data.payment;
    
    ctx.session.currentOrder = order;
    ctx.session.state = 'select_payment_method';
    
    await ctx.editMessageText(
      `✅ 订单已创建\n` +
      `订单号：${order.platformOrderId}\n\n` +
      `💳 请选择支付方式：`,
      getPaymentMethodKeyboard()
    );
  } catch (error) {
    await ctx.reply(`❌ 创建订单失败：${error.message}`);
  }
}

// 生成支付二维码
async function generatePaymentQR(ctx, paymentMethod) {
  const order = ctx.session.currentOrder;
  
  try {
    // 更新支付方式
    await axios.patch(`${process.env.API_URL}/api/payments/${order._id}`, {
      paymentMethod
    });

    // 获取支付链接
    const paymentUrl = order.paymentUrl;
    
    // 生成二维码
    const qrBuffer = await QRCode.toBuffer(paymentUrl, {
      width: 400,
      margin: 2
    });

    await ctx.replyWithPhoto(
      { source: qrBuffer },
      {
        caption:
          `📱 请使用${paymentMethod === 'wechat' ? '微信' : '支付宝'}扫码支付\n\n` +
          `订单号：${order.platformOrderId}\n` +
          `金额：${order.totalCNY} CNY\n\n` +
          `⏰ 支付后请等待 2-10 分钟\n` +
          `💬 完成后会自动通知您\n\n` +
          `🔗 或点击下方按钮在浏览器中支付`,
        ...Markup.inlineKeyboard([
          [Markup.button.url('🌐 浏览器支付', paymentUrl)],
          [Markup.button.callback('🔄 刷新状态', `check_order_${order._id}`)]
        ])
      }
    );
  } catch (error) {
    await ctx.reply(`❌ 生成支付二维码失败：${error.message}`);
  }
}

// 辅助函数
function isValidTronAddress(address) {
  return /^T[A-Za-z1-9]{33}$/.test(address);
}

function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

async function getSettings() {
  const response = await axios.get(`${process.env.API_URL}/api/settings/public`);
  return response.data;
}

function getMaxAmount(rules) {
  const parsed = JSON.parse(rules || '[]');
  const maxAmounts = parsed.map(r => r.maxAmount).filter(m => m < 999999);
  return maxAmounts.length > 0 ? Math.max(...maxAmounts) : 200;
}

function calculateFee(amount, type, settings) {
  // 复用网站的费率计算逻辑
  // ...
}

module.exports = {
  handleUSDTPayment,
  handleUSDTAmount,
  handleUSDTAddress,
  confirmPayment,
  generatePaymentQR,
  handleCallback: async (ctx) => {
    const action = ctx.callbackQuery.data;
    
    if (action === 'payment_usdt') {
      await handleUSDTPayment(ctx);
    } else if (action === 'payment_trx') {
      // TRX 代付逻辑
    } else if (action.startsWith('confirm_')) {
      await confirmPayment(ctx);
    } else if (action === 'pay_wechat') {
      await generatePaymentQR(ctx, 'wechat');
    } else if (action === 'pay_alipay') {
      await generatePaymentQR(ctx, 'alipay');
    }
  }
};
```

### 5. 通知服务 (server/bot/notifications.js)

```javascript
const { Telegraf } = require('telegraf');

class NotificationService {
  constructor(bot) {
    this.bot = bot;
  }

  // 支付成功通知
  async notifyPaymentSuccess(telegramId, order) {
    try {
      await this.bot.telegram.sendMessage(
        telegramId,
        `🎉 支付成功！\n\n` +
        `订单号：${order.platformOrderId}\n` +
        `金额：${order.totalCNY} CNY\n\n` +
        `⏳ 正在处理 ${order.payType} 代付...\n` +
        `预计 2-10 分钟完成\n\n` +
        `💬 完成后会自动通知您`
      );
    } catch (error) {
      console.error('发送支付成功通知失败:', error);
    }
  }

  // 代付完成通知
  async notifyTransferComplete(telegramId, order) {
    try {
      await this.bot.telegram.sendMessage(
        telegramId,
        `✅ 代付完成！\n\n` +
        `订单号：${order.platformOrderId}\n` +
        `数量：${order.amount} ${order.payType}\n` +
        `地址：${this.formatAddress(order.address)}\n\n` +
        `🔗 交易哈希：\n${order.txHash}\n\n` +
        `🔍 查看交易：\nhttps://tronscan.org/#/transaction/${order.txHash}`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '📋 查看订单详情', callback_data: `order_detail_${order._id}` }
            ]]
          }
        }
      );
    } catch (error) {
      console.error('发送代付完成通知失败:', error);
    }
  }

  // 工单回复通知
  async notifyTicketReply(telegramId, ticket, reply) {
    try {
      await this.bot.telegram.sendMessage(
        telegramId,
        `💬 工单有新回复\n\n` +
        `工单号：#${ticket.ticketNumber}\n` +
        `标题：${ticket.subject}\n\n` +
        `客服回复：\n${reply.message}\n\n` +
        `回复时间：${new Date(reply.createdAt).toLocaleString('zh-CN')}`,
        {
          reply_markup: {
            inline_keyboard: [[
              { text: '📋 查看详情', callback_data: `ticket_detail_${ticket._id}` },
              { text: '💬 回复', callback_data: `ticket_reply_${ticket._id}` }
            ]]
          }
        }
      );
    } catch (error) {
      console.error('发送工单回复通知失败:', error);
    }
  }

  formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  }
}

module.exports = NotificationService;
```

---

## 环境配置

### .env 文件添加

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

### 获取 Bot Token

1. 在 Telegram 中找到 @BotFather
2. 发送 `/newbot`
3. 按提示设置 Bot 名称和用户名
4. 获取 Token

---

## 部署步骤

### 1. 安装依赖

```bash
npm install telegraf qrcode axios
```

### 2. 启动 Bot

在 `server/index.js` 中添加：

```javascript
const TelegramBot = require('./bot');

// 启动 Telegram Bot
if (process.env.TELEGRAM_BOT_TOKEN) {
  const telegramBot = new TelegramBot();
  telegramBot.start();
}
```

### 3. 配置 Webhook（可选）

```javascript
// 使用 Webhook 模式（推荐生产环境）
bot.telegram.setWebhook(`${process.env.TELEGRAM_WEBHOOK_URL}`);

// 添加 Webhook 路由
app.use(bot.webhookCallback('/api/telegram/webhook'));
```

---

## 用户使用流程

### 1. 首次使用

```
1. 用户在 Telegram 搜索你的 Bot
2. 点击 Start
3. Bot 生成绑定码：ABC123
4. 用户登录网站
5. 在个人中心输入绑定码
6. 绑定成功
```

### 2. 日常使用

```
1. 用户发送 /menu 或点击菜单按钮
2. 选择功能（如 USDT 代付）
3. 按提示输入信息
4. 确认订单
5. 扫码支付
6. 等待通知
```

---

## 优势

✅ **便捷性**：无需打开网站，直接在 TG 完成操作
✅ **实时通知**：支付、代付、工单回复即时推送
✅ **安全性**：复用现有后端，数据统一管理
✅ **用户体验**：简洁的对话式交互
✅ **多语言**：可轻松扩展多语言支持

---

## 后续扩展

1. **管理员功能**：在 TG 中处理工单、查看统计
2. **群组功能**：在群组中提供服务
3. **自动客服**：AI 回复常见问题
4. **推广功能**：邀请返佣、推广链接
5. **多语言**：支持英文、日文等

---

## 预估工作量

- **基础框架**：2-3 天
- **代付功能**：2-3 天
- **订单查询**：1 天
- **工单系统**：1-2 天
- **通知系统**：1 天
- **测试优化**：2-3 天

**总计**：10-15 天

---

## 费用预估

- **开发成本**：根据工作量
- **服务器成本**：无额外成本（复用现有服务器）
- **Bot 成本**：免费

---

需要我开始实现吗？我可以先创建基础框架和代付功能。
