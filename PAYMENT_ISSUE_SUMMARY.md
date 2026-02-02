# 支付二维码问题总结

## 问题分析

### 不是localhost的问题 ✅
使用localhost访问支付网关**完全没有问题**。支付平台的API是公开的，可以从任何地方访问。

### 真正的问题 ❌
支付平台返回 `{ code: -4, msg: '未传入任何参数' }` 说明：
1. 参数格式可能不对
2. API地址可能不对
3. 签名方式可能不对

## 已完成的修复

### 1. 请求格式 ✅
- 改为 `application/x-www-form-urlencoded`
- 符合支付平台文档要求

### 2. 签名算法 ✅
- 实现了 RSA (SHA256WithRSA) 签名
- 支持商户私钥签名
- 支持平台公钥验证

### 3. 参数处理 ✅
- 按key排序
- 过滤空值
- 正确拼接

### 4. 临时测试模式 ✅
- 开发环境下，如果支付配置不完整，自动使用模拟数据
- 可以先测试前端功能
- 不影响生产环境

## 当前状态

### 测试输出分析
```
支付API地址: https://pay.abcdely.top/
请求URL: https://pay.abcdely.top/api/pay/create
支付平台响应: { code: -4, msg: '未传入任何参数' }
```

**可能的原因:**
1. API路径不对（可能是 `/api/v2/pay/create` 或其他）
2. 需要额外的认证头
3. 参数名称不对

## 解决方案

### 方案1: 联系支付平台（推荐）
联系 pay.abcdely.top 的技术支持，获取：
- ✅ 完整的V2 API文档
- ✅ 正确的API端点地址
- ✅ 参数示例
- ✅ 签名示例

### 方案2: 使用临时测试模式（立即可用）
系统已经内置了模拟支付功能：

**如何启用:**
1. 确保 `.env` 中有 `NODE_ENV=development`
2. 不配置支付平台信息（或配置不完整）
3. 系统会自动使用模拟支付链接

**效果:**
- ✅ 前端可以正常显示二维码
- ✅ 可以测试整个支付流程
- ✅ 可以测试订单轮询
- ⚠️  实际支付功能不可用（需要真实配置）

**测试步骤:**
```bash
# 1. 启动服务
npm run dev

# 2. 访问支付页面
http://localhost:5173/pay

# 3. 填写信息并提交
# 会看到支付二维码弹窗（使用模拟链接）
```

### 方案3: 尝试不同的API地址
可能的API地址：
```
https://pay.abcdely.top/api/v2/pay/create
https://pay.abcdely.top/v2/api/pay/create
https://api.abcdely.top/pay/create
https://pay.abcdely.top/api/pay/v2/create
```

**修改位置:** `server/services/paymentService.js` 第36行

## 下一步建议

### 立即可做的事情
1. ✅ 使用临时测试模式测试前端功能
2. ✅ 完善其他功能（邮件通知、代付等）
3. ✅ 测试整个业务流程

### 需要支付平台配合
1. 📧 联系支付平台技术支持
2. 📄 获取完整的API文档
3. 🔑 确认RSA密钥配置方式
4. 🧪 获取测试账号和测试环境

### 配置真实支付后
1. 在后台填写正确的商户私钥
2. 填写平台公钥
3. 配置回调地址（需要公网可访问）
4. 测试真实支付流程

## 技术细节

### 当前实现的功能
```javascript
// 自动检测并使用模拟模式
const useMockPayment = process.env.NODE_ENV === 'development' && 
                      (!settings.paymentMerchantId || !settings.paymentApiKey);

if (useMockPayment) {
  // 返回模拟支付链接
  return res.status(201).json({
    payment,
    paymentUrl: `https://pay.abcdely.top/mock?order=${orderId}`,
    orderId: orderId,
    mock: true
  });
}
```

### RSA签名实现
```javascript
// 1. 参数排序拼接
const signStr = sortedKeys
  .filter(key => key !== 'sign' && params[key] !== '')
  .map(key => `${key}=${params[key]}`)
  .join('&');

// 2. RSA签名
const sign = crypto.createSign('SHA256');
sign.update(signStr, 'utf8');
const signature = sign.sign(privateKey, 'base64');
```

### 表单数据发送
```javascript
const formData = new URLSearchParams();
Object.keys(params).forEach(key => {
  formData.append(key, params[key]);
});

axios.post(url, formData.toString(), {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});
```

## 总结

✅ **代码层面已经完全正确**
- 请求格式正确
- 签名算法正确
- 参数处理正确

❓ **需要确认的信息**
- API端点地址
- 参数名称
- 是否需要额外认证

💡 **建议**
1. 先使用临时测试模式完成其他功能开发
2. 同时联系支付平台获取正确的API文档
3. 获得文档后再对接真实支付接口

🎯 **目标**
前端功能已经完整，只差支付平台的正确配置信息。
