# 多 Bot 登录 Token 修复

## 问题描述

在多 Bot 模式下，Telegram 登录功能失败，错误信息：

```
❌ 确认登录错误: TypeError [ERR_INVALID_ARG_TYPE]: The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received undefined
    at Hash.update (node:internal/crypto/hash:142:11)
    at /www/wwwroot/kk.vpno.eu.org/easypay/server/routes/auth.js:381:51
```

## 问题原因

在 `server/routes/auth.js` 中，有两处代码直接使用 `process.env.TELEGRAM_BOT_TOKEN`：

1. **Telegram 登录验证**（第 127 行）
2. **二维码登录确认**（第 381 行）

但在多 Bot 模式下，环境变量配置是：

```bash
# 多 Bot 模式
TELEGRAM_BOT_TOKENS=token1,token2,token3
TELEGRAM_BOT_USERNAMES=bot1,bot2,bot3

# 没有 TELEGRAM_BOT_TOKEN（单数）
```

导致 `botToken` 为 `undefined`，在进行哈希计算时报错。

## 修复方案

修改 `server/routes/auth.js`，支持多 Bot 模式：

### 修复 1：Telegram 登录验证

**修复前**：
```javascript
// 验证 Telegram 数据
const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  return res.status(500).json({ error: 'Telegram Bot 未配置' });
}
```

**修复后**：
```javascript
// 验证 Telegram 数据
// 支持多 Bot 模式：优先使用 TELEGRAM_BOT_TOKEN，如果不存在则使用第一个 Token
let botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken && process.env.TELEGRAM_BOT_TOKENS) {
  // 多 Bot 模式：使用第一个 Token
  botToken = process.env.TELEGRAM_BOT_TOKENS.split(',')[0].trim();
}

if (!botToken) {
  return res.status(500).json({ error: 'Telegram Bot 未配置' });
}
```

### 修复 2：二维码登录确认

**修复前**：
```javascript
// 生成 hash
const crypto = require('crypto');
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const checkString = Object.keys(userData)
  .sort()
  .map(key => `${key}=${userData[key]}`)
  .join('\n');
const secretKey = crypto.createHash('sha256').update(botToken).digest();
userData.hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
```

**修复后**：
```javascript
// 生成 hash
const crypto = require('crypto');
// 支持多 Bot 模式：优先使用 TELEGRAM_BOT_TOKEN，如果不存在则使用第一个 Token
let botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken && process.env.TELEGRAM_BOT_TOKENS) {
  // 多 Bot 模式：使用第一个 Token
  botToken = process.env.TELEGRAM_BOT_TOKENS.split(',')[0].trim();
}

if (!botToken) {
  throw new Error('未配置 Telegram Bot Token');
}

const checkString = Object.keys(userData)
  .sort()
  .map(key => `${key}=${userData[key]}`)
  .join('\n');
const secretKey = crypto.createHash('sha256').update(botToken).digest();
userData.hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
```

## 修复逻辑

### Token 获取优先级

1. **优先使用单 Bot Token**：`process.env.TELEGRAM_BOT_TOKEN`
2. **如果不存在，使用多 Bot 的第一个 Token**：`process.env.TELEGRAM_BOT_TOKENS.split(',')[0]`
3. **如果都不存在，抛出错误**

### 为什么使用第一个 Token？

在多 Bot 模式下：
- **第一个 Bot** 用于网站登录（`TELEGRAM_BOT_USERNAME` 或 `REACT_APP_TELEGRAM_BOT_USERNAME`）
- **其他 Bot** 用于处理用户交互

因此，登录验证应该使用第一个 Bot 的 Token。

## 环境变量配置

### 单 Bot 模式（向后兼容）

```bash
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_BOT_USERNAME=my_bot
```

### 多 Bot 模式

```bash
TELEGRAM_BOT_TOKENS=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11,789012:XYZ-GHI5678jkLmn-abc12D3e4f567gh89
TELEGRAM_BOT_USERNAMES=official_bot,support_bot

# 网站登录使用第一个 Bot
REACT_APP_TELEGRAM_BOT_USERNAME=official_bot
```

## 部署步骤

```bash
# 1. 提交代码
git add server/routes/auth.js
git commit -m "修复多 Bot 模式下的登录 Token 问题"
git push origin main

# 2. 服务器部署
cd /www/wwwroot/kk.vpno.eu.org/easypay
git pull origin main

# 3. 重启服务
pm2 restart easypay-backend
```

## 验证步骤

### 1. 测试二维码登录

1. 访问网站登录页面
2. 点击"Telegram 登录"
3. 扫描二维码
4. 在 Telegram 中点击"✅ 确认登录"
5. 应该成功登录，不再出现 `undefined` 错误

### 2. 测试 Telegram Widget 登录

1. 访问网站登录页面
2. 点击"Login with Telegram"按钮
3. 在弹出窗口中授权
4. 应该成功登录

### 3. 检查日志

```bash
# 查看错误日志
pm2 logs easypay-backend --err --lines 50

# 应该不再看到：
# ❌ 确认登录错误: TypeError [ERR_INVALID_ARG_TYPE]
```

## 相关文件

- `server/routes/auth.js` - 认证路由（已修复）
- `server/bot/MultiBotManager.js` - 多 Bot 管理器
- `server/bot/handlers/start.js` - 登录处理器
- `.env` - 环境变量配置

## 技术细节

### Telegram 登录验证流程

1. **前端发送登录数据**：
   ```javascript
   {
     id: '123456789',
     first_name: 'John',
     username: 'john_doe',
     auth_date: 1234567890,
     hash: 'abc123...'
   }
   ```

2. **后端验证数据完整性**：
   ```javascript
   // 使用 Bot Token 生成密钥
   const secretKey = crypto.createHash('sha256').update(botToken).digest();
   
   // 计算 HMAC
   const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
   
   // 验证 hash
   if (hmac !== hash) {
     throw new Error('数据验证失败');
   }
   ```

3. **创建或更新用户**：
   ```javascript
   let user = await User.findOne({ telegramId: id.toString() });
   if (!user) {
     user = await User.create({ ... });
   }
   ```

4. **生成 JWT Token**：
   ```javascript
   const token = jwt.sign({ userId: user._id }, JWT_SECRET);
   res.json({ token, user });
   ```

### 为什么需要 Bot Token？

Telegram 登录使用 Bot Token 作为密钥来验证数据完整性：

1. **防止数据篡改**：使用 HMAC-SHA256 确保数据未被修改
2. **验证数据来源**：确保数据来自 Telegram 服务器
3. **保证安全性**：只有拥有 Bot Token 的服务器才能验证数据

## 注意事项

### 1. Token 安全

⚠️ **重要**：Bot Token 是敏感信息，不要泄露！

```bash
# ❌ 错误：Token 暴露在代码中
const botToken = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';

# ✅ 正确：Token 存储在环境变量中
const botToken = process.env.TELEGRAM_BOT_TOKEN;
```

### 2. 多 Bot 一致性

在多 Bot 模式下，确保：
- 网站登录使用第一个 Bot
- 登录验证使用第一个 Bot 的 Token
- 用户绑定的是第一个 Bot

### 3. 向后兼容

修复后的代码同时支持：
- 单 Bot 模式（`TELEGRAM_BOT_TOKEN`）
- 多 Bot 模式（`TELEGRAM_BOT_TOKENS`）

## 相关问题修复

这次修复同时解决了：

1. ✅ 多 Bot 模式下的二维码登录
2. ✅ 多 Bot 模式下的 Telegram Widget 登录
3. ✅ 登录数据验证失败的问题
4. ✅ `undefined` 哈希计算错误

## 总结

修复内容：
- ✅ 修复 `server/routes/auth.js` 中的两处 Token 获取逻辑
- ✅ 支持单 Bot 和多 Bot 模式
- ✅ 保持向后兼容性
- ✅ 添加错误处理

现在 Telegram 登录功能在多 Bot 模式下应该可以正常工作了！🎉
