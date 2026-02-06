# Telegram Bot 通知系统集成完成

## 完成时间
2026-02-05

## 修改内容

### 1. Payment 模型更新
**文件**: `server/models/Payment.js`

添加了 `telegramId` 字段用于存储 Telegram 用户 ID：

```javascript
telegramId: { type: String }, // Telegram 用户 ID
```

### 2. 支付路由更新
**文件**: `server/routes/payments.js`

#### 2.1 支付成功通知（GET 回调）
在支付成功后，添加 Telegram 通知：

```javascript
// 🔔 发送 Telegram 支付成功通知
if (payment.telegramId) {
  try {
    await telegramNotifications.notifyPaymentSuccess(payment.telegramId, payment);
  } catch (tgError) {
    console.error('❌ 发送 TG 支付成功通知失败:', tgError);
  }
}
```

#### 2.2 支付成功通知（POST 回调）
同样在 POST 回调中添加 Telegram 通知

#### 2.3 代付完成通知
在 `processTransfer` 函数中，代付成功后发送通知：

```javascript
// 6. 发送 Telegram 代付完成通知
if (payment.telegramId) {
  try {
    await telegramNotifications.notifyTransferComplete(payment.telegramId, payment);
  } catch (tgError) {
    console.error('❌ 发送 TG 代付完成通知失败:', tgError);
  }
}
```

#### 2.4 代付失败通知
在重试次数用完后，发送失败通知：

```javascript
// 发送 Telegram 代付失败通知
if (payment.telegramId) {
  try {
    await telegramNotifications.notifyTransferFailed(payment.telegramId, payment, error.message);
  } catch (tgError) {
    console.error('❌ 发送 TG 代付失败通知失败:', tgError);
  }
}
```

## 通知流程

### 用户通过 Telegram Bot 下单
1. 用户在 Bot 中选择 USDT/TRX 代付
2. 输入数量和地址
3. 确认订单（此时保存 `telegramId`）
4. 生成支付二维码
5. 用户扫码支付

### 通知时间点
1. **支付成功** → 立即发送 TG 通知
   - 订单号
   - 支付金额
   - 提示正在处理代付
   
2. **代付完成** → 发送 TG 通知
   - 订单号
   - 代付数量和类型
   - 收款地址
   - 交易哈希
   - 查看交易链接

3. **代付失败** → 发送 TG 通知
   - 订单号
   - 失败原因
   - 提示联系客服

## 通知服务 API

### `notifyPaymentSuccess(telegramId, order)`
支付成功通知

### `notifyTransferComplete(telegramId, order)`
代付完成通知，包含交易哈希和查看链接

### `notifyTransferFailed(telegramId, order, reason)`
代付失败通知，包含失败原因

## 下一步工作

### 1. 安装依赖
```bash
npm install telegraf qrcode
```

### 2. 配置环境变量
在 `.env` 文件中添加：
```
TELEGRAM_BOT_TOKEN=你的Bot Token
API_URL=http://localhost:5000
```

### 3. 测试流程
1. 启动服务器：`pm2 restart easypay`
2. 在 Telegram 中找到你的 Bot
3. 发送 `/start` 命令
4. 测试完整的代付流程
5. 验证是否收到通知

### 4. 第二阶段功能（待实现）
- 工单系统集成
- 能量租赁功能
- 闪兑服务
- 订单查询优化
- 网站用户绑定 TG

## 技术细节

### 通知发送机制
- 使用 `telegraf` 库的 `bot.telegram.sendMessage()` 方法
- 支持 Markdown 格式
- 包含内联键盘（Inline Keyboard）
- 错误处理：通知失败不影响主流程

### 数据流
```
用户下单 → 保存 telegramId → 支付成功 → 发送通知1
                                    ↓
                              执行代付 → 发送通知2
                                    ↓
                              失败重试 → 发送通知3（如果失败）
```

### 兼容性
- 邮件通知和 TG 通知并行
- TG 通知失败不影响邮件发送
- 支持只用邮箱、只用 TG、或两者都用

## 注意事项

1. **Bot Token 安全**
   - 不要提交到 Git
   - 使用环境变量存储
   - 定期更换 Token

2. **通知频率**
   - 避免频繁发送
   - 合并相关通知
   - 使用异步发送

3. **错误处理**
   - 通知失败不阻塞主流程
   - 记录错误日志
   - 提供降级方案（邮件）

4. **用户体验**
   - 通知内容简洁明了
   - 提供操作按钮
   - 支持查看详情

## 测试清单

- [ ] 安装依赖包
- [ ] 配置 Bot Token
- [ ] 测试 /start 命令
- [ ] 测试 USDT 代付流程
- [ ] 测试 TRX 代付流程
- [ ] 验证支付成功通知
- [ ] 验证代付完成通知
- [ ] 验证代付失败通知（可选）
- [ ] 测试订单查询功能
- [ ] 检查日志输出

## 相关文档

- `Telegram_Bot_设计方案.md` - 完整设计方案
- `Telegram_Bot_优化方案_独立使用.md` - 优化方案
- `server/bot/notifications.js` - 通知服务实现
- `server/bot/handlers/payment.js` - 支付处理器
