# 多 Bot 配置说明

## 功能说明

系统现在支持同时运行多个 Telegram Bot 实例，所有 Bot 共享同一个数据库和用户数据。

## 使用场景

1. **多个业务入口**：为不同的推广渠道提供独立的 Bot
2. **A/B 测试**：测试不同的 Bot 配置和交互流程
3. **备用 Bot**：主 Bot 出现问题时快速切换
4. **地区分流**：不同地区使用不同的 Bot

## 配置方法

### 方法 1：单 Bot 模式（默认）

在 `.env` 文件中配置：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
```

### 方法 2：多 Bot 模式

在 `.env` 文件中配置：

```env
# 多个 Bot Token，用逗号分隔
TELEGRAM_BOT_TOKENS=token1,token2,token3

# 多个 Bot 用户名，用逗号分隔（顺序要对应）
TELEGRAM_BOT_USERNAMES=bot1,bot2,bot3
```

**注意**：
- Token 和用户名的数量必须一致
- 用逗号分隔，不要有多余的空格
- 如果配置了 `TELEGRAM_BOT_TOKENS`，会忽略 `TELEGRAM_BOT_TOKEN`

## 配置示例

### 示例 1：两个 Bot

```env
TELEGRAM_BOT_TOKENS=7119179074:AAFxOoyBEJ5XlQA3hWVNvwJcy9RJN-XKp0U,7119179075:BBGxOoyBEJ5XlQA3hWVNvwJcy9RJN-XKp0V
TELEGRAM_BOT_USERNAMES=Trxec_bot,Trxec_bot2
```

### 示例 2：三个 Bot（不同用途）

```env
TELEGRAM_BOT_TOKENS=token_main,token_vip,token_test
TELEGRAM_BOT_USERNAMES=MainPayBot,VIPPayBot,TestPayBot
```

## 功能特性

### ✅ 共享功能
- 所有 Bot 共享同一个数据库
- 用户可以在任意 Bot 中查看订单
- 订单通知会发送到用户最后使用的 Bot
- 共享钱包和支付配置

### ✅ 独立功能
- 每个 Bot 有独立的日志标识
- 可以独立启动和停止
- 群组管理独立（每个 Bot 可以加入不同的群组）

### ✅ 自动功能
- 自动识别用户来自哪个 Bot
- 群组跳转会自动使用对应的 Bot
- 通知会发送到用户最后使用的 Bot

## 获取 Bot Token

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示设置 Bot 名称和用户名
4. 复制获得的 Token

## 启动和管理

### 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
pm2 restart easypay
```

### 查看日志

```bash
# 查看所有 Bot 的日志
pm2 logs easypay

# 实时查看
pm2 logs easypay --lines 100
```

日志中会显示每个 Bot 的标识：
```
✅ Bot #1 已初始化: @Trxec_bot
✅ Bot #2 已初始化: @Trxec_bot2
🤖 Bot #1 已启动: @Trxec_bot
🤖 Bot #2 已启动: @Trxec_bot2
✅ 所有 Bot 已启动 (共 2 个)
```

### 停止服务

```bash
pm2 stop easypay
```

## 注意事项

1. **Token 安全**：不要泄露 Bot Token，不要提交到 Git
2. **用户名唯一**：每个 Bot 的用户名必须唯一
3. **资源占用**：每个 Bot 会占用一定的内存，建议不超过 5 个
4. **数据共享**：所有 Bot 共享数据，删除用户会影响所有 Bot
5. **通知发送**：通知会使用第一个 Bot 发送

## 故障排查

### 问题 1：Bot 启动失败

**原因**：Token 或用户名配置错误

**解决**：
1. 检查 `.env` 文件中的配置
2. 确保 Token 和用户名数量一致
3. 确保没有多余的空格或逗号

### 问题 2：某个 Bot 无响应

**原因**：Token 失效或 Bot 被封禁

**解决**：
1. 在 Telegram 中测试 Bot 是否可用
2. 联系 @BotFather 检查 Bot 状态
3. 如果 Token 失效，重新生成并更新配置

### 问题 3：日志中看不到某个 Bot

**原因**：配置格式错误或 Token 无效

**解决**：
1. 查看启动日志中的错误信息
2. 检查 `.env` 文件格式
3. 确保 Token 有效

## 高级配置

### 动态添加 Bot

如果需要在运行时添加新的 Bot：

1. 修改 `.env` 文件，添加新的 Token 和用户名
2. 重启服务：`pm2 restart easypay`

### 移除 Bot

1. 从 `.env` 文件中删除对应的 Token 和用户名
2. 重启服务：`pm2 restart easypay`

## 性能建议

- **2-3 个 Bot**：适合大多数场景，资源占用低
- **4-5 个 Bot**：适合大规模业务，需要监控资源
- **6+ 个 Bot**：不推荐，考虑使用多服务器部署

## 技术支持

如有问题，请查看：
- 系统日志：`pm2 logs easypay`
- 错误日志：`pm2 logs easypay --err`
- 实时监控：`pm2 monit`
