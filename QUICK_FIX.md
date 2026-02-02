# 支付二维码转圈 - 快速修复指南

## 立即检查

### 1. 运行测试脚本
```bash
npm run test-payment
```

### 2. 查看服务器日志
提交订单后，在服务器控制台查看输出，应该看到：

```
正在创建支付订单: { orderId: 'ORD...', amount: 10.5, ... }
发送到支付平台的参数: { merchant_id: '...', ... }
支付平台响应状态: 200
支付平台响应数据: { ... }
支付链接: https://...
```

### 3. 查看浏览器控制台
打开浏览器开发者工具 (F12)，提交订单后查看：

```
订单创建成功: { payment: {...}, paymentUrl: "https://...", orderId: "ORD..." }
```

## 常见问题及解决方案

### 问题1: 配置未完成
**现象:** 测试脚本显示 "支付平台配置不完整"

**解决:**
1. 登录后台管理: http://localhost:5173/admin
2. 进入"系统设置" → "支付配置"
3. 填写以下信息:
   - 支付API地址: `https://pay.abcdely.top`
   - 商户ID: (从支付平台获取)
   - API密钥: (从支付平台获取)
   - 回调地址: `http://yourdomain.com/api/payments/notify`

### 问题2: 支付平台返回错误
**现象:** 服务器日志显示 "支付平台API调用失败"

**可能原因:**
- 商户ID或API密钥错误
- 签名算法不匹配
- 支付平台服务异常

**解决:**
1. 检查商户ID和API密钥是否正确
2. 联系支付平台技术支持确认API文档
3. 查看支付平台是否有维护公告

### 问题3: 未返回支付链接
**现象:** 服务器日志显示 "支付平台未返回支付链接"

**解决:**
查看服务器日志中的 "支付平台返回数据"，找到实际的字段名，然后修改代码。

**示例:** 如果返回数据是:
```json
{
  "code": 0,
  "data": {
    "qrcode_url": "https://..."
  }
}
```

修改 `server/routes/payments.js` 第58行:
```javascript
const paymentUrl = paymentOrder.data?.qrcode_url;
```

### 问题4: 网络连接问题
**现象:** 服务器日志显示 "timeout" 或 "ECONNREFUSED"

**解决:**
1. 检查服务器网络连接
2. 确认支付API地址是否正确
3. 检查防火墙设置

## 临时解决方案

如果需要先测试前端功能，可以使用模拟数据:

**修改 `server/routes/payments.js` (临时):**

在第47行后添加:
```javascript
// 临时测试代码 - 生产环境请删除
if (process.env.NODE_ENV === 'development') {
  return res.status(201).json({
    payment,
    paymentUrl: 'https://www.example.com/test-payment',
    orderId: orderId
  });
}
```

这样可以先看到二维码，测试前端功能。

## 需要帮助？

如果以上方法都无法解决，请提供:
1. `npm run test-payment` 的完整输出
2. 服务器控制台的日志
3. 浏览器控制台的错误信息

将这些信息发送给技术支持。
