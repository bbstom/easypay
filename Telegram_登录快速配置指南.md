# Telegram 登录快速配置指南

## 🚀 5分钟快速配置

### 步骤 1：获取 Bot Username

1. 打开 Telegram
2. 搜索你的 Bot（例如：@FastPayBot）
3. 点击 Bot 头像查看信息
4. 复制 Bot 的 username（不带 @ 符号）

**示例**：如果 Bot 是 `@FastPayBot`，则 username 是 `FastPayBot`

### 步骤 2：设置 Bot Domain

1. 在 Telegram 中打开 @BotFather
2. 发送命令：`/setdomain`
3. 选择你的 Bot
4. 输入域名：
   - **生产环境**：`kk.vpno.eu.org`
   - **本地开发**：`localhost`

**重要**：不要输入 `http://` 或 `https://`，只输入域名！

### 步骤 3：配置后端环境变量

编辑 `.env` 文件，添加：

```env
# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=你的Bot_Token
TELEGRAM_BOT_USERNAME=FastPayBot
```

**示例**：
```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=FastPayBot
```

### 步骤 4：配置前端环境变量

#### 方法 1：创建 .env.local 文件

在项目根目录创建 `.env.local` 文件：

```env
REACT_APP_TELEGRAM_BOT_USERNAME=FastPayBot
```

#### 方法 2：修改 vite.config.js

如果使用 Vite，编辑 `vite.config.js`：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.REACT_APP_TELEGRAM_BOT_USERNAME': JSON.stringify('FastPayBot')
  }
})
```

### 步骤 5：重启服务

```bash
# 重启后端
npm run dev

# 重启前端（新终端）
cd client
npm run dev
```

### 步骤 6：测试登录

1. 访问：`http://localhost:3000/login`
2. 查看是否显示 Telegram 登录按钮
3. 点击按钮测试登录

## ✅ 验证清单

- [ ] Bot Username 已复制（不带 @）
- [ ] BotFather 中已设置 domain
- [ ] 后端 .env 已配置 TELEGRAM_BOT_TOKEN
- [ ] 后端 .env 已配置 TELEGRAM_BOT_USERNAME
- [ ] 前端已配置 REACT_APP_TELEGRAM_BOT_USERNAME
- [ ] 后端已重启
- [ ] 前端已重启
- [ ] 登录页面显示 Telegram 按钮
- [ ] 点击按钮可以弹出授权窗口

## 🐛 快速排查

### 问题 1：Widget 不显示

**检查**：
```bash
# 1. 查看浏览器控制台是否有错误
# 2. 检查网络是否可以访问 telegram.org
# 3. 确认 Bot Username 配置正确
```

**解决**：
```bash
# 清除浏览器缓存
Ctrl + Shift + Delete

# 重新加载页面
Ctrl + F5
```

### 问题 2：点击按钮无反应

**检查**：
```bash
# 1. 确认 BotFather 中已设置 domain
# 2. 确认域名与当前访问地址匹配
# 3. 查看浏览器控制台错误
```

**解决**：
```bash
# 重新设置 domain
1. 打开 @BotFather
2. /setdomain
3. 选择 Bot
4. 输入正确的域名
```

### 问题 3：授权后登录失败

**检查**：
```bash
# 1. 查看后端日志
# 2. 确认 TELEGRAM_BOT_TOKEN 正确
# 3. 确认后端服务正常运行
```

**解决**：
```bash
# 查看后端日志
npm run dev

# 检查是否有错误信息
# 常见错误：
# - "Telegram Bot 未配置" -> 检查 TELEGRAM_BOT_TOKEN
# - "数据验证失败" -> 检查 Bot Token 是否正确
# - "登录已过期" -> 重新授权
```

## 📝 配置示例

### 完整的 .env 配置

```env
# 服务器配置
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# 数据库
MONGODB_URI=mongodb://localhost:27017/fastpay

# JWT
JWT_SECRET=your_jwt_secret_key_here

# 加密
ENCRYPTION_KEY=your_encryption_key_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=FastPayBot
```

### 完整的 .env.local 配置（前端）

```env
REACT_APP_TELEGRAM_BOT_USERNAME=FastPayBot
```

## 🎯 测试步骤

### 1. 本地测试

```bash
# 1. 启动后端
npm run dev

# 2. 启动前端（新终端）
cd client
npm run dev

# 3. 访问登录页面
http://localhost:3000/login

# 4. 点击 Telegram 登录按钮

# 5. 在弹出窗口中点击"确认"

# 6. 查看是否成功登录并跳转到用户中心
```

### 2. 生产环境测试

```bash
# 1. 确认 BotFather 中设置的是生产域名
# 例如：kk.vpno.eu.org

# 2. 确认 .env 中的配置正确

# 3. 重启服务
pm2 restart all

# 4. 访问生产环境登录页面
https://kk.vpno.eu.org/login

# 5. 测试 Telegram 登录
```

## 💡 提示

### 开发环境

- 使用 `localhost` 作为 domain
- 可以使用 HTTP
- 方便调试

### 生产环境

- 使用实际域名
- 必须使用 HTTPS
- 确保 SSL 证书有效

### 多环境配置

如果有多个环境（开发、测试、生产），可以：

1. 在 BotFather 中为每个环境设置不同的 domain
2. 使用不同的 .env 文件
3. 或者使用环境变量覆盖

## 🔒 安全建议

1. **不要泄露 Bot Token**
   - 不要提交到 Git
   - 不要在前端代码中使用
   - 使用环境变量

2. **验证数据完整性**
   - 后端已实现 HMAC 验证
   - 不要跳过验证步骤

3. **使用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 保护用户数据安全

4. **定期更新**
   - 保持依赖包最新
   - 关注安全公告

## 📞 需要帮助？

### 查看日志

```bash
# 后端日志
npm run dev

# 前端日志
# 打开浏览器控制台（F12）
```

### 常用命令

```bash
# 检查 Bot Token
node server/scripts/checkAdmin.js

# 查看环境变量
echo $TELEGRAM_BOT_TOKEN

# 重启服务
pm2 restart all
```

### 文档参考

- [Telegram Login Widget 官方文档](https://core.telegram.org/widgets/login)
- [Bot API 文档](https://core.telegram.org/bots/api)
- [项目完整文档](./Telegram_登录功能实现完成.md)

## 🎉 配置完成

如果所有步骤都完成，你应该能看到：

✅ 登录页面显示 Telegram 登录按钮
✅ 点击按钮弹出授权窗口
✅ 授权后自动登录
✅ 跳转到用户中心
✅ 显示用户信息

恭喜！Telegram 登录功能已成功配置！

---

**配置时间**：约 5 分钟
**难度**：⭐⭐☆☆☆（简单）
**需要重启**：是
