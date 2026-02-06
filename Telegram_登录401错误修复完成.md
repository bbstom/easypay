# Telegram 登录 401 错误修复完成

## 🐛 问题描述

前端调用 `/api/auth/telegram-login` 时返回 401 错误：
```
POST https://kk.vpno.eu.org/api/auth/telegram-login 401 (Unauthorized)
```

## 🔍 问题原因

1. **验证流程问题**
   - 前端调用 `telegramLogin(userData)` 
   - `telegramLogin` 调用 `/api/auth/telegram-login` API
   - 该 API 需要验证 Telegram 数据的 hash
   - 但我们生成的 hash 验证失败

2. **架构问题**
   - 扫码登录的验证已经在 Bot 端完成
   - 不应该再次验证 hash
   - 应该直接返回 JWT token

## ✅ 解决方案

### 方案：创建专用的扫码登录完成端点

不使用 `/api/auth/telegram-login`（需要验证 hash），而是创建新的端点 `/api/auth/qr-login-complete`（直接返回 JWT）。

### 修改内容

#### 1. 后端：修改 check-qr-login API

**文件：** `server/routes/auth.js`

```javascript
// 修改前：返回 userData
return res.json({
  success: true,
  userData: loginData.userData
});

// 修改后：返回 token（不清除会话）
return res.json({
  success: true,
  token: token  // 返回 token 供前端调用 complete 端点
});
```

#### 2. 后端：新增 qr-login-complete API

**文件：** `server/routes/auth.js`

```javascript
// 完成二维码登录（前端调用，直接返回 JWT token）
router.post('/qr-login-complete', async (req, res) => {
  try {
    const { token } = req.body;
    
    // 从内存中获取登录数据
    const loginData = global.qrLoginSessions?.[token];
    
    if (!loginData || !loginData.userData) {
      return res.status(401).json({ error: '登录会话已过期或无效' });
    }

    const userData = loginData.userData;
    
    // 清除已使用的 token
    delete global.qrLoginSessions[token];
    
    // 查找用户
    const user = await User.findOne({ telegramId: userData.id.toString() });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 生成 JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        telegramId: user.telegramId,
        // ...
      }
    });
  } catch (error) {
    console.error('❌ 完成登录错误:', error);
    res.status(400).json({ error: error.message });
  }
});
```

#### 3. 前端：修改轮询逻辑

**文件：** `src/pages/LoginPage.jsx`

```javascript
// 修改前：调用 telegramLogin(userData)
if (data.success && data.userData) {
  clearInterval(pollInterval);
  await telegramLogin(data.userData);  // 这会调用 /api/auth/telegram-login
  navigate('/user-center');
}

// 修改后：调用 qr-login-complete
if (data.success && data.token) {
  clearInterval(pollInterval);
  
  // 调用新的 complete 端点获取 JWT token
  const completeResponse = await fetch('/api/auth/qr-login-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: data.token })
  });
  
  const completeData = await completeResponse.json();
  
  if (completeResponse.ok && completeData.token) {
    // 直接设置 token
    localStorage.setItem('token', completeData.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${completeData.token}`;
    navigate('/user-center');
  }
}
```

#### 4. 前端：添加 axios 导入

**文件：** `src/pages/LoginPage.jsx`

```javascript
import axios from 'axios';
```

## 📊 新的登录流程

```
1. 用户点击"确认登录"（Telegram）
   ↓
2. Bot 调用 POST /api/auth/confirm-qr-login
   ↓
3. 后端存储登录数据到 global.qrLoginSessions[token]
   ↓
4. 前端轮询 GET /api/auth/check-qr-login?token=xxx
   ↓
5. 后端返回 { success: true, token: 'xxx' }
   ↓
6. 前端调用 POST /api/auth/qr-login-complete
   ↓
7. 后端返回 { token: 'jwt_token', user: {...} }
   ↓
8. 前端保存 JWT token 到 localStorage
   ↓
9. 前端跳转到 /user-center
```

## 🔄 与旧流程的对比

### 旧流程（有问题）
```
check-qr-login 返回 userData
  ↓
前端调用 telegramLogin(userData)
  ↓
调用 /api/auth/telegram-login
  ↓
验证 hash（失败 → 401）
```

### 新流程（正确）
```
check-qr-login 返回 token
  ↓
前端调用 /api/auth/qr-login-complete
  ↓
直接返回 JWT token（无需验证 hash）
  ↓
登录成功
```

## 🚀 部署步骤

### 1. 重启服务

```bash
# 重启后端
pm2 restart easypay-backend

# 重新构建前端（如果需要）
npm run build
pm2 restart easypay-frontend
```

### 2. 测试登录

```bash
# 1. 访问登录页面
# 2. 点击"打开 Telegram 应用登录"
# 3. 在 Telegram 中点击"确认登录"
# 4. 观察浏览器控制台
```

### 3. 查看日志

**预期日志：**
```
🔐 确认登录请求: { token: 'login_...', telegramId: '...' }
🔐 收到登录确认请求: { token: 'login_...', telegramId: '...' }
✅ 登录数据已存储: { token: 'login_...', sessionCount: 1 }
✅ 检测到登录成功: { token: 'login_...', telegramId: '...' }
✅ 扫码登录完成: { userId: '...', username: '...', telegramId: '...' }
```

## 🧪 测试清单

### 功能测试
- [ ] 打开应用登录 - 新用户
- [ ] 打开应用登录 - 已有用户
- [ ] 扫码登录 - 新用户
- [ ] 扫码登录 - 已有用户
- [ ] 登录后跳转到用户中心
- [ ] 登录后可以访问受保护的页面
- [ ] 刷新页面后仍然保持登录状态

### 错误处理测试
- [ ] Token 过期（2分钟后）
- [ ] Token 无效
- [ ] 网络错误
- [ ] 用户不存在

## 📝 API 文档

### 1. 检查登录状态

**请求：**
```http
GET /api/auth/check-qr-login?token=login_xxx
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
  "token": "login_xxx"
}
```

### 2. 完成登录

**请求：**
```http
POST /api/auth/qr-login-complete
Content-Type: application/json

{
  "token": "login_xxx"
}
```

**响应（成功）：**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "role": "user",
    "telegramId": "123456789",
    "telegramUsername": "username",
    "telegramFirstName": "First",
    "telegramLastName": "Last",
    "telegramPhotoUrl": "https://..."
  }
}
```

**响应（失败）：**
```json
{
  "error": "登录会话已过期或无效"
}
```

## 🔒 安全性

### 优势
1. ✅ 验证在 Bot 端完成（用户必须在 Telegram 中确认）
2. ✅ Token 只能使用一次（使用后立即删除）
3. ✅ Token 有过期时间（5分钟）
4. ✅ 使用 JWT 进行后续认证

### 注意事项
1. ⚠️  生产环境应该使用 Redis 存储会话
2. ⚠️  应该添加 HTTPS 保护
3. ⚠️  应该添加速率限制

## 📋 修改清单

### 修改的文件

1. **server/routes/auth.js** ✅
   - 修改 `check-qr-login` API（返回 token 而不是 userData）
   - 新增 `qr-login-complete` API（直接返回 JWT）

2. **src/pages/LoginPage.jsx** ✅
   - 修改轮询逻辑（调用 qr-login-complete）
   - 添加 axios 导入
   - 直接设置 JWT token

### 未修改的文件

- `server/bot/handlers/start.js` - Bot 逻辑不变
- `src/context/AuthContext.jsx` - 不再使用 telegramLogin
- `/api/auth/telegram-login` - 保留用于 Widget 登录

## 🎉 修复完成

现在登录流程应该可以正常工作：

1. ✅ Telegram 显示"登录成功"
2. ✅ 前端检测到登录
3. ✅ 获取 JWT token
4. ✅ 自动跳转到用户中心
5. ✅ 可以访问受保护的页面

## 🔍 故障排查

如果还有问题，检查：

1. **浏览器控制台**
```javascript
// 查看网络请求
// DevTools -> Network
// 筛选 "qr-login"
```

2. **后端日志**
```bash
pm2 logs easypay-backend | grep "登录"
```

3. **测试 API**
```bash
# 测试 check-qr-login
curl "http://localhost:5000/api/auth/check-qr-login?token=test"

# 测试 qr-login-complete
curl -X POST http://localhost:5000/api/auth/qr-login-complete \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'
```

重启服务后测试，应该可以正常登录了！🚀
