# 多 Bot 群发消息说明

## 问题回答

**在多 Bot 情况下，群发消息调用的是哪个 Bot？**

**答案**：群发消息**始终使用第一个 Bot**（`this.bots[0]`）。

## 代码分析

### 1. Bot 实例获取

在 `server/bot/MultiBotManager.js` 中：

```javascript
/**
 * 获取 Bot 实例（用于通知服务）
 */
getBotInstance() {
  if (this.bots.length === 0) return null;
  return this.bots[0];  // 🔥 始终返回第一个 Bot
}
```

### 2. 群发服务调用

在 `server/services/broadcastScheduler.js` 中：

```javascript
async executeBroadcast(broadcast) {
  // 获取 Bot 实例
  const botInstance = getBotInstance();  // 🔥 获取第一个 Bot
  if (!botInstance || !botInstance.bot) {
    throw new Error('Bot 实例未初始化');
  }

  const bot = botInstance.bot;
  
  // 使用这个 Bot 发送消息
  await bot.telegram.sendMessage(chatId, message, options);
}
```

### 3. Bot 初始化顺序

在 `server/bot/MultiBotManager.js` 中：

```javascript
initializeBots() {
  const multiTokens = process.env.TELEGRAM_BOT_TOKENS;
  const multiUsernames = process.env.TELEGRAM_BOT_USERNAMES;

  if (multiTokens && multiUsernames) {
    // 多 Bot 模式
    const tokens = multiTokens.split(',').map(t => t.trim());
    const usernames = multiUsernames.split(',').map(u => u.trim());

    tokens.forEach((token, index) => {
      if (token) {
        const username = usernames[index];
        this.createBot(token, username, index + 1);  // 按顺序创建
      }
    });
  }
}
```

## 配置示例

### .env 文件配置

```bash
# 多 Bot 配置（逗号分隔）
TELEGRAM_BOT_TOKENS=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11,789012:XYZ-GHI5678jkLmn-abc12D3e4f567gh89
TELEGRAM_BOT_USERNAMES=bot1_username,bot2_username

# 第一个 Bot 用于：
# 1. 群发消息
# 2. 系统通知
# 3. 订单通知
# 4. 支付通知

# 第二个 Bot 用于：
# 1. 接收用户消息
# 2. 处理用户命令
# 3. 响应用户查询
```

## Bot 使用场景

### 第一个 Bot（主 Bot）

**用途**：
- ✅ 群发消息（广播）
- ✅ 系统通知
- ✅ 订单通知
- ✅ 支付成功通知
- ✅ 工单回复通知

**特点**：
- 单向发送为主
- 不需要频繁交互
- 适合作为官方通知账号

### 其他 Bot（辅助 Bot）

**用途**：
- ✅ 接收用户消息
- ✅ 处理用户命令
- ✅ 响应用户查询
- ✅ 处理回调按钮

**特点**：
- 双向交互
- 需要处理大量用户请求
- 可以分散负载

## 为什么这样设计？

### 1. 统一发送源

**优点**：
- 用户收到的所有通知都来自同一个 Bot
- 保持品牌一致性
- 避免用户混淆

**示例**：
```
用户视角：
- 所有订单通知 → 来自 @official_bot
- 所有支付通知 → 来自 @official_bot
- 所有群发消息 → 来自 @official_bot
```

### 2. 负载分散

**优点**：
- 第一个 Bot 专注于发送通知
- 其他 Bot 处理用户交互
- 避免单个 Bot 过载

**示例**：
```
Bot 1 (@official_bot):
- 发送 10000 条群发消息
- 发送订单通知
- 发送支付通知

Bot 2 (@support_bot):
- 处理用户咨询
- 响应用户命令
- 处理回调按钮
```

### 3. 功能隔离

**优点**：
- 通知功能独立
- 交互功能独立
- 互不影响

## 如何修改群发 Bot？

如果需要使用其他 Bot 进行群发，可以修改 `MultiBotManager.js`：

### 方案 1：使用指定索引的 Bot

```javascript
/**
 * 获取 Bot 实例（用于通知服务）
 * @param {number} index - Bot 索引（默认 0）
 */
getBotInstance(index = 0) {
  if (this.bots.length === 0) return null;
  if (index >= this.bots.length) return this.bots[0];
  return this.bots[index];
}
```

### 方案 2：使用指定用户名的 Bot

```javascript
/**
 * 根据用户名获取 Bot 实例
 * @param {string} username - Bot 用户名
 */
getBotByUsername(username) {
  if (!username) return this.bots[0];
  const bot = this.bots.find(b => b.username === username);
  return bot || this.bots[0];
}
```

### 方案 3：使用环境变量指定

```javascript
/**
 * 获取群发专用 Bot
 */
getBroadcastBot() {
  const broadcastBotUsername = process.env.BROADCAST_BOT_USERNAME;
  if (broadcastBotUsername) {
    const bot = this.bots.find(b => b.username === broadcastBotUsername);
    if (bot) return bot;
  }
  return this.bots[0];  // 默认使用第一个
}
```

然后在 `.env` 中配置：

```bash
# 指定群发专用 Bot
BROADCAST_BOT_USERNAME=official_bot
```

## 实际应用建议

### 推荐配置（2 个 Bot）

```bash
# Bot 1: 官方通知 Bot
TELEGRAM_BOT_TOKENS=123456:ABC...,789012:XYZ...
TELEGRAM_BOT_USERNAMES=official_bot,support_bot

# Bot 1 用于：
# - 群发消息
# - 订单通知
# - 支付通知

# Bot 2 用于：
# - 用户咨询
# - 命令处理
# - 回调处理
```

### 推荐配置（3 个 Bot）

```bash
# Bot 1: 官方通知 Bot
# Bot 2: 客服 Bot
# Bot 3: 测试 Bot
TELEGRAM_BOT_TOKENS=123456:ABC...,789012:XYZ...,345678:DEF...
TELEGRAM_BOT_USERNAMES=official_bot,support_bot,test_bot

# Bot 1 用于：
# - 群发消息
# - 系统通知

# Bot 2 用于：
# - 用户交互
# - 客服支持

# Bot 3 用于：
# - 开发测试
# - 功能验证
```

## 注意事项

### 1. Bot Token 顺序

⚠️ **重要**：Bot Token 的顺序决定了哪个 Bot 用于群发！

```bash
# 第一个 Token 对应的 Bot 将用于群发
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=bot1,bot2,bot3
                       ^^^^
                       这个 Bot 用于群发
```

### 2. 用户绑定

- 用户可以通过任何一个 Bot 登录
- 登录后，用户信息会保存到数据库
- 所有 Bot 都可以访问同一个用户数据

### 3. 消息发送限制

Telegram Bot API 限制：
- 每秒最多 30 条消息
- 每分钟最多 20 条消息到同一个群组
- 建议添加发送延迟

### 4. 错误处理

如果第一个 Bot 不可用：
- 群发消息会失败
- 需要手动切换到其他 Bot
- 或者修改代码使用备用 Bot

## 相关文件

- `server/bot/MultiBotManager.js` - 多 Bot 管理器
- `server/services/broadcastScheduler.js` - 群发调度服务
- `server/routes/telegram.js` - Telegram 路由（群发 API）
- `.env` - 环境变量配置

## 总结

在多 Bot 情况下：

1. **群发消息使用第一个 Bot**（`this.bots[0]`）
2. **第一个 Bot 由 `.env` 中的第一个 Token 决定**
3. **所有系统通知都使用第一个 Bot**
4. **其他 Bot 主要用于处理用户交互**

如果需要修改，可以：
- 调整 `.env` 中 Token 的顺序
- 修改 `getBotInstance()` 方法
- 添加环境变量指定群发 Bot
