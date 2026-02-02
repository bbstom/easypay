# 支付方式配置说明

## 问题解决

如果遇到 **"支付方式(type)不存在"** 错误，说明：
1. 支付平台不支持该支付方式
2. 支付方式参数值不正确
3. 商户未开通该支付方式

## 支付方式映射

### 前端选择 → 后端参数

系统前端使用统一的支付方式标识，后端会根据API版本自动转换：

| 前端标识 | V1接口参数 | V2接口参数 | 说明 |
|---------|-----------|-----------|------|
| alipay  | alipay    | alipay    | 支付宝 |
| wechat  | wxpay     | wechat    | 微信支付 |
| qqpay   | qqpay     | qqpay     | QQ钱包 |
| bank    | bank      | bank      | 网银支付 |
| jdpay   | jdpay     | jdpay     | 京东支付 |
| unionpay| unionpay  | unionpay  | 银联支付 |

## V1接口支付方式

### 常见支付方式
```javascript
type: 'alipay'    // 支付宝
type: 'wxpay'     // 微信支付
type: 'qqpay'     // QQ钱包
type: 'bank'      // 网银支付
```

### 检查支持的支付方式
1. 登录商户后台
2. 查看"支付方式管理"
3. 确认已开通的支付方式

### 测试特定支付方式
修改测试脚本中的 `paymentMethod`:
```javascript
paymentMethod: 'alipay'  // 测试支付宝
paymentMethod: 'wechat'  // 测试微信（会转换为wxpay）
```

## V2接口支付方式

### 常见支付方式
```javascript
pay_type: 'alipay'    // 支付宝
pay_type: 'wechat'    // 微信支付
pay_type: 'qqpay'     // QQ钱包
pay_type: 'bank'      // 网银支付
```

## 当前配置

系统默认支持：
- ✅ 支付宝 (alipay)
- ✅ 微信支付 (wechat → wxpay for V1)

如需添加其他支付方式，请：
1. 确认支付平台支持
2. 在商户后台开通
3. 前端添加选择按钮
4. 后端已自动支持映射

## 调试步骤

### 1. 查看日志
运行测试时会显示：
```
V1接口 - 支付方式映射: wechat -> wxpay
V1接口 - 发送参数: { pid: '1007', type: 'wxpay', ... }
```

### 2. 确认支付方式
如果返回"支付方式不存在"：
- 检查商户后台是否开通该支付方式
- 尝试使用 `alipay` 测试
- 联系支付平台确认支持的type值

### 3. 测试不同支付方式
```bash
# 修改 server/scripts/testPaymentGateway.js
paymentMethod: 'alipay'   # 测试支付宝
paymentMethod: 'wechat'   # 测试微信

# 运行测试
npm run test-payment
```

## 常见错误

### 错误1: 支付方式(type)不存在
**原因:**
- 商户未开通该支付方式
- type参数值不正确
- 支付平台不支持该方式

**解决:**
1. 使用 `alipay` 测试（最常见）
2. 检查商户后台开通的支付方式
3. 查看支付平台文档确认type值

### 错误2: 签名错误
**原因:**
- MD5密钥不正确
- 参数拼接顺序错误

**解决:**
1. 检查MD5密钥是否正确
2. 查看日志中的"待签名字符串"
3. 对比支付平台文档的签名规则

### 错误3: 商户不存在
**原因:**
- 商户ID (PID) 不正确

**解决:**
1. 检查后台配置的商户ID
2. 确认是否使用正确的环境（测试/生产）

## 添加新支付方式

### 1. 前端添加按钮
编辑 `src/pages/PayPage.jsx`:
```jsx
<button onClick={() => setPaymentMethod('qqpay')}>
  <QQPayIcon />
  QQ钱包
</button>
```

### 2. 后端已自动支持
`server/services/paymentService.js` 已包含常见支付方式映射，无需修改。

### 3. 测试新支付方式
```bash
npm run test-payment
```

## 推荐配置

### 开发测试
- 使用 V1 接口
- 只开通支付宝 (alipay)
- 使用小额测试 (0.01元)

### 生产环境
- 使用 V2 接口（更安全）
- 开通支付宝 + 微信
- 配置真实回调地址

## 支付平台对接清单

- [ ] 确认API版本 (V1/V2)
- [ ] 获取商户ID
- [ ] 获取API密钥
- [ ] 确认支持的支付方式
- [ ] 开通所需支付方式
- [ ] 配置回调地址
- [ ] 测试支付流程
- [ ] 测试回调通知

## 技术支持

如果遇到问题：
1. 运行 `npm run test-payment` 查看详细日志
2. 检查商户后台的支付方式配置
3. 联系支付平台技术支持确认type参数值
4. 提供完整的错误日志和配置信息
