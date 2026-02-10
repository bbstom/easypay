# 多 Bot 配置和登录说明

## 问题

在多个 Telegram Bot 的情况下，网站登录时调用哪个 Bot？

---

## 答案

### 单 Bot 模式（默认）

**配置**（`.env`）：
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=YourBotUsername
```

**网站登录**：
- 使用 `TELEGRAM_BOT_USERNAME` 配置的 Bot
- 前端读取 `process.env.REACT_APP_TELEGRAM_BOT_USERNAME`
- 生成登录链接：`https://t.me/YourBotUsername?start=login_xxx`

### 多 Bot 模式

**配置**（`.env`）：
```env
# 多个 Bot Token（用逗号分隔）
TELEGRAM_BOT_TOKENS=token1,token2,token3

# 多个 Bot 用户名（用逗号分隔，顺序对应）
TELEGRAM_BOT_USERNAMES=Bot1Username,Bot2Username,Bot3Username

# 网站登录使用的 Bot（必须配置）
TELEGRAM_BOT_USERNAME=Bot1Username
```

**网站登录**：
- 使用 `TELEGRAM_BOT_USERNAME` 指定的 Bot
- 即使有多个 Bot，网站登录只使用第一个或指定的 Bot
- 其他 Bot 用于其他功能（如通知、群组管理等）

---

## 配置详解

### 1. 环境变量优先级

**前端读取顺序**（`vite.config.js`）：
```javascript
process.env.REACT_APP_TELEGRAM_BOT_USERNAME  // 最高优先级
|| process.env.TELEGRAM_BOT_USERNAME         // 次优先级
|| 'YourBotUsername'                         // 默认值
```

**后端读取顺序**（`MultiBotManager.js`）：
```javascript
// 多 Bot 模式
if (process.env.TELEGRAM_BOT_TOKENS && process.env.TELEGRAM_BOT_USERNAMES) {
  // 使用多 Bot 配置
}
// 单 Bot 模式
else if (process.env.TELEGRAM_BOT_TOKEN) {
  // 使用单 Bot 配置
}
```

### 2. 配置方式

#### 方式 A：单 Bot（推荐新手）

```env
# .env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=MyPaymentBot
```

**特点**：
- 简单易用
- 一个 Bot 处理所有功能
- 适合小型项目

#### 方式 B：多 Bot（推荐大型项目）

```env
# .env
# 多个 Bot（用逗号分隔）
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=PaymentBot,NotifyBot,GroupBot

# 网站登录使用的 Bot（必须指定）
TELEGRAM_BOT_USERNAME=PaymentBot

# 或者使用 REACT_APP_ 前缀（优先级更高）
REACT_APP_TELEGRAM_BOT_USERNAME=PaymentBot
```

**特点**：
- 功能分离
- 负载均衡
- 适合大型项目

**用途分配**：
- Bot 1 (PaymentBot)：网站登录、支付功能
- Bot 2 (NotifyBot)：发送通知、消息推送
- Bot 3 (GroupBot)：群组管理、客服

#### 方式 C：混合模式

```env
# .env
# 后端使用多 Bot
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=PaymentBot,NotifyBot,GroupBot

# 前端登录使用指定 Bot
REACT_APP_TELEGRAM_BOT_USERNAME=PaymentBot
```

**特点**：
- 后端多 Bot 运行
- 前端只使用指定 Bot 登录
- 灵活性最高

---

## 登录流程

### 1. 用户点击"Telegram 登录"

**前端代码**（`src/pages/LoginPage.jsx`）：
```javascript
const handleTelegramAppLogin = () => {
  // 读取 Bot 用户名
  const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'YourBotUsername';
  
  // 生成登录令牌
  const token = generateToken();
  
  // 生成深度链接
  const deepLink = `https://t.me/${botUsername}?start=login_${token}`;
  
  // 跳转到 Telegram
  window.location.href = deepLink;
};
```

### 2. Telegram 打开 Bot

用户在 Telegram 中打开指定的 Bot，发送 `/start login_xxx`

### 3. Bot 处理登录

**后端代码**（`server/bot/handlers/start.js`）：
```javascript
// 所有 Bot 都可以处理登录
// 但前端只会跳转到指定的 Bot
if (startParam && startParam.startsWith('login_')) {
  const token = startParam.replace('login_', '');
  // 验证 token
  // 创建用户
  // 返回登录确认
}
```

### 4. 用户确认登录

用户在 Bot 中点击"确认登录"按钮

### 5. 网站自动登录

前端轮询检查登录状态，自动登录成功

---

## 配置示例

### 示例 1：单 Bot 配置

```env
# .env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=EasyPayBot
```

**效果**：
- 网站登录：`https://t.me/EasyPayBot?start=login_xxx`
- 所有功能都通过 `EasyPayBot` 处理

### 示例 2：多 Bot 配置（推荐）

```env
# .env
# 后端运行 3 个 Bot
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=EasyPayBot,EasyPayNotify,EasyPayGroup

# 前端登录使用第一个 Bot
TELEGRAM_BOT_USERNAME=EasyPayBot
```

**效果**：
- 网站登录：`https://t.me/EasyPayBot?start=login_xxx`
- 支付功能：`EasyPayBot` 处理
- 通知推送：`EasyPayNotify` 处理
- 群组管理：`EasyPayGroup` 处理

### 示例 3：指定登录 Bot

```env
# .env
# 后端运行多个 Bot
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=Bot1,Bot2,Bot3

# 前端登录使用 Bot2
REACT_APP_TELEGRAM_BOT_USERNAME=Bot2
```

**效果**：
- 网站登录：`https://t.me/Bot2?start=login_xxx`
- 后端 3 个 Bot 都在运行
- 但网站登录只使用 Bot2

---

## 常见问题

### Q1: 多个 Bot 时，网站登录用哪个？

**答**：使用 `TELEGRAM_BOT_USERNAME` 或 `REACT_APP_TELEGRAM_BOT_USERNAME` 指定的 Bot。

**优先级**：
1. `REACT_APP_TELEGRAM_BOT_USERNAME`（最高）
2. `TELEGRAM_BOT_USERNAME`
3. 默认值 `YourBotUsername`

### Q2: 可以让用户选择登录 Bot 吗？

**答**：可以，但需要修改代码。

**实现方法**：

1. 在登录页面添加 Bot 选择器：

```jsx
const [selectedBot, setSelectedBot] = useState('Bot1');

const bots = [
  { username: 'Bot1', name: '支付 Bot' },
  { username: 'Bot2', name: '通知 Bot' },
  { username: 'Bot3', name: '群组 Bot' }
];

<select onChange={(e) => setSelectedBot(e.target.value)}>
  {bots.map(bot => (
    <option key={bot.username} value={bot.username}>
      {bot.name}
    </option>
  ))}
</select>
```

2. 使用选择的 Bot 生成登录链接：

```javascript
const deepLink = `https://t.me/${selectedBot}?start=login_${token}`;
```

### Q3: 多个 Bot 会冲突吗？

**答**：不会，每个 Bot 独立运行。

**说明**：
- 每个 Bot 有独立的 Token 和用户名
- 后端同时运行多个 Bot 实例
- 互不干扰

### Q4: 如何知道用户从哪个 Bot 登录？

**答**：可以在登录 token 中包含 Bot 信息。

**实现方法**：

```javascript
// 前端生成 token
const token = `${botUsername}_${randomString}`;
const deepLink = `https://t.me/${botUsername}?start=login_${token}`;

// 后端解析 token
const [botUsername, randomPart] = token.split('_');
console.log(`用户从 @${botUsername} 登录`);
```

### Q5: 必须配置多个 Bot 吗？

**答**：不是必须的。

**建议**：
- **小型项目**：单 Bot 足够
- **中型项目**：2-3 个 Bot（支付、通知、群组）
- **大型项目**：多个 Bot 负载均衡

---

## 最佳实践

### 1. Bot 命名规范

```
主 Bot：YourProjectBot
通知 Bot：YourProjectNotify
群组 Bot：YourProjectGroup
客服 Bot：YourProjectSupport
```

### 2. 功能分配

| Bot | 功能 | 用途 |
|-----|------|------|
| 主 Bot | 登录、支付、订单 | 用户主要交互 |
| 通知 Bot | 消息推送、提醒 | 避免打扰主 Bot |
| 群组 Bot | 群组管理、统计 | 专门处理群组消息 |
| 客服 Bot | 工单、客服 | 客服专用 |

### 3. 配置建议

**开发环境**（`.env.development`）：
```env
TELEGRAM_BOT_TOKEN=dev_token
TELEGRAM_BOT_USERNAME=DevBot
```

**生产环境**（`.env.production`）：
```env
TELEGRAM_BOT_TOKENS=prod_token1,prod_token2,prod_token3
TELEGRAM_BOT_USERNAMES=ProdBot,ProdNotify,ProdGroup
TELEGRAM_BOT_USERNAME=ProdBot
```

### 4. 安全建议

- ✅ 不要在代码中硬编码 Token
- ✅ 使用环境变量
- ✅ 生产环境使用不同的 Bot
- ✅ 定期轮换 Token
- ❌ 不要将 Token 提交到 Git

---

## 配置检查清单

### 前端配置

- [ ] `.env` 中配置了 `TELEGRAM_BOT_USERNAME`
- [ ] 或配置了 `REACT_APP_TELEGRAM_BOT_USERNAME`
- [ ] Bot 用户名正确（不含 @）
- [ ] 重新构建前端（`npm run build`）

### 后端配置

- [ ] `.env` 中配置了 `TELEGRAM_BOT_TOKEN`
- [ ] 或配置了 `TELEGRAM_BOT_TOKENS`（多 Bot）
- [ ] Bot Token 正确
- [ ] Bot 已启动（`pm2 logs` 查看）

### 验证方法

1. **检查前端配置**：
   ```javascript
   console.log(process.env.REACT_APP_TELEGRAM_BOT_USERNAME);
   ```

2. **检查后端配置**：
   ```bash
   pm2 logs | grep "Bot.*已启动"
   ```

3. **测试登录链接**：
   ```
   https://t.me/YourBotUsername?start=test
   ```

---

## 总结

### 单 Bot 模式

```env
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_BOT_USERNAME=MyBot
```

- 网站登录：`https://t.me/MyBot?start=login_xxx`
- 简单易用

### 多 Bot 模式

```env
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=Bot1,Bot2,Bot3
TELEGRAM_BOT_USERNAME=Bot1  # 网站登录使用这个
```

- 网站登录：`https://t.me/Bot1?start=login_xxx`
- 功能分离，负载均衡

### 关键点

1. **网站登录使用**：`TELEGRAM_BOT_USERNAME` 或 `REACT_APP_TELEGRAM_BOT_USERNAME` 指定的 Bot
2. **优先级**：`REACT_APP_TELEGRAM_BOT_USERNAME` > `TELEGRAM_BOT_USERNAME` > 默认值
3. **多 Bot**：后端可以运行多个 Bot，但网站登录只使用指定的一个
4. **配置位置**：`.env` 文件

现在你知道如何配置了！网站登录使用 `TELEGRAM_BOT_USERNAME` 指定的 Bot，即使有多个 Bot 运行。
