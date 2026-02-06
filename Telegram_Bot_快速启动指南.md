# Telegram Bot 快速启动指南

## 1. 创建 Telegram Bot

### 步骤 1：找到 BotFather
1. 在 Telegram 中搜索 `@BotFather`
2. 点击 Start 开始对话

### 步骤 2：创建新 Bot
1. 发送命令：`/newbot`
2. 输入 Bot 的显示名称（例如：`EasyPay 代付助手`）
3. 输入 Bot 的用户名（必须以 `bot` 结尾，例如：`easypay_helper_bot`）

### 步骤 3：获取 Token
创建成功后，BotFather 会返回一个 Token，格式类似：
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**⚠️ 重要：请妥善保管这个 Token，不要泄露给他人！**

### 步骤 4：配置 Bot 信息（可选）
```
/setdescription - 设置 Bot 描述
/setabouttext - 设置关于文本
/setuserpic - 上传 Bot 头像
```

## 2. 配置环境变量

编辑 `.env` 文件，添加 Bot Token：

```bash
# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
API_URL=http://localhost:5000
```

**生产环境配置：**
```bash
TELEGRAM_BOT_TOKEN=你的真实Token
API_URL=https://kk.vpno.eu.org
```

## 3. 启动服务

### 开发环境
```bash
npm run server
```

### 生产环境
```bash
npm run build
pm2 restart easypay
```

## 4. 测试 Bot

### 步骤 1：找到你的 Bot
在 Telegram 中搜索你创建的 Bot 用户名（例如：`@easypay_helper_bot`）

### 步骤 2：发送 /start
点击 Start 或发送 `/start` 命令

### 步骤 3：测试功能
Bot 应该显示主菜单：
- 💰 USDT 代付
- 💎 TRX 代付
- 📋 我的订单
- ❓ 常见问题
- 👤 个人中心

## 5. 完整测试流程

### USDT 代付测试
1. 点击 "💰 USDT 代付"
2. 输入数量（例如：`100`）
3. 输入收款地址（TRON 地址，以 T 开头）
4. 确认订单信息
5. 选择支付方式（微信或支付宝）
6. 扫码支付
7. 等待通知

### 预期通知
1. **支付成功通知**（支付后立即收到）
   ```
   🎉 支付成功！
   
   订单号：ORD1234567890
   金额：100 CNY
   
   ⏳ 正在处理 USDT 代付...
   预计 2-10 分钟完成
   ```

2. **代付完成通知**（2-10分钟后）
   ```
   ✅ 代付完成！
   
   订单号：ORD1234567890
   数量：100 USDT
   地址：TxxxxxxxxxxxxxxxxxxxxxxxxxxxYYY
   
   🔗 交易哈希：
   abc123...xyz789
   
   🔍 点击下方按钮查看交易详情
   ```

## 6. 常见问题

### Q1: Bot 没有响应？
**检查清单：**
- [ ] Token 是否正确配置在 `.env` 文件中
- [ ] 服务器是否正常运行（`pm2 status`）
- [ ] 查看日志：`pm2 logs easypay`
- [ ] 检查网络连接

### Q2: 收不到通知？
**可能原因：**
1. 订单创建时没有保存 `telegramId`
2. Bot 实例未正确初始化
3. 用户屏蔽了 Bot

**解决方法：**
```bash
# 查看日志
pm2 logs easypay --lines 100

# 重启服务
pm2 restart easypay
```

### Q3: 支付后订单状态不更新？
**检查：**
1. 支付平台回调是否正常
2. 查看服务器日志中的回调信息
3. 检查订单状态：`/orders` 命令

### Q4: 如何查看 Bot 日志？
```bash
# 查看实时日志
pm2 logs easypay

# 查看最近 100 行
pm2 logs easypay --lines 100

# 只看错误日志
pm2 logs easypay --err
```

## 7. Bot 命令列表

### 用户命令
- `/start` - 开始使用 Bot，显示主菜单
- `/help` - 显示帮助信息
- `/orders` - 查看我的订单
- `/cancel` - 取消当前操作

### 管理员命令（待实现）
- `/admin` - 进入管理面板
- `/stats` - 查看统计数据
- `/broadcast` - 群发消息

## 8. 安全建议

### Token 安全
1. **不要**将 Token 提交到 Git
2. **不要**在公开场合分享 Token
3. **定期**更换 Token（通过 BotFather 的 `/revoke` 命令）

### 用户验证
1. 验证用户身份（通过 Telegram ID）
2. 限制操作频率（防止滥用）
3. 记录操作日志（审计追踪）

### 数据保护
1. 不在 Bot 中存储敏感信息
2. 使用 HTTPS 通信
3. 定期备份数据库

## 9. 监控和维护

### 日常检查
```bash
# 检查服务状态
pm2 status

# 查看内存使用
pm2 monit

# 重启服务
pm2 restart easypay

# 查看日志
pm2 logs easypay --lines 50
```

### 性能优化
1. 使用 Redis 缓存（可选）
2. 限制并发请求
3. 优化数据库查询
4. 使用 CDN 加速（如果有图片）

## 10. 下一步开发

### 第二阶段功能
- [ ] 工单系统集成
- [ ] 能量租赁功能
- [ ] 闪兑服务
- [ ] 订单详情查询
- [ ] 网站用户绑定 TG

### 第三阶段功能
- [ ] 管理员面板
- [ ] 数据统计和报表
- [ ] 自动客服（AI）
- [ ] 多语言支持
- [ ] 推荐奖励系统

## 相关文档

- `Telegram_Bot_设计方案.md` - 完整设计方案
- `Telegram_Bot_优化方案_独立使用.md` - 优化方案
- `Telegram_Bot_通知系统集成完成.md` - 通知系统说明
- `server/bot/` - Bot 源代码目录

## 技术支持

如有问题，请查看：
1. 服务器日志：`pm2 logs easypay`
2. MongoDB 日志
3. Telegram Bot API 文档：https://core.telegram.org/bots/api
4. Telegraf 文档：https://telegraf.js.org/
