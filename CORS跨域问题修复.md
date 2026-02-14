# CORS 跨域问题修复

## 问题描述

访问网站时出现 CORS 错误：

```
Error: Not allowed by CORS
    at origin (/www/wwwroot/kk.vpno.eu.org/easypay/server/index.js:45:16)
```

## 问题原因

CORS（跨域资源共享）配置中只允许了特定的域名，但实际访问的域名不在允许列表中。

**原始配置**：
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://kk.vpno.eu.org',  // 只允许这个域名
  process.env.FRONTEND_URL
].filter(Boolean);
```

**实际访问域名**：`https://dd.vpno.eu.org`（不在列表中）

## 修复方案

### 1. 添加实际使用的域名

在 `server/index.js` 中添加 `https://dd.vpno.eu.org`：

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://kk.vpno.eu.org',
  'https://dd.vpno.eu.org',  // ✅ 添加实际使用的域名
  process.env.APP_URL,
  process.env.FRONTEND_URL
].filter(Boolean);
```

### 2. 增强开发环境支持

允许所有 localhost 和 127.0.0.1 的请求（仅开发环境）：

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（比如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    // 检查是否在允许列表中
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 开发环境：允许所有 localhost 和 127.0.0.1
      if (process.env.NODE_ENV !== 'production' && 
          (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        callback(null, true);
      } else {
        console.error('❌ CORS 错误 - 不允许的来源:', origin);
        console.log('允许的来源:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. 添加错误日志

当 CORS 错误发生时，记录详细信息：

```javascript
console.error('❌ CORS 错误 - 不允许的来源:', origin);
console.log('允许的来源:', allowedOrigins);
```

这样可以快速定位问题。

## 环境变量配置

### .env 文件

```bash
# 应用 URL（用于邮件、Bot 消息等）
APP_URL=https://dd.vpno.eu.org

# 前端 URL（用于 CORS）
FRONTEND_URL=https://dd.vpno.eu.org

# 开发环境
NODE_ENV=development  # 或 production
```

### 优先级

CORS 允许的来源按以下优先级：

1. **硬编码的域名**（最高优先级）
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `https://kk.vpno.eu.org`
   - `https://dd.vpno.eu.org`

2. **环境变量**
   - `process.env.APP_URL`
   - `process.env.FRONTEND_URL`

3. **开发环境特殊规则**（仅 NODE_ENV !== 'production'）
   - 所有包含 `localhost` 的域名
   - 所有包含 `127.0.0.1` 的域名

## 部署步骤

```bash
# 1. 提交代码
git add server/index.js
git commit -m "修复 CORS 跨域问题，添加 dd.vpno.eu.org 域名"
git push origin main

# 2. 服务器部署
cd /www/wwwroot/kk.vpno.eu.org/easypay
git pull origin main

# 3. 检查环境变量
cat .env | grep -E "APP_URL|FRONTEND_URL"

# 4. 如果需要，更新环境变量
echo "APP_URL=https://dd.vpno.eu.org" >> .env
echo "FRONTEND_URL=https://dd.vpno.eu.org" >> .env

# 5. 重启服务
pm2 restart easypay-backend

# 6. 查看日志
pm2 logs easypay-backend --lines 50
```

## 验证步骤

### 1. 检查 CORS 配置

访问网站，打开浏览器开发者工具（F12），查看 Network 标签：

**正常情况**：
```
Request URL: https://dd.vpno.eu.org/api/...
Status: 200 OK
Access-Control-Allow-Origin: https://dd.vpno.eu.org
Access-Control-Allow-Credentials: true
```

**错误情况**：
```
Request URL: https://dd.vpno.eu.org/api/...
Status: (failed)
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```

### 2. 测试不同域名

1. **测试主域名**：
   ```
   访问：https://dd.vpno.eu.org
   应该：正常加载
   ```

2. **测试备用域名**：
   ```
   访问：https://kk.vpno.eu.org
   应该：正常加载
   ```

3. **测试本地开发**：
   ```
   访问：http://localhost:3000
   应该：正常加载（开发环境）
   ```

### 3. 检查服务器日志

```bash
# 查看错误日志
pm2 logs easypay-backend --err --lines 50

# 应该不再看到：
# ❌ CORS 错误 - 不允许的来源: https://dd.vpno.eu.org
```

## 常见问题

### Q1: 为什么需要 CORS？

**A**: CORS 是浏览器的安全机制，防止恶意网站访问你的 API。

**示例**：
```
网站 A (https://dd.vpno.eu.org) 
  ↓ 请求
API (https://api.example.com)
  ↓ 检查 Origin
  ↓ 如果 Origin 在允许列表中
  ↓ 返回数据 + CORS 头
网站 A 收到数据 ✅

网站 B (https://evil.com)
  ↓ 请求
API (https://api.example.com)
  ↓ 检查 Origin
  ↓ Origin 不在允许列表中
  ↓ 拒绝请求 ❌
网站 B 被阻止
```

### Q2: 为什么本地开发不需要配置？

**A**: 修复后的代码在开发环境自动允许所有 localhost 请求：

```javascript
if (process.env.NODE_ENV !== 'production' && 
    (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
  callback(null, true);  // 自动允许
}
```

### Q3: 如何添加新域名？

**A**: 有两种方法：

**方法 1：修改代码**（推荐用于固定域名）
```javascript
const allowedOrigins = [
  'https://dd.vpno.eu.org',
  'https://new-domain.com',  // 添加新域名
  // ...
];
```

**方法 2：使用环境变量**（推荐用于动态域名）
```bash
# .env
FRONTEND_URL=https://new-domain.com
```

### Q4: 生产环境如何调试 CORS 问题？

**A**: 查看服务器日志：

```bash
# 实时查看日志
pm2 logs easypay-backend --lines 100

# 当 CORS 错误发生时，会看到：
# ❌ CORS 错误 - 不允许的来源: https://xxx.com
# 允许的来源: [ 'https://dd.vpno.eu.org', ... ]
```

### Q5: 为什么要设置 credentials: true？

**A**: 允许跨域请求携带 Cookie 和认证信息：

```javascript
credentials: true  // 允许携带 Cookie
```

**前端配置**：
```javascript
axios.defaults.withCredentials = true;
```

## 安全建议

### 1. 生产环境不要使用通配符

❌ **错误**：
```javascript
origin: '*'  // 允许所有域名（不安全）
```

✅ **正确**：
```javascript
origin: ['https://dd.vpno.eu.org']  // 只允许特定域名
```

### 2. 使用 HTTPS

确保生产环境使用 HTTPS：

```bash
# .env
APP_URL=https://dd.vpno.eu.org  # ✅ HTTPS
# APP_URL=http://dd.vpno.eu.org  # ❌ HTTP（不安全）
```

### 3. 定期审查允许列表

定期检查 `allowedOrigins` 列表，删除不再使用的域名。

### 4. 记录 CORS 错误

保留 CORS 错误日志，用于安全审计：

```javascript
console.error('❌ CORS 错误 - 不允许的来源:', origin);
```

## 相关文件

- `server/index.js` - CORS 配置（已修改）
- `.env` - 环境变量配置
- `server/services/staticPageGenerator.js` - 使用 APP_URL
- `server/bot/handlers/start.js` - 使用 APP_URL

## 技术细节

### CORS 工作流程

```
1. 浏览器发送请求
   ↓
2. 浏览器添加 Origin 头
   Origin: https://dd.vpno.eu.org
   ↓
3. 服务器检查 Origin
   ↓
4. 如果允许，返回 CORS 头
   Access-Control-Allow-Origin: https://dd.vpno.eu.org
   Access-Control-Allow-Credentials: true
   ↓
5. 浏览器接收响应
   ↓
6. 浏览器检查 CORS 头
   ↓
7. 如果匹配，允许 JavaScript 访问响应
```

### Preflight 请求

对于某些请求（如 POST、PUT、DELETE），浏览器会先发送 OPTIONS 请求：

```
OPTIONS /api/users HTTP/1.1
Origin: https://dd.vpno.eu.org
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

↓ 服务器响应

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://dd.vpno.eu.org
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: content-type
Access-Control-Max-Age: 86400
```

## 总结

修复内容：
- ✅ 添加 `https://dd.vpno.eu.org` 到允许列表
- ✅ 添加 `process.env.APP_URL` 支持
- ✅ 增强开发环境支持（自动允许 localhost）
- ✅ 添加详细的错误日志
- ✅ 保持向后兼容性

现在 CORS 跨域问题应该解决了！🎉
