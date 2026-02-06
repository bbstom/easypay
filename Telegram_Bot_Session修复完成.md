# Telegram Bot Session 修复完成

## 问题描述

启动 Bot 后，发送 `/start` 命令时出现错误：
```
TypeError: Cannot set properties of undefined (setting 'user')
```

## 问题原因

`ctx.session` 在使用前未正确初始化。虽然配置了 session 中间件，但需要提供默认的 session 对象。

## 修复内容

### 1. Bot Index 文件 (`server/bot/index.js`)

#### 修复 1：Session 中间件配置
```javascript
// 修复前
this.bot.use(session());

// 修复后
this.bot.use(session({
  defaultSession: () => ({})
}));
```

#### 修复 2：用户认证中间件
```javascript
// 用户认证中间件
this.bot.use(async (ctx, next) => {
  // 确保 session 已初始化
  if (!ctx.session) {
    ctx.session = {};
  }

  // /start 命令不需要认证
  if (ctx.message?.text?.startsWith('/start')) {
    return next();
  }

  // 获取或创建用户
  if (!ctx.session.user) {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) {
      return next();
    }

    const user = await User.findOne({ telegramId });
    
    if (user) {
      ctx.session.user = user;
    } else {
      // 未找到用户，提示使用 /start
      return ctx.reply(
        '❌ 请先使用 /start 命令开始使用',
        { reply_markup: { remove_keyboard: true } }
      );
    }
  }

  return next();
});
```

### 2. Start 处理器 (`server/bot/handlers/start.js`)

添加 session 初始化检查：
```javascript
async function start(ctx) {
  // ... 其他代码 ...

  try {
    // 确保 session 已初始化
    if (!ctx.session) {
      ctx.session = {};
    }

    // ... 其他代码 ...
  }
}
```

## 测试步骤

### 1. 重启服务
```bash
pm2 restart easypay
```

### 2. 测试 /start 命令
1. 在 Telegram 中找到你的 Bot
2. 发送 `/start` 命令
3. 应该看到欢迎消息和主菜单

### 3. 预期结果

**新用户：**
```
🎉 欢迎使用 FastPay！

✅ 您的账户已自动创建
👤 用户名：your_username
🆔 TG ID：123456789

💡 您可以直接开始使用所有功能！

📱 如果您想在网站上使用，可以：
1️⃣ 访问 https://kk.vpno.eu.org
2️⃣ 点击 "使用 Telegram 登录"
3️⃣ 授权后即可同步使用

请选择您需要的服务：
```

**老用户：**
```
👋 欢迎回来，FirstName！

📊 账户信息：
👤 用户名：your_username
📧 邮箱：your_email@example.com
🆔 TG ID：123456789

请选择您需要的服务：
```

## 技术细节

### Session 存储

当前使用内存存储（默认）：
- 优点：简单、快速
- 缺点：重启服务后 session 丢失

**生产环境建议：**
使用持久化存储（如 Redis）：
```javascript
const RedisSession = require('telegraf-session-redis');

this.bot.use(new RedisSession({
  store: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  }
}));
```

### Session 数据结构

```javascript
ctx.session = {
  user: {
    _id: '...',
    username: '...',
    email: '...',
    telegramId: '...',
    // ... 其他用户字段
  },
  state: 'waiting_usdt_amount', // 当前状态
  paymentData: {
    type: 'USDT',
    amount: 100,
    address: 'T...',
    // ... 其他支付数据
  },
  currentOrder: {
    // 当前订单数据
  }
}
```

### 中间件执行顺序

1. **Session 中间件** - 初始化 `ctx.session`
2. **日志中间件** - 记录请求
3. **用户认证中间件** - 加载用户信息
4. **命令/回调处理器** - 处理具体逻辑

## 常见问题

### Q1: Session 数据丢失？
**原因：** 使用内存存储，服务重启后丢失

**解决：**
1. 使用 Redis 存储（推荐）
2. 或者在每次操作时从数据库重新加载用户

### Q2: Session 占用内存过大？
**原因：** 用户过多，内存存储不适合

**解决：**
1. 切换到 Redis 存储
2. 设置 session 过期时间
3. 定期清理过期 session

### Q3: 多实例部署 session 不同步？
**原因：** 内存存储是进程隔离的

**解决：**
必须使用 Redis 等外部存储

## 下一步优化

### 1. 添加 Redis Session（可选）
```bash
npm install telegraf-session-redis
```

### 2. 添加 Session 过期时间
```javascript
this.bot.use(session({
  defaultSession: () => ({}),
  ttl: 86400 // 24小时过期
}));
```

### 3. 添加 Session 清理
定期清理过期或无效的 session

## 相关文件

- `server/bot/index.js` - Bot 主文件
- `server/bot/handlers/start.js` - Start 命令处理器
- `server/models/User.js` - 用户模型

## 测试清单

- [x] 修复 session 初始化
- [x] 修复用户认证中间件
- [x] 添加 session 检查
- [ ] 测试 /start 命令
- [ ] 测试新用户注册
- [ ] 测试老用户登录
- [ ] 测试其他命令
- [ ] 测试支付流程

---

**修复时间：** 2026-02-05
**状态：** 已修复，待测试
