# 支付二维码转圈问题排查指南

## 问题现象
提交订单后，支付弹窗显示，但二维码一直显示加载动画（转圈），无法显示二维码。

## 可能原因

### 1. 支付平台配置未完成或错误
**检查方法:**
```bash
npm run test-payment
```

**需要配置的项目:**
- 支付API地址 (例: https://pay.abcdely.top)
- 商户ID
- API密钥
- 回调地址 (例: https://yourdomain.com/api/payments/notify)

**配置位置:** 后台管理 → 系统设置 → 支付配置

### 2. 支付平台API返回字段不匹配
**问题:** 支付平台返回的支付链接字段名可能不是 `pay_url` 或 `payUrl`

**解决方法:**
1. 运行测试脚本查看实际返回数据
2. 检查 `server/routes/payments.js` 第58行
3. 根据实际返回字段修改代码

**当前代码:**
```javascript
paymentUrl: paymentOrder.pay_url || paymentOrder.payUrl
```

**可能需要改为:**
```javascript
paymentUrl: paymentOrder.data?.pay_url || paymentOrder.pay_url || paymentOrder.payUrl
```

### 3. 支付平台API调用失败
**检查服务器日志:**
```bash
# 查看服务器控制台输出
# 应该会看到 "创建支付订单失败" 的错误信息
```

**常见错误:**
- 签名验证失败 (商户ID或API密钥错误)
- 网络连接超时
- API地址错误
- 参数格式不正确

### 4. 前端未正确接收支付链接
**检查浏览器控制台:**
1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 提交订单后查看输出

**应该看到:**
```
订单创建成功: {payment: {...}, paymentUrl: "https://...", orderId: "ORD..."}
```

**如果看到错误或 paymentUrl 为空，说明后端返回有问题**

## 排查步骤

### 第一步: 检查配置
```bash
npm run test-payment
```

如果显示配置不完整，请先在后台完成配置。

### 第二步: 查看测试结果
测试脚本会尝试创建一个0.01元的测试订单。

**成功的输出:**
```
✓ 支付订单创建成功！
订单号: TEST1234567890
支付链接: https://pay.example.com/...
```

**失败的输出:**
```
✗ 创建支付订单失败！
错误信息: ...
```

### 第三步: 检查返回数据结构
查看测试脚本输出的 "返回数据" 部分，确认支付链接的字段名。

**示例1 - 标准格式:**
```json
{
  "code": 200,
  "pay_url": "https://pay.example.com/..."
}
```

**示例2 - 嵌套格式:**
```json
{
  "code": 200,
  "data": {
    "pay_url": "https://pay.example.com/..."
  }
}
```

### 第四步: 修改代码适配返回格式
根据实际返回的数据结构，修改 `server/routes/payments.js`:

```javascript
// 如果是嵌套格式
paymentUrl: paymentOrder.data?.pay_url || paymentOrder.data?.payUrl

// 如果字段名不同，例如 payment_url
paymentUrl: paymentOrder.payment_url || paymentOrder.paymentUrl

// 如果是 url
paymentUrl: paymentOrder.url
```

### 第五步: 重启服务器
修改代码后，重启开发服务器:
```bash
# Ctrl+C 停止服务器
npm run dev
```

## 临时测试方案

如果支付平台暂时无法配置，可以使用模拟支付链接测试前端功能:

**修改 `server/routes/payments.js`:**
```javascript
// 在创建支付平台订单的 try 块中，临时返回测试链接
res.status(201).json({
  payment,
  paymentUrl: 'https://www.example.com/test-payment', // 测试链接
  orderId: orderId
});
```

这样可以先测试前端的二维码显示和轮询功能。

## 常见问题

### Q: 测试脚本显示配置完整，但创建订单失败
A: 可能是商户ID或API密钥错误，请联系支付平台确认。

### Q: 支付链接正常返回，但二维码不显示
A: 检查浏览器控制台是否有跨域错误或二维码生成API失败。

### Q: 二维码显示了，但扫码后无法支付
A: 检查支付链接是否有效，可以直接在浏览器打开测试。

### Q: 支付成功但订单状态不更新
A: 检查回调地址配置是否正确，以及服务器是否能接收到回调。

## 联系支持

如果以上方法都无法解决问题，请提供以下信息:
1. 测试脚本的完整输出
2. 浏览器控制台的错误信息
3. 服务器日志中的错误信息
4. 支付平台的API文档链接
