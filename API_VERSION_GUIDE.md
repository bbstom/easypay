# 支付平台 V1 vs V2 接口对比

## 概述

系统现在同时支持V1和V2两种支付接口，可以在后台设置中切换。

## V1 接口（MD5签名）

### 特点
- ✅ 简单易用
- ✅ 使用MD5签名算法
- ✅ 配置简单，只需要MD5密钥
- ⚠️  安全性相对较低

### 接口地址
- 创建订单: `submit.php`
- 查询订单: `api.php`

### 参数格式
```javascript
{
  pid: '商户ID',
  type: 'alipay', // 或 wxpay
  out_trade_no: '订单号',
  notify_url: '回调地址',
  return_url: '返回地址',
  name: '商品名称',
  money: '金额',
  sitename: '网站名称',
  sign: 'MD5签名',
  sign_type: 'MD5'
}
```

### 签名算法
```javascript
// 1. 参数按key排序
// 2. 拼接: key1=value1&key2=value2&...&MD5密钥
// 3. MD5加密
const signStr = 'money=10&name=测试&out_trade_no=ORD123&pid=1007&...' + 'YOUR_MD5_KEY';
const sign = md5(signStr);
```

### 返回格式
```json
{
  "code": 1,
  "msg": "success",
  "payurl": "https://pay.example.com/...",
  "trade_no": "平台订单号"
}
```

### 回调参数
```javascript
{
  out_trade_no: '订单号',
  trade_no: '平台订单号',
  trade_status: '1', // 1=成功
  money: '金额',
  sign: 'MD5签名'
}
```

## V2 接口（RSA签名）

### 特点
- ✅ 安全性高
- ✅ 使用RSA (SHA256WithRSA) 签名
- ✅ 支持更多功能（退款、代付等）
- ⚠️  配置复杂，需要RSA密钥对

### 接口地址
- 创建订单: `api/pay/create`
- 查询订单: `api/pay/query`

### 参数格式
```javascript
{
  merchant_id: '商户ID',
  out_trade_no: '订单号',
  amount: '金额',
  pay_type: 'alipay', // 或 wechat
  notify_url: '回调地址',
  return_url: '返回地址',
  subject: '商品标题',
  body: '商品描述',
  timestamp: 1234567890,
  sign: 'RSA签名'
}
```

### 签名算法
```javascript
// 1. 参数按key排序
// 2. 拼接: key1=value1&key2=value2&...
// 3. 使用商户私钥进行RSA签名
const signStr = 'amount=10&body=测试&merchant_id=1007&...';
const sign = crypto.createSign('SHA256')
  .update(signStr)
  .sign(privateKey, 'base64');
```

### 返回格式
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "pay_url": "https://pay.example.com/...",
    "trade_no": "平台订单号"
  }
}
```

### 回调参数
```javascript
{
  merchant_id: '商户ID',
  out_trade_no: '订单号',
  trade_no: '平台订单号',
  trade_status: 'success',
  amount: '金额',
  timestamp: 1234567890,
  sign: 'RSA签名'
}
```

## 配置指南

### V1 配置步骤

1. **登录商户后台**
   - 获取商户ID (PID)
   - 获取MD5密钥

2. **系统后台配置**
   - API版本: 选择 `V1 (MD5签名)`
   - 支付API地址: `https://pay.abcdely.top`
   - 商户ID: 填写PID
   - API密钥: 填写MD5密钥
   - 回调地址: `https://yourdomain.com/api/payments/notify`

3. **测试**
   ```bash
   npm run test-payment
   ```

### V2 配置步骤

1. **登录商户后台**
   - 进入 **个人资料** → **API信息**
   - 点击 **【生成商户RSA密钥对】**
   - 保存 **商户私钥** 和 **平台公钥**

2. **系统后台配置**
   - API版本: 选择 `V2 (RSA签名)`
   - 支付API地址: `https://pay.abcdely.top`
   - 商户ID: 填写merchant_id
   - 商户私钥: 粘贴完整的RSA私钥（包含BEGIN和END标记）
   - 平台公钥: 粘贴完整的RSA公钥
   - 回调地址: `https://yourdomain.com/api/payments/notify`

3. **测试**
   ```bash
   npm run test-payment
   ```

## 如何选择版本

### 使用 V1 的场景
- ✅ 快速测试和开发
- ✅ 简单的支付需求
- ✅ 不需要高级功能
- ✅ 支付平台只提供V1接口

### 使用 V2 的场景
- ✅ 生产环境
- ✅ 需要更高的安全性
- ✅ 需要退款、代付等高级功能
- ✅ 支付平台推荐使用V2

## 切换版本

### 从 V1 切换到 V2
1. 在商户后台生成RSA密钥对
2. 在系统后台切换API版本为V2
3. 填写商户私钥和平台公钥
4. 测试支付功能

### 从 V2 切换到 V1
1. 在系统后台切换API版本为V1
2. 将商户私钥改为MD5密钥
3. 测试支付功能

## 常见问题

### Q1: V1和V2可以同时使用吗？
A: 不可以。系统同一时间只能使用一种版本。

### Q2: 切换版本需要重启服务器吗？
A: 不需要。配置保存后立即生效。

### Q3: V1的MD5密钥和V2的RSA私钥是一样的吗？
A: 不一样。V1使用简单的字符串密钥，V2使用RSA密钥对。

### Q4: 如何知道应该使用哪个版本？
A: 查看支付平台商户后台的API文档，或联系技术支持。

### Q5: 测试脚本支持两个版本吗？
A: 是的。测试脚本会自动根据配置的版本进行测试。

## 技术实现

### 代码结构
```
server/services/paymentService.js
├── createPaymentOrder()      // 自动选择版本
├── createPaymentOrderV1()    // V1实现
├── createPaymentOrderV2()    // V2实现
├── generateMD5Sign()         // MD5签名
├── generateRSASign()         // RSA签名
├── verifyMD5Sign()          // 验证MD5签名
└── verifyRSASign()          // 验证RSA签名
```

### 版本检测
```javascript
const settings = await Settings.findOne();
if (settings.paymentApiVersion === 'v2') {
  // 使用V2接口
} else {
  // 使用V1接口
}
```

## 测试结果示例

### V1 成功输出
```
✓ 支付平台配置完整
正在创建测试订单...
V1接口 - 发送参数: { pid: '1007', type: 'alipay', ... }
MD5待签名字符串: money=0.01&name=测试订单&...YOUR_KEY
MD5签名结果: abc123def456...
V1接口 - 响应状态: 200
V1接口 - 响应数据: { code: 1, payurl: "https://..." }
✓ 支付订单创建成功！
✓ 支付链接: https://pay.example.com/...
```

### V2 成功输出
```
✓ 支付平台配置完整
正在创建测试订单...
V2接口 - 发送参数: { merchant_id: '1007', amount: 0.01, ... }
RSA待签名字符串: amount=0.01&body=支付网关测试&...
RSA签名结果: XYZ789ABC123...
V2接口 - 响应状态: 200
V2接口 - 响应数据: { code: 0, data: { pay_url: "https://..." } }
✓ 支付订单创建成功！
✓ 支付链接: https://pay.example.com/...
```

## 总结

- ✅ 系统完整支持V1和V2两种接口
- ✅ 可以在后台随时切换版本
- ✅ 自动适配不同的参数格式和签名算法
- ✅ 统一的测试工具支持两种版本
- ✅ 详细的日志输出便于调试

根据你的支付平台实际情况选择合适的版本即可！
