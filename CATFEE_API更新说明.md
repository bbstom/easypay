# CatFee API 更新说明

## 更新时间
2025-01-30

## 更新内容

### 1. 修正 API 认证方式 ✅

**之前（错误）**:
- 使用 Bearer Token 认证
- 请求头: `Authorization: Bearer {api_key}`

**现在（正确）**:
- 使用 HMAC-SHA256 签名认证
- 请求头:
  ```
  CF-ACCESS-KEY: {api_key}
  CF-ACCESS-SIGN: {signature}
  CF-ACCESS-TIMESTAMP: {timestamp}
  ```

### 2. API Key 格式更新 ✅

**配置格式**:
```
api_key:api_secret
```

**示例**:
```
abc123def456:xyz789secret
```

**说明**:
- 冒号前面是 API Key
- 冒号后面是 API Secret（用于签名）
- 系统会自动分离并使用

### 3. 参数类型修正 ✅

**duration (租赁时长)**:
- 之前: 数字类型 `1`, `3`
- 现在: 字符串类型 `"1h"`, `"3h"`

**quantity (能量数量)**:
- 类型: 字符串
- 示例: `"65000"`, `"131000"`

### 4. 能量价格更新 ✅

**默认配置调整**:
- 首次转账（无 U）: 32,000 → **131,000** 能量
- 正常转账（有 U）: 65,000 能量（不变）
- 转账租赁金额（无 U）: 5 TRX → **20 TRX**

## 技术实现

### 签名生成算法

```javascript
// 1. 生成时间戳
const timestamp = new Date().toISOString();

// 2. 构建签名字符串
const signString = timestamp + method + requestPath;
// 例如: "2025-01-30T12:00:00.000ZPOST/v1/order?quantity=65000&receiver=TXxx&duration=1h"

// 3. 生成签名
const signature = crypto.createHmac('sha256', apiSecret)
                       .update(signString)
                       .digest('base64');
```

### 请求示例

```javascript
const axios = require('axios');
const crypto = require('crypto');

// API 配置
const API_KEY = 'your_api_key';
const API_SECRET = 'your_api_secret';
const BASE_URL = 'https://api.catfee.io';

// 生成签名
const timestamp = new Date().toISOString();
const method = 'POST';
const path = '/v1/order';
const queryParams = {
  quantity: '65000',
  receiver: 'TXxx...xxx',
  duration: '1h'
};

const queryString = new URLSearchParams(queryParams).toString();
const requestPath = `${path}?${queryString}`;
const signString = timestamp + method + requestPath;
const signature = crypto.createHmac('sha256', API_SECRET)
                       .update(signString)
                       .digest('base64');

// 发送请求
const response = await axios({
  url: BASE_URL + requestPath,
  method: method,
  headers: {
    'Content-Type': 'application/json',
    'CF-ACCESS-KEY': API_KEY,
    'CF-ACCESS-SIGN': signature,
    'CF-ACCESS-TIMESTAMP': timestamp
  }
});
```

## 更新的文件

### 后端
- ✅ `server/services/catfeeService.js` - 完全重写，使用正确的认证方式
- ✅ `server/services/tronService.js` - 更新 duration 参数格式
- ✅ `server/models/Settings.js` - 更新默认能量值
- ✅ `server/routes/wallet.js` - 更新默认值
- ✅ `server/scripts/testCatFee.js` - 更新测试脚本

### 前端
- ✅ `src/pages/WalletConfigPage.jsx` - 更新 API Key 输入提示和默认值

### 文档
- ✅ `CATFEE_API认证说明.md` - 新增认证详细说明
- ✅ `CATFEE_API更新说明.md` - 本文档
- ✅ `CATFEE_集成指南.md` - 更新认证说明
- ✅ `能量价格更新说明.md` - 价格变化说明

## 配置步骤

### 1. 获取 API 凭证

访问 [CatFee 官网](https://catfee.io) 注册账号并获取：
- API Key
- API Secret

### 2. 配置系统

在"钱包配置" → "资源配置" → "CatFee 模式"中：

1. 输入 API Key，格式为：
   ```
   your_api_key:your_api_secret
   ```

2. 配置能量数量：
   - 首次转账：131000（建议）
   - 正常转账：65000（建议）

3. 选择租赁时长：
   - 1 小时（推荐）
   - 3 小时

4. 保存配置

### 3. 测试配置

运行测试脚本验证：

```bash
node server/scripts/testCatFee.js
```

测试内容：
- ✅ 获取账户余额
- ✅ 获取能量价格
- ✅ 购买能量（需要 --confirm）

## 常见问题

### Q1: 为什么需要 API Secret？

A: CatFee 使用 HMAC-SHA256 签名认证，需要 Secret 来生成签名，确保请求的安全性和完整性。

### Q2: API Key 格式错误怎么办？

A: 确保格式为 `api_key:api_secret`，中间用冒号分隔，不要有空格。

### Q3: 签名验证失败？

A: 检查以下几点：
- API Secret 是否正确
- 时间戳格式是否为 ISO 8601
- 签名字符串构建是否正确
- 请求路径是否包含完整的查询参数

### Q4: 旧的配置还能用吗？

A: 不能。必须更新为新的格式：
- 旧格式: `api_key`
- 新格式: `api_key:api_secret`

## 安全建议

1. **保护 API Secret**
   - 不要在前端暴露
   - 不要提交到版本控制
   - 定期更换

2. **使用 IP 白名单**
   - 在 CatFee 平台配置服务器 IP
   - 限制访问来源

3. **监控使用情况**
   - 定期检查 API 调用记录
   - 监控异常行为

## 参考文档

- [CatFee 官方文档](https://docs.catfee.io)
- [Node.js 调用示例](https://docs.catfee.io/en/getting-started/buy-energy-via-api-on-catfee/nodejs)
- [API 认证说明](https://docs.catfee.io/en/getting-started/buy-energy-via-api-on-catfee/api-overview)
- [CATFEE_API认证说明.md](./CATFEE_API认证说明.md)

## 迁移检查清单

- [ ] 获取 API Key 和 Secret
- [ ] 更新配置格式为 `api_key:api_secret`
- [ ] 测试余额查询
- [ ] 测试价格查询
- [ ] 测试能量购买（小额测试）
- [ ] 验证能量到账
- [ ] 更新生产环境配置

## 完成状态

✅ 所有代码已更新
✅ 所有文档已更新
✅ 测试脚本已更新
✅ 默认配置已更新

系统现在使用正确的 CatFee API 认证方式，可以正常购买能量。
