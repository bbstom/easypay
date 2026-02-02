# CatFee API 认证说明

## 重要更新

CatFee API 使用 **HMAC-SHA256 签名认证**，不是简单的 Bearer Token。

## 认证方式

### 1. API Key 和 Secret

在 CatFee 平台注册后，您会获得：
- **API Key**: 用于识别您的身份
- **API Secret**: 用于生成签名（保密）

### 2. 签名生成

每个请求都需要生成签名：

```javascript
// 1. 生成时间戳（ISO 8601 格式）
const timestamp = new Date().toISOString();

// 2. 构建签名字符串
const signString = timestamp + method + requestPath;
// 例如: "2025-01-30T12:00:00.000ZPOST/v1/order?quantity=65000&receiver=TXxx&duration=1h"

// 3. 使用 HMAC-SHA256 生成签名
const signature = crypto.createHmac('sha256', API_SECRET)
                       .update(signString)
                       .digest('base64');
```

### 3. 请求头

每个请求必须包含以下 headers：

```javascript
{
  'Content-Type': 'application/json',
  'CF-ACCESS-KEY': API_KEY,
  'CF-ACCESS-SIGN': signature,
  'CF-ACCESS-TIMESTAMP': timestamp
}
```

## 配置格式

在系统中，API Key 和 Secret 需要以特定格式保存：

```
api_key:api_secret
```

例如：
```
abc123def456:xyz789secret
```

## 系统实现

### 后端 (catfeeService.js)

```javascript
// 设置 API Key
catfeeService.setApiKey('api_key:api_secret');

// 自动处理签名和认证
const result = await catfeeService.buyEnergy(address, 65000, '1h');
```

### 前端配置

在"钱包配置" → "资源配置" → "CatFee 模式"中：

1. 输入格式：`api_key:api_secret`
2. 系统会自动分离 Key 和 Secret
3. Secret 仅在后端使用，不会暴露到前端

## API 端点

### 基础 URL
```
https://api.catfee.io
```

### 主要端点

1. **购买能量**
   - 方法: POST
   - 路径: `/v1/order`
   - 参数: `quantity`, `receiver`, `duration`

2. **查询订单**
   - 方法: GET
   - 路径: `/v1/order/{order_id}`

3. **获取价格**
   - 方法: GET
   - 路径: `/v1/price`
   - 参数: `quantity`, `duration`

4. **获取余额**
   - 方法: GET
   - 路径: `/v1/account/balance`

## 参数说明

### quantity (能量数量)
- 类型: 字符串
- 示例: "65000", "131000"
- 说明: 需要购买的能量数量

### receiver (接收地址)
- 类型: 字符串
- 示例: "TXxx...xxx"
- 说明: 接收能量的 TRON 地址

### duration (租赁时长)
- 类型: 字符串
- 可选值: "1h", "3h"
- 说明: 能量的有效期

## 错误处理

常见错误：

1. **签名错误**
   - 检查 API Secret 是否正确
   - 确认时间戳格式正确
   - 验证签名字符串构建是否正确

2. **认证失败**
   - 检查 API Key 是否有效
   - 确认 Key 和 Secret 没有混淆

3. **参数错误**
   - 确认参数类型正确（字符串 vs 数字）
   - 检查必填参数是否完整

## 安全建议

1. **保护 Secret**
   - 不要在前端代码中暴露 API Secret
   - 不要提交到版本控制系统
   - 定期更换 Secret

2. **IP 白名单**
   - 在 CatFee 平台配置 IP 白名单
   - 限制只有服务器 IP 可以调用

3. **监控使用**
   - 定期检查 API 调用记录
   - 监控异常调用行为

## 测试

使用测试脚本验证配置：

```bash
node server/scripts/testCatFee.js
```

测试内容：
- ✅ 获取账户余额
- ✅ 获取能量价格
- ✅ 购买能量（需要 --confirm 参数）

## 参考文档

- [CatFee 官方文档](https://docs.catfee.io)
- [Node.js 调用示例](https://docs.catfee.io/en/getting-started/buy-energy-via-api-on-catfee/nodejs)
- [API 认证说明](https://docs.catfee.io/en/getting-started/buy-energy-via-api-on-catfee/api-overview)

## 更新日志

### 2025-01-30
- ✅ 修正认证方式为 HMAC-SHA256 签名
- ✅ 更新 API Key 格式为 "api_key:api_secret"
- ✅ 修正请求头格式
- ✅ 更新参数类型（duration 为字符串）
- ✅ 完善错误处理
