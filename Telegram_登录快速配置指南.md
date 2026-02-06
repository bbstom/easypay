# Telegram 登录快速配置指南

## ✅ 已完成的功能

### 1. 打开 Telegram 应用登录（推荐）
- ✅ 使用 `tg://` 协议直接调用本地应用
- ✅ 自动回退到网页版（未安装应用时）
- ✅ 一键快速登录
- ✅ 用户确认机制

### 2. 扫描二维码登录
- ✅ 动态生成二维码
- ✅ 2分钟自动过期
- ✅ 支持刷新二维码
- ✅ 实时状态轮询

### 3. 安全机制
- ✅ 唯一登录令牌
- ✅ 超时保护
- ✅ 用户确认
- ✅ 自动清理过期数据

## 🚀 快速启动

### 1. 确保环境变量配置正确

```bash
# .env 文件
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username  # 不带 @
APP_URL=https://your-domain.com
API_URL=http://localhost:5000
```

### 2. 启动服务

```bash
# 启动后端
npm run server

# 或使用 PM2
pm2 start ecosystem.config.js

# 启动前端
npm run dev
```

### 3. 测试功能

```bash
# 运行测试脚本
node test-telegram-app-login.js
```

## 📋 测试清单

### 基础功能测试
- [ ] 打开应用登录 - 已安装应用
- [ ] 打开应用登录 - 未安装应用（回退到网页版）
- [ ] 扫码登录 - 新用户
- [ ] 扫码登录 - 已有用户
- [ ] 二维码过期处理
- [ ] 刷新二维码
- [ ] 取消登录
- [ ] 确认登录

### 浏览器兼容性
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] 移动端浏览器

### 设备测试
- [ ] Windows 桌面
- [ ] macOS 桌面
- [ ] iOS 移动端
- [ ] Android 移动端

## 🎯 使用方法

### 用户操作流程

#### 方式一：打开应用登录
1. 访问登录页面
2. 点击"打开 Telegram 应用登录"按钮
3. Telegram 应用自动打开
4. 在 Telegram 中点击"✅ 确认登录"
5. 自动完成登录

#### 方式二：扫码登录
1. 访问登录页面
2. 点击"或扫描二维码登录"按钮
3. 用 Telegram 扫描二维码
4. 在 Telegram 中点击"✅ 确认登录"
5. 自动完成登录

## 🔧 配置说明

### 前端配置

**文件：** `src/pages/LoginPage.jsx`

```javascript
// Bot 用户名配置
const botUsername = process.env.REACT_APP_TELEGRAM_BOT_USERNAME || 'YourBotUsername';

// 轮询间隔（毫秒）
const pollInterval = 2000; // 每2秒检查一次

// 超时时间（毫秒）
const timeout = 120000; // 2分钟
```

### 后端配置

**文件：** `server/routes/auth.js`

```javascript
// 登录会话存储（生产环境建议使用 Redis）
global.qrLoginSessions = {};

// 会话过期时间（毫秒）
const sessionTimeout = 300000; // 5分钟
```

### Bot 配置

**文件：** `server/bot/handlers/start.js`

```javascript
// API URL 配置
const apiUrl = process.env.API_URL || 'http://localhost:5000';

// 处理登录令牌
if (startPayload && startPayload.startsWith('login_')) {
  return handleQRLogin(ctx, startPayload, ...);
}
```

## 📱 UI 界面

### 登录按钮

```jsx
{/* 打开应用按钮 - 主要推荐 */}
<button className="bg-[#0088cc] hover:bg-[#0077b5] ...">
  📱 打开 Telegram 应用登录
</button>

{/* 扫码按钮 - 备选方式 */}
<button className="bg-white border-2 border-[#0088cc] ...">
  📷 或扫描二维码登录
</button>
```

### 二维码显示

```jsx
{/* 二维码容器 */}
<div className="bg-white p-4 rounded-2xl border-2 border-blue-300">
  <img src={qrCodeUrl} alt="登录二维码" className="w-64 h-64" />
</div>

{/* 等待提示 */}
<div className="text-blue-600">
  <div className="animate-spin ..."></div>
  <span>等待扫码...</span>
</div>
```

### 过期提示

```jsx
{/* 过期遮罩 */}
<div className="absolute inset-0 bg-black bg-opacity-50 ...">
  <div className="text-white text-center">
    <div className="text-2xl mb-2">⏰</div>
    <div className="font-bold">二维码已过期</div>
  </div>
</div>
```

## 🔐 安全机制

### 1. 令牌生成
```javascript
const token = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```
- 时间戳 + 随机字符串
- 确保唯一性
- 防止重放攻击

### 2. 超时保护
```javascript
// 二维码过期
setTimeout(() => setQrCodeExpired(true), 120000);

// 轮询停止
setTimeout(() => clearInterval(pollInterval), 120000);

// 会话清理
setTimeout(() => delete global.qrLoginSessions[token], 300000);
```

### 3. 用户确认
```javascript
// Telegram 中显示确认按钮
reply_markup: {
  inline_keyboard: [[
    { text: '✅ 确认登录', callback_data: `confirm_login_${token}` },
    { text: '❌ 取消', callback_data: 'cancel_login' }
  ]]
}
```

## 🐛 故障排查

### 问题 1: 点击按钮没有反应

**检查项：**
```bash
# 1. 检查环境变量
echo $TELEGRAM_BOT_USERNAME

# 2. 检查浏览器控制台
# 打开开发者工具 -> Console

# 3. 检查网络请求
# 打开开发者工具 -> Network
```

### 问题 2: 二维码无法扫描

**检查项：**
```bash
# 1. 检查 Bot 是否启动
pm2 status

# 2. 检查 Bot 日志
pm2 logs telegram-bot

# 3. 测试 Bot 命令
# 在 Telegram 中发送 /start
```

### 问题 3: 确认后没有登录

**检查项：**
```bash
# 1. 检查后端日志
pm2 logs server

# 2. 测试 API
curl http://localhost:5000/api/auth/check-qr-login?token=test

# 3. 检查数据库连接
node server/scripts/checkAdmin.js
```

### 问题 4: 移动端显示异常

**检查项：**
```bash
# 1. 清除浏览器缓存
# 2. 检查 Tailwind CSS 配置
# 3. 使用开发者工具检查响应式
```

## 📊 性能优化

### 1. 使用 Redis 存储会话

**当前实现：**
```javascript
global.qrLoginSessions[token] = data;
```

**优化方案：**
```javascript
const redis = require('redis');
const client = redis.createClient();

// 存储会话（5分钟过期）
await client.setex(`qr_login:${token}`, 300, JSON.stringify(data));

// 获取会话
const data = await client.get(`qr_login:${token}`);
```

### 2. 使用 WebSocket 替代轮询

**当前实现：**
```javascript
setInterval(async () => {
  const response = await fetch(`/api/auth/check-qr-login?token=${token}`);
  // ...
}, 2000);
```

**优化方案：**
```javascript
const socket = io();

socket.on('login_success', (data) => {
  // 立即处理登录
  telegramLogin(data.userData);
});
```

### 3. 二维码缓存

**当前实现：**
```javascript
const qrDataUrl = await QRCode.toDataURL(deepLink);
```

**优化方案：**
```javascript
// 缓存二维码
const cacheKey = `qr_${token}`;
let qrDataUrl = cache.get(cacheKey);

if (!qrDataUrl) {
  qrDataUrl = await QRCode.toDataURL(deepLink);
  cache.set(cacheKey, qrDataUrl, 120); // 缓存2分钟
}
```

## 📝 API 文档

### 1. 检查登录状态

**请求：**
```http
GET /api/auth/check-qr-login?token=login_1234567890_abc123xyz
```

**响应（未登录）：**
```json
{
  "success": false
}
```

**响应（已登录）：**
```json
{
  "success": true,
  "userData": {
    "id": "123456789",
    "first_name": "Test",
    "last_name": "User",
    "username": "test_user",
    "photo_url": "",
    "auth_date": 1234567890,
    "hash": "abc123..."
  }
}
```

### 2. 确认登录（Bot 调用）

**请求：**
```http
POST /api/auth/confirm-qr-login
Content-Type: application/json

{
  "token": "login_1234567890_abc123xyz",
  "telegramId": "123456789",
  "username": "test_user",
  "firstName": "Test",
  "lastName": "User",
  "photoUrl": ""
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录确认成功"
}
```

### 3. Telegram 登录

**请求：**
```http
POST /api/auth/telegram-login
Content-Type: application/json

{
  "id": "123456789",
  "first_name": "Test",
  "last_name": "User",
  "username": "test_user",
  "photo_url": "",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

**响应：**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "test_user",
    "email": "123456789@telegram.user",
    "role": "user",
    "telegramId": "123456789",
    "telegramUsername": "test_user",
    "telegramFirstName": "Test",
    "telegramLastName": "User",
    "telegramPhotoUrl": ""
  }
}
```

## 🎉 完成！

现在您的网站已经支持两种 Telegram 登录方式：

✅ **打开应用登录** - 快速便捷，一键完成
✅ **扫码登录** - 安全可靠，跨设备使用

用户可以根据自己的需求选择最合适的登录方式！

## 📚 相关文档

- `Telegram_登录方案优化.md` - 详细的技术实现说明
- `Telegram_登录流程说明.md` - 完整的流程图和说明
- `test-telegram-app-login.js` - 测试脚本

## 💡 下一步

1. 运行测试脚本验证功能
2. 在浏览器中测试两种登录方式
3. 在移动端测试用户体验
4. 根据需要调整 UI 样式
5. 考虑使用 Redis 优化性能
6. 考虑使用 WebSocket 替代轮询

祝您使用愉快！🚀
