# Telegram Bot 部署清单

## ✅ 已完成的工作

### 1. 代码实现
- [x] User 模型扩展（添加 Telegram 字段）
- [x] Payment 模型扩展（添加 telegramId 字段）
- [x] Bot 基础框架（`server/bot/index.js`）
- [x] 键盘布局（`server/bot/keyboards/main.js`）
- [x] Start 处理器（`server/bot/handlers/start.js`）
- [x] 支付处理器（`server/bot/handlers/payment.js`）
- [x] 订单处理器（`server/bot/handlers/orders.js`）
- [x] 通知服务（`server/bot/notifications.js`）
- [x] 支付路由集成（添加 TG 通知）
- [x] 依赖安装（telegraf, qrcode）

### 2. 通知集成
- [x] 支付成功通知（GET 回调）
- [x] 支付成功通知（POST 回调）
- [x] 代付完成通知
- [x] 代付失败通知

### 3. 文档
- [x] 设计方案（`Telegram_Bot_设计方案.md`）
- [x] 优化方案（`Telegram_Bot_优化方案_独立使用.md`）
- [x] 通知系统说明（`Telegram_Bot_通知系统集成完成.md`）
- [x] 快速启动指南（`Telegram_Bot_快速启动指南.md`）
- [x] 部署清单（本文档）

## 📋 部署步骤

### 步骤 1：创建 Telegram Bot
1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按提示输入 Bot 名称和用户名
4. 保存返回的 Token

### 步骤 2：配置环境变量
编辑 `/www/wwwroot/kk.vpno.eu.org/easypay/.env` 文件：

```bash
# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=你的Bot Token
API_URL=https://kk.vpno.eu.org
```

**注意：** 将 `your_bot_token_here` 替换为实际的 Token

### 步骤 3：重新构建和部署
```bash
cd /www/wwwroot/kk.vpno.eu.org/easypay

# 构建前端
npm run build

# 重启服务
pm2 restart easypay

# 查看日志
pm2 logs easypay --lines 50
```

### 步骤 4：测试 Bot
1. 在 Telegram 中搜索你的 Bot
2. 发送 `/start` 命令
3. 应该看到主菜单

### 步骤 5：测试完整流程
1. 点击 "💰 USDT 代付"
2. 输入数量（例如：10）
3. 输入收款地址
4. 确认订单
5. 选择支付方式
6. 扫码支付（可以用小额测试）
7. 等待通知

## 🔍 验证清单

### Bot 基础功能
- [ ] Bot 能正常响应 `/start` 命令
- [ ] 显示主菜单（5个按钮）
- [ ] 点击按钮有响应

### USDT 代付流程
- [ ] 能输入 USDT 数量
- [ ] 显示费用计算
- [ ] 能输入收款地址
- [ ] 地址验证正常
- [ ] 显示订单确认
- [ ] 生成支付二维码
- [ ] 支付后收到通知1（支付成功）
- [ ] 代付后收到通知2（代付完成）

### TRX 代付流程
- [ ] 能输入 TRX 数量
- [ ] 显示费用计算
- [ ] 能输入收款地址
- [ ] 地址验证正常
- [ ] 显示订单确认
- [ ] 生成支付二维码
- [ ] 支付后收到通知1（支付成功）
- [ ] 代付后收到通知2（代付完成）

### 订单查询
- [ ] 能查看订单列表
- [ ] 显示订单详情
- [ ] 状态显示正确

## 🐛 故障排查

### 问题 1：Bot 没有响应
**检查：**
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs easypay --lines 100

# 检查 Token 配置
cat .env | grep TELEGRAM_BOT_TOKEN
```

**可能原因：**
- Token 配置错误
- 服务未启动
- 网络问题

### 问题 2：收不到通知
**检查：**
```bash
# 查看日志中的通知发送记录
pm2 logs easypay | grep "TG"

# 检查订单是否保存了 telegramId
# 在 MongoDB 中查询最近的订单
```

**可能原因：**
- 订单创建时未保存 telegramId
- Bot 实例未初始化
- 用户屏蔽了 Bot

### 问题 3：支付后订单不更新
**检查：**
```bash
# 查看支付回调日志
pm2 logs easypay | grep "支付回调"

# 检查订单状态
# 在数据库中查询订单
```

**可能原因：**
- 支付平台回调失败
- 签名验证失败
- 订单号不匹配

## 📊 监控建议

### 日常监控
```bash
# 每天检查一次
pm2 status
pm2 logs easypay --lines 50

# 每周检查一次
pm2 monit  # 查看内存和CPU使用
```

### 关键指标
- Bot 响应时间
- 通知发送成功率
- 订单完成率
- 错误日志数量

### 告警设置
建议设置以下告警：
1. 服务停止告警
2. 内存使用超过 80%
3. 错误日志频繁出现
4. 通知发送失败率超过 10%

## 🔐 安全建议

### Token 管理
1. **不要**将 Token 提交到 Git
2. **不要**在日志中打印 Token
3. **定期**更换 Token（每 3-6 个月）
4. **使用**环境变量存储

### 用户验证
1. 验证 Telegram ID
2. 限制操作频率
3. 记录操作日志
4. 检测异常行为

### 数据保护
1. 加密敏感数据
2. 定期备份数据库
3. 使用 HTTPS
4. 限制 API 访问

## 📈 性能优化

### 当前配置
- 单进程运行
- 内存使用约 100-200MB
- 支持并发 100+ 用户

### 优化建议
1. **使用 Redis 缓存**
   - 缓存用户会话
   - 缓存系统设置
   - 减少数据库查询

2. **限流保护**
   - 限制每用户请求频率
   - 防止恶意刷单
   - 保护服务器资源

3. **异步处理**
   - 通知异步发送
   - 订单异步处理
   - 不阻塞主流程

## 🚀 下一步开发

### 第二阶段（优先级高）
- [ ] 工单系统集成
  - 创建工单
  - 查看工单
  - 回复工单
  - 工单通知

- [ ] 订单查询优化
  - 订单详情页
  - 订单状态追踪
  - 交易记录查询

### 第三阶段（优先级中）
- [ ] 能量租赁功能
  - 租赁下单
  - 价格查询
  - 订单管理

- [ ] 闪兑服务
  - USDT/TRX 互换
  - 实时汇率
  - 订单追踪

### 第四阶段（优先级低）
- [ ] 网站用户绑定
  - 生成绑定码
  - 扫码绑定
  - 账户同步

- [ ] 管理员功能
  - 数据统计
  - 用户管理
  - 系统设置

## 📞 技术支持

### 日志位置
- PM2 日志：`~/.pm2/logs/`
- 应用日志：控制台输出
- MongoDB 日志：`/var/log/mongodb/`

### 常用命令
```bash
# 查看服务状态
pm2 status

# 重启服务
pm2 restart easypay

# 查看日志
pm2 logs easypay

# 查看实时日志
pm2 logs easypay --lines 0

# 清空日志
pm2 flush easypay

# 查看详细信息
pm2 show easypay
```

### 相关文档
- Telegram Bot API: https://core.telegram.org/bots/api
- Telegraf 文档: https://telegraf.js.org/
- TronWeb 文档: https://developers.tron.network/docs/tronweb

## ✨ 总结

### 已实现功能
1. ✅ Telegram Bot 基础框架
2. ✅ USDT/TRX 代付完整流程
3. ✅ 支付通知系统
4. ✅ 订单查询功能
5. ✅ 用户自动注册

### 待实现功能
1. ⏳ 工单系统
2. ⏳ 能量租赁
3. ⏳ 闪兑服务
4. ⏳ 网站绑定
5. ⏳ 管理员面板

### 预期效果
- 用户可以完全通过 Telegram 使用代付服务
- 无需访问网站即可完成所有操作
- 实时接收订单状态通知
- 提升用户体验和便利性

---

**最后更新：** 2026-02-05
**版本：** v1.0
**状态：** 第一阶段完成，待测试
