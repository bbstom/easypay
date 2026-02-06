# Telegram Bot 订单创建修复完成

## 问题描述

用户点击"✅ 确认"按钮后，创建订单失败，错误信息：
```
Payment validation failed: totalCNY: Path `totalCNY` is required.
```

## 问题原因

在 `server/bot/handlers/payment.js` 的 `confirmPayment` 函数中，调用后端 API 创建订单时，缺少必需的字段：
- `totalCNY` - 总金额（CNY）
- `serviceFee` - 服务费

这些数据在 `ctx.session.paymentData` 中已经计算好了，但没有传递给 API。

## 修复内容

**文件**: `server/bot/handlers/payment.js`

### 修复前
```javascript
const response = await axios.post(`${apiUrl}/api/payments`, {
  payType: data.type,
  amount: data.amount,
  address: data.address,
  paymentMethod: 'wechat',
  email: user.email,
  telegramId: user.telegramId
});
```

### 修复后
```javascript
const response = await axios.post(`${apiUrl}/api/payments`, {
  payType: data.type,
  amount: data.amount,
  address: data.address,
  paymentMethod: 'wechat',
  totalCNY: data.totalCNY,      // ✅ 新增
  serviceFee: data.serviceFee,  // ✅ 新增
  email: user.email,
  telegramId: user.telegramId
});
```

## 数据流

### 1. 用户输入数量
```javascript
// handleUSDTAmount 或 handleTRXAmount
const feeInfo = calculateFee(amount, 'USDT', settings);

ctx.session.paymentData = {
  type: 'USDT',
  amount: amount,
  ...feeInfo  // 包含 totalCNY, serviceFee, rate, cnyAmount, feeLabel
};
```

### 2. 用户输入地址
```javascript
// handleUSDTAddress 或 handleTRXAddress
ctx.session.paymentData.address = address;
```

### 3. 用户确认订单
```javascript
// confirmPayment
const data = ctx.session.paymentData;
// data 包含：
// - type: 'USDT' 或 'TRX'
// - amount: 数量
// - address: 收款地址
// - totalCNY: 总金额（CNY）
// - serviceFee: 服务费（CNY）
// - rate: 汇率
// - cnyAmount: 币种金额（CNY）
// - feeLabel: 费率标签
```

### 4. 创建订单
```javascript
// 调用 API 创建订单
POST /api/payments
{
  payType: 'USDT',
  amount: 100,
  address: 'TxxxxxxxxxxxxxxxxxxxxxxxxxxxYYY',
  paymentMethod: 'wechat',
  totalCNY: 762.30,      // ✅ 必需
  serviceFee: 12.30,     // ✅ 必需
  email: 'user@example.com',
  telegramId: '123456789'
}
```

## Payment 模型必需字段

```javascript
const paymentSchema = new mongoose.Schema({
  payType: { type: String, required: true },      // ✅
  amount: { type: Number, required: true },       // ✅
  address: { type: String, required: true },      // ✅
  paymentMethod: { type: String, required: true }, // ✅
  totalCNY: { type: Number, required: true },     // ✅ 之前缺失
  serviceFee: { type: Number, default: 0 },       // ✅ 之前缺失
  email: { type: String },
  telegramId: { type: String }
});
```

## 完整流程

### 1. 用户操作
```
/start → 💰 USDT 代付 → 输入数量 → 输入地址 → ✅ 确认
```

### 2. 数据准备
```javascript
// 计算费用
const feeInfo = calculateFee(100, 'USDT', settings);
// 返回：
{
  rate: 7.50,
  cnyAmount: 750.00,
  serviceFee: 12.30,
  feeLabel: '[1.64%]',
  totalCNY: 762.30
}
```

### 3. 创建订单
```javascript
// 发送到后端
{
  payType: 'USDT',
  amount: 100,
  address: 'TxxxxxxxxxxxxxxxxxxxxxxxxxxxYYY',
  paymentMethod: 'wechat',
  totalCNY: 762.30,
  serviceFee: 12.30,
  email: '123456789@telegram.user',
  telegramId: '123456789'
}
```

### 4. 选择支付方式
```
✅ 订单已创建
订单号：ORD1234567890

💳 请选择支付方式：
[💳 微信支付] [💳 支付宝]
```

### 5. 生成支付二维码
```
📱 请使用微信扫码支付

订单号：ORD1234567890
金额：762.30 CNY

⏰ 支付后请等待 2-10 分钟
💬 完成后会自动通知您

[🌐 浏览器支付]
[🔄 刷新状态]
[« 返回主菜单]
```

## 测试步骤

### 1. 重启服务
```bash
pm2 restart easypay
```

### 2. 测试 USDT 代付
1. 发送 `/start` 命令
2. 点击 "💰 USDT 代付"
3. 输入数量：`10`
4. 输入地址：`TLSWMu...xXHsjx`
5. 点击 "✅ 确认" ← **应该成功创建订单**
6. 选择支付方式
7. 查看二维码

### 3. 测试 TRX 代付
1. 点击 "💰 TRX 代付"
2. 输入数量：`100`
3. 输入地址：`TLSWMu...xXHsjx`
4. 点击 "✅ 确认" ← **应该成功创建订单**
5. 选择支付方式
6. 查看二维码

## 错误处理

### 创建订单失败
```javascript
catch (error) {
  console.error('创建订单失败:', error);
  await ctx.reply(`❌ 创建订单失败：${error.response?.data?.error || error.message}`);
}
```

用户会看到：
```
❌ 创建订单失败：Payment validation failed: totalCNY: Path `totalCNY` is required.
```

修复后，用户会看到：
```
✅ 订单已创建
订单号：ORD1234567890

💳 请选择支付方式：
```

## 相关文件

- `server/bot/handlers/payment.js` - 支付处理器（已修复）
- `server/models/Payment.js` - Payment 模型
- `server/routes/payments.js` - 支付路由

## 注意事项

### 1. 费用计算
费用在前端（Bot）计算，确保与后端逻辑一致：
- 使用相同的阶梯费率规则
- 使用相同的汇率
- 使用相同的计算公式

### 2. 数据验证
后端会验证所有必需字段：
- `payType` - USDT 或 TRX
- `amount` - 大于 0
- `address` - TRON 地址格式
- `paymentMethod` - wechat 或 alipay
- `totalCNY` - 大于 0
- `serviceFee` - 大于等于 0

### 3. Session 管理
确保 session 数据完整：
```javascript
ctx.session.paymentData = {
  type: 'USDT',
  amount: 100,
  address: 'TxxxxxxxxxxxxxxxxxxxxxxxxxxxYYY',
  rate: 7.50,
  cnyAmount: 750.00,
  serviceFee: 12.30,
  feeLabel: '[1.64%]',
  totalCNY: 762.30
};
```

## 已修复的问题

- [x] 订单创建失败（缺少 totalCNY）
- [x] 订单创建失败（缺少 serviceFee）
- [x] 错误信息显示给用户

## 测试清单

- [ ] USDT 代付完整流程
- [ ] TRX 代付完整流程
- [ ] 费用计算正确
- [ ] 订单创建成功
- [ ] 支付二维码生成
- [ ] 支付通知接收
- [ ] 代付完成通知

---

**修复时间：** 2026-02-05
**状态：** 已修复，待测试
