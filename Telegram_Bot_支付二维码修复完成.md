# Telegram Bot 支付二维码修复完成

## 问题描述

用户选择支付方式后，生成二维码失败，错误信息：
```
生成支付二维码失败: Error: String required as first argument
```

## 问题原因

1. **paymentUrl 未保存**：在 `confirmPayment` 函数中，只保存了 `response.data.payment` 对象，但没有保存 `response.data.paymentUrl`

2. **QRCode 参数无效**：`QRCode.toBuffer()` 需要字符串参数，但 `order.paymentUrl` 是 undefined

## 后端 API 返回结构

```javascript
// POST /api/payments 返回
{
  payment: {
    _id: '...',
    platformOrderId: 'ORD1234567890',
    payType: 'USDT',
    amount: 100,
    totalCNY: 762.30,
    // ... 其他字段
  },
  paymentUrl: 'https://pay.abcdely.top/pay/qrcode/2026020516361961204/',
  orderId: 'ORD1234567890'
}
```

## 修复内容

### 1. 保存完整订单信息

**文件**: `server/bot/handlers/payment.js`

#### 修复前
```javascript
const order = response.data.payment;
ctx.session.currentOrder = order;
```

#### 修复后
```javascript
// 保存完整的订单信息，包括 paymentUrl
const order = {
  ...response.data.payment,
  paymentUrl: response.data.paymentUrl
};

console.log('订单创建成功:', {
  orderId: order.platformOrderId,
  paymentUrl: order.paymentUrl
});

ctx.session.currentOrder = order;
```

### 2. 验证支付链接

#### 修复前
```javascript
const paymentUrl = order.paymentUrl;

// 直接生成二维码
const qrBuffer = await QRCode.toBuffer(paymentUrl, { ... });
```

#### 修复后
```javascript
const paymentUrl = order.paymentUrl;

// 验证支付链接
if (!paymentUrl || typeof paymentUrl !== 'string') {
  console.error('支付链接无效:', paymentUrl);
  await ctx.reply('❌ 支付链接无效，请重新创建订单');
  return;
}

console.log('支付链接:', paymentUrl);

// 生成二维码
const qrBuffer = await QRCode.toBuffer(paymentUrl, { ... });
```

## 完整流程

### 1. 创建订单
```javascript
// 用户点击"✅ 确认"
POST /api/payments
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

// 后端返回
{
  payment: { ... },
  paymentUrl: 'https://pay.abcdely.top/pay/qrcode/2026020516361961204/',
  orderId: 'ORD1234567890'
}
```

### 2. 保存订单信息
```javascript
const order = {
  _id: '...',
  platformOrderId: 'ORD1234567890',
  payType: 'USDT',
  amount: 100,
  totalCNY: 762.30,
  paymentUrl: 'https://pay.abcdely.top/pay/qrcode/2026020516361961204/' // ✅ 包含支付链接
};

ctx.session.currentOrder = order;
```

### 3. 选择支付方式
```
✅ 订单已创建
订单号：ORD1234567890

💳 请选择支付方式：
[💳 微信支付] [💳 支付宝]
```

### 4. 生成二维码
```javascript
// 用户点击"💳 微信支付"
const paymentUrl = order.paymentUrl; // ✅ 有值
console.log('支付链接:', paymentUrl);

// 生成二维码
const qrBuffer = await QRCode.toBuffer(paymentUrl, {
  width: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
});

// 发送图片
await ctx.replyWithPhoto({ source: qrBuffer }, { ... });
```

### 5. 用户收到二维码
```
📱 请使用微信扫码支付

订单号：ORD1234567890
金额：762.30 CNY

⏰ 支付后请等待 2-10 分钟
💬 完成后会自动通知您

🔗 或点击下方按钮在浏览器中支付

[🌐 浏览器支付]
[🔄 刷新状态]
[« 返回主菜单]
```

## 日志输出

### 成功情况
```
订单创建成功: {
  orderId: 'ORD1234567890',
  paymentUrl: 'https://pay.abcdely.top/pay/qrcode/2026020516361961204/'
}
支付链接: https://pay.abcdely.top/pay/qrcode/2026020516361961204/
📱 TG: callback_query - 1127ms
```

### 失败情况（修复前）
```
支付链接: undefined
生成支付二维码失败: Error: String required as first argument
📱 TG: callback_query - 945ms
```

### 失败情况（修复后）
```
支付链接无效: undefined
❌ 支付链接无效，请重新创建订单
```

## 错误处理

### 1. 支付链接无效
```javascript
if (!paymentUrl || typeof paymentUrl !== 'string') {
  console.error('支付链接无效:', paymentUrl);
  await ctx.reply('❌ 支付链接无效，请重新创建订单');
  return;
}
```

### 2. 二维码生成失败
```javascript
catch (error) {
  console.error('生成支付二维码失败:', error);
  await ctx.reply(`❌ 生成支付二维码失败：${error.message}`);
}
```

## 测试步骤

### 1. 重启服务
```bash
pm2 restart easypay
```

### 2. 完整测试流程
1. 发送 `/start` 命令
2. 点击 "💰 USDT 代付"
3. 输入数量：`10`
4. 输入地址：`TLSWMu...xXHsjx`
5. 点击 "✅ 确认"
6. 查看日志：应该显示 `订单创建成功` 和 `paymentUrl`
7. 点击 "💳 微信支付" 或 "💳 支付宝"
8. 查看日志：应该显示 `支付链接: https://...`
9. 应该收到二维码图片 ✅

### 3. 验证二维码
- 扫描二维码应该能打开支付页面
- 点击"🌐 浏览器支付"应该能打开支付页面
- 支付链接格式正确

## Session 数据结构

```javascript
ctx.session = {
  user: { ... },
  paymentData: {
    type: 'USDT',
    amount: 100,
    address: 'TxxxxxxxxxxxxxxxxxxxxxxxxxxxYYY',
    totalCNY: 762.30,
    serviceFee: 12.30,
    rate: 7.50,
    cnyAmount: 750.00,
    feeLabel: '[1.64%]'
  },
  currentOrder: {
    _id: '...',
    platformOrderId: 'ORD1234567890',
    payType: 'USDT',
    amount: 100,
    address: 'TxxxxxxxxxxxxxxxxxxxxxxxxxxxYYY',
    totalCNY: 762.30,
    serviceFee: 12.30,
    paymentUrl: 'https://pay.abcdely.top/pay/qrcode/2026020516361961204/', // ✅ 关键
    // ... 其他字段
  },
  state: 'select_payment_method'
}
```

## 相关文件

- `server/bot/handlers/payment.js` - 支付处理器（已修复）
- `server/routes/payments.js` - 支付路由（返回 paymentUrl）
- `node_modules/qrcode` - QRCode 库

## 注意事项

### 1. 数据完整性
确保保存后端返回的所有必要数据：
- `payment` - 订单对象
- `paymentUrl` - 支付链接
- `orderId` - 订单号

### 2. 类型验证
在使用数据前验证类型：
```javascript
if (!paymentUrl || typeof paymentUrl !== 'string') {
  // 处理错误
}
```

### 3. 日志记录
添加详细日志便于调试：
```javascript
console.log('订单创建成功:', {
  orderId: order.platformOrderId,
  paymentUrl: order.paymentUrl
});
```

## 已修复的问题

- [x] 支付链接未保存
- [x] QRCode 参数无效
- [x] 二维码生成失败
- [x] 添加支付链接验证
- [x] 添加详细日志

## 测试清单

- [ ] USDT 代付 - 微信支付
- [ ] USDT 代付 - 支付宝
- [ ] TRX 代付 - 微信支付
- [ ] TRX 代付 - 支付宝
- [ ] 二维码可扫描
- [ ] 浏览器支付链接可用
- [ ] 支付成功通知
- [ ] 代付完成通知

---

**修复时间：** 2026-02-05
**状态：** 已修复，待测试
